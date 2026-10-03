import pool from '../config/db.js';
import { AppError } from '../utils/appError.js';
import { findUserById } from '../models/userModel.js';
import { geocodeAddress } from './geocodingService.js';
import { createNotification } from '../models/notificationModel.js';
import {
  cancelDonation,
  createDonation,
  createDonationClaim,
  findClaimByDonationId,
  findDonationById,
  findDonationDetailsById,
  findDonationWithOwner,
  findNearbyDonations,
  listClaimsByNgo,
  listDonations,
  listDonationsByDonor,
  updateDonation
} from '../models/donationModel.js';

const DONOR_EDITABLE_STATUSES = new Set(['AVAILABLE']);
const ALLOWED_NEARBY_RADII = new Set([1, 5, 10, 20, 50]);

function normalizeDonationPayload(payload) {
  return {
    food_name: payload.food_name?.trim(),
    food_category: payload.food_category?.trim(),
    description: payload.description?.trim() || null,
    quantity: Number(payload.quantity),
    quantity_unit: payload.quantity_unit?.trim(),
    estimated_meals: Number.parseInt(payload.estimated_meals, 10),
    preparation_time: payload.preparation_time || null,
    expiry_time: payload.expiry_time,
    pickup_start_time: payload.pickup_start_time || null,
    pickup_end_time: payload.pickup_end_time || null,
    address: payload.address?.trim(),
    city: payload.city?.trim() || null,
    state: payload.state?.trim() || null,
    latitude: Number(payload.latitude),
    longitude: Number(payload.longitude),
    image_url: payload.image_url?.trim() || null
  };
}

function validateDonationPayload(payload) {
  const requiredFields = [
    'food_name',
    'food_category',
    'quantity',
    'quantity_unit',
    'estimated_meals',
    'expiry_time',
    'address'
  ];

  const missingField = requiredFields.find((field) => payload[field] === undefined || payload[field] === null || String(payload[field]).trim() === '');
  if (missingField) {
    throw new AppError(`${missingField} is required`, 422);
  }

  if (Number.isNaN(Number(payload.quantity)) || Number(payload.quantity) <= 0) {
    throw new AppError('Quantity must be a positive number', 422);
  }

  if (Number.isNaN(Number.parseInt(payload.estimated_meals, 10)) || Number.parseInt(payload.estimated_meals, 10) <= 0) {
    throw new AppError('Estimated meals must be a positive integer', 422);
  }
}

async function resolveCoordinates(payload, geocodingService) {
  const hasLatitude = payload.latitude !== undefined && String(payload.latitude).trim() !== '';
  const hasLongitude = payload.longitude !== undefined && String(payload.longitude).trim() !== '';

  if (hasLatitude && hasLongitude) {
    const latitude = Number(payload.latitude);
    const longitude = Number(payload.longitude);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new AppError('Valid latitude and longitude are required', 422);
    }

    return { latitude, longitude };
  }

  const addressParts = [payload.address, payload.city, payload.state].filter(Boolean);
  const geocoded = await geocodingService.geocodeAddress(addressParts.join(', '));

  if (!geocoded) {
    throw new AppError('Latitude and longitude are required when address geocoding is unavailable', 422);
  }

  return {
    latitude: geocoded.latitude,
    longitude: geocoded.longitude
  };
}

export function createDonationService(dependencies = {}) {
  const userRepository = dependencies.userModel || { findUserById };
  const geocodingService = dependencies.geocodingService || { geocodeAddress };
  const notificationRepository = dependencies.notificationModel || { createNotification };
  const database = dependencies.db || pool;
  const donationRepository = dependencies.donationModel || {
    createDonation,
    findDonationById,
    findDonationDetailsById,
    findDonationWithOwner,
    listDonations,
    listDonationsByDonor,
    findNearbyDonations,
    updateDonation,
    cancelDonation,
    createDonationClaim,
    findClaimByDonationId,
    listClaimsByNgo
  };

  return {
    async createDonation(user, payload) {
      if (user.role !== 'DONOR') {
        throw new AppError('Only donors can create donations', 403);
      }

      validateDonationPayload(payload);

      const coordinates = await resolveCoordinates(payload, geocodingService);
      const normalized = normalizeDonationPayload({ ...payload, ...coordinates });
      const donationId = await donationRepository.createDonation({
        ...normalized,
        donor_id: user.id,
        status: 'AVAILABLE'
      });

      return donationRepository.findDonationById(donationId);
    },

    async listDonations(user, filters = {}) {
      if (user.role === 'DONOR') {
        return donationRepository.listDonationsByDonor(user.id, filters);
      }

      return donationRepository.listDonations(filters);
    },

    async getDonationById(user, id) {
      const donation = await donationRepository.findDonationDetailsById(id);
      if (!donation) {
        throw new AppError('Donation not found', 404);
      }

      if (user.role === 'DONOR' && donation.donor_id !== user.id) {
        throw new AppError('Forbidden', 403);
      }

      return donation;
    },

    async updateDonation(user, id, payload) {
      const donation = await donationRepository.findDonationWithOwner(id);
      if (!donation) {
        throw new AppError('Donation not found', 404);
      }

      if (user.role !== 'DONOR' || donation.donor_id !== user.id) {
        throw new AppError('Forbidden', 403);
      }

      if (!DONOR_EDITABLE_STATUSES.has(donation.status)) {
        throw new AppError('Only available donations can be updated', 409);
      }

      const coordinates = await resolveCoordinates(payload, geocodingService);
      const normalized = normalizeDonationPayload({ ...payload, ...coordinates });
      const updatedDonation = await donationRepository.updateDonation(id, normalized);
      return updatedDonation;
    },

    async cancelDonation(user, id) {
      const donation = await donationRepository.findDonationWithOwner(id);
      if (!donation) {
        throw new AppError('Donation not found', 404);
      }

      if (user.role !== 'DONOR' || donation.donor_id !== user.id) {
        throw new AppError('Forbidden', 403);
      }

      if (!DONOR_EDITABLE_STATUSES.has(donation.status)) {
        throw new AppError('Only available donations can be cancelled', 409);
      }

      return donationRepository.cancelDonation(id);
    },

    async claimDonation(user, donationId) {
      if (!['NGO', 'SHELTER', 'ADMIN'].includes(user.role)) {
        throw new AppError('Only NGOs, Shelters, or Admins can claim donations', 403);
      }

      const donation = await donationRepository.findDonationDetailsById(donationId);
      if (!donation) {
        throw new AppError('Donation not found', 404);
      }

      if (donation.status !== 'AVAILABLE') {
        throw new AppError(`Donation cannot be claimed because it is currently ${donation.status}`, 409);
      }

      if (new Date(donation.expiry_time) <= new Date()) {
        throw new AppError('Donation has expired and cannot be claimed', 409);
      }

      const connection = typeof database?.getConnection === 'function' ? await database.getConnection() : null;

      try {
        if (connection) await connection.beginTransaction();

        const claimId = await donationRepository.createDonationClaim({
          donation_id: donationId,
          ngo_id: user.id
        }, connection);

        await donationRepository.updateDonation(donationId, { status: 'CLAIMED' }, connection);

        if (donation.donor_id && notificationRepository?.createNotification) {
          try {
            await notificationRepository.createNotification({
              user_id: donation.donor_id,
              title: 'Donation Claimed!',
              message: `${user.organization_name || user.name} has claimed your donation: ${donation.food_name}.`
            }, connection);
          } catch (e) {
            // Notification failure does not abort claim
          }
        }

        if (connection) await connection.commit();

        const updatedDonation = await donationRepository.findDonationDetailsById(donationId);
        return {
          claim_id: claimId,
          donation: updatedDonation
        };
      } catch (error) {
        if (connection) await connection.rollback();
        throw error;
      } finally {
        if (connection) connection.release();
      }
    },

    async listClaims(user, filters = {}) {
      if (!['NGO', 'SHELTER', 'ADMIN'].includes(user.role)) {
        throw new AppError('Forbidden', 403);
      }

      return donationRepository.listClaimsByNgo(user.id, filters);
    },

    async getDonorDashboardStats(user) {
      if (user.role !== 'DONOR') {
        throw new AppError('Forbidden', 403);
      }

      const donationsPage = await donationRepository.listDonationsByDonor(user.id, { page: 1, limit: 100 });
      const donations = donationsPage.data;

      return {
        totalDonations: donations.length,
        availableDonations: donations.filter((donation) => donation.status === 'AVAILABLE').length,
        claimedDonations: donations.filter((donation) => ['CLAIMED', 'PICKUP_ASSIGNED', 'PICKED_UP'].includes(donation.status)).length,
        deliveredDonations: donations.filter((donation) => donation.status === 'DELIVERED').length,
        cancelledDonations: donations.filter((donation) => donation.status === 'CANCELLED').length,
        recentDonations: donations.slice(0, 10)
      };
    },

    async getNearbyDonations(user, filters = {}) {
      if (!['NGO', 'SHELTER', 'VOLUNTEER', 'ADMIN'].includes(user.role)) {
        throw new AppError('Forbidden', 403);
      }

      const latitude = Number(filters.latitude);
      const longitude = Number(filters.longitude);

      if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
        throw new AppError('Valid latitude is required', 422);
      }

      if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new AppError('Valid longitude is required', 422);
      }

      const radiusKm = filters.radius === undefined || filters.radius === null || String(filters.radius).trim() === ''
        ? 10
        : Number(filters.radius);

      if (Number.isNaN(radiusKm) || !ALLOWED_NEARBY_RADII.has(radiusKm)) {
        throw new AppError('Radius must be one of 1, 5, 10, 20, or 50 km', 422);
      }

      const page = Math.max(Number.parseInt(filters.page || '1', 10), 1);
      const limit = Math.min(Math.max(Number.parseInt(filters.limit || '20', 10), 1), 100);

      const result = await donationRepository.findNearbyDonations({
        latitude,
        longitude,
        radiusKm,
        page,
        limit
      });

      return {
        data: result.data.map((donation) => ({
          ...donation,
          distance_km: Number(donation.distance_km)
        })),
        pagination: result.pagination
      };
    }
  };
}

export const donationService = createDonationService();

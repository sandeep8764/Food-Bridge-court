import { donationService as defaultDonationService } from '../services/donationService.js';

export function createDonationController(dependencies = {}) {
  const donationService = dependencies.donationService || defaultDonationService;

  return {
    async create(req, res, next) {
      try {
        const donation = await donationService.createDonation(req.user, req.body);
        res.status(201).json({ success: true, data: { donation } });
      } catch (error) {
        next(error);
      }
    },

    async list(req, res, next) {
      try {
        const result = await donationService.listDonations(req.user, req.query);
        res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
      } catch (error) {
        next(error);
      }
    },

    async details(req, res, next) {
      try {
        const donation = await donationService.getDonationById(req.user, req.params.id);
        res.status(200).json({ success: true, data: { donation } });
      } catch (error) {
        next(error);
      }
    },

    async update(req, res, next) {
      try {
        const donation = await donationService.updateDonation(req.user, req.params.id, req.body);
        res.status(200).json({ success: true, data: { donation } });
      } catch (error) {
        next(error);
      }
    },

    async remove(req, res, next) {
      try {
        const donation = await donationService.cancelDonation(req.user, req.params.id);
        res.status(200).json({ success: true, data: { donation } });
      } catch (error) {
        next(error);
      }
    },

    async claim(req, res, next) {
      try {
        const result = await donationService.claimDonation(req.user, req.params.id);
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },

    async listClaims(req, res, next) {
      try {
        const result = await donationService.listClaims(req.user, req.query);
        res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
      } catch (error) {
        next(error);
      }
    },

    async donorDashboard(req, res, next) {
      try {
        const stats = await donationService.getDonorDashboardStats(req.user);
        res.status(200).json({ success: true, data: stats });
      } catch (error) {
        next(error);
      }
    },

    async nearby(req, res, next) {
      try {
        const result = await donationService.getNearbyDonations(req.user, req.query);
        res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
      } catch (error) {
        next(error);
      }
    }
  };
}

export const donationController = createDonationController();

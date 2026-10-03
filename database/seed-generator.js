import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import IMPACT_FACTORS from '../server/src/config/impactFactors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, 'seed.sql');

const donationCount = Number.parseInt(process.argv[2] || '1000', 10);
const totalDonations = Number.isNaN(donationCount) || donationCount <= 0 ? 1000 : donationCount;

const cities = [
  { city: 'Delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { city: 'Noida', state: 'Uttar Pradesh', latitude: 28.5355, longitude: 77.3910 },
  { city: 'Gurgaon', state: 'Haryana', latitude: 28.4595, longitude: 77.0266 },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6692, longitude: 77.4538 },
  { city: 'Faridabad', state: 'Haryana', latitude: 28.4089, longitude: 77.3178 }
];

const foodCategories = [
  'Cooked Meals',
  'Bakery',
  'Fruits',
  'Vegetables',
  'Packaged Food',
  'Dairy',
  'Beverages',
  'Other'
];

const foodNames = {
  'Cooked Meals': ['Veg Thali', 'Rice and Curry', 'Pasta Tray', 'Mixed Meal Boxes', 'Paneer Rice Pack'],
  Bakery: ['Bread Loaves', 'Pav Buns', 'Croissants Box', 'Muffin Assortment', 'Pastry Tray'],
  Fruits: ['Mixed Seasonal Fruits', 'Bananas Crate', 'Apples Box', 'Papaya Pack', 'Orange Basket'],
  Vegetables: ['Mixed Vegetables', 'Potato Sack', 'Tomato Crate', 'Leafy Greens Box', 'Onion Bag'],
  'Packaged Food': ['Snacks Pack', 'Biscuits Carton', 'Ready Meals Pack', 'Noodles Carton', 'Cereal Boxes'],
  Dairy: ['Milk Packets', 'Curd Containers', 'Paneer Blocks', 'Cheese Packs', 'Butter Boxes'],
  Beverages: ['Juice Cartons', 'Water Bottles', 'Lassi Bottles', 'Tea Flask', 'Soft Drink Cans'],
  Other: ['Mixed Surplus Crates', 'Festival Donation Box', 'Assorted Food Pack', 'Event Leftovers', 'General Surplus Bag']
};

const quantityUnits = {
  'Cooked Meals': ['plates', 'trays', 'boxes'],
  Bakery: ['loaves', 'packs', 'trays'],
  Fruits: ['kg', 'crates', 'boxes'],
  Vegetables: ['kg', 'bags', 'crates'],
  'Packaged Food': ['packs', 'cartons', 'boxes'],
  Dairy: ['litres', 'packs', 'kg'],
  Beverages: ['litres', 'bottles', 'cans'],
  Other: ['packs', 'boxes', 'bags']
};

const donorOrganizations = [
  'Spice Garden Restaurant',
  'Urban Tiffin Hub',
  'Delight Caterers',
  'Green Leaf Banquets',
  'Harmony Kitchens',
  'Taste Junction',
  'EventServe India',
  'Royal Feast Caterers',
  'Fresh Bite Cafe',
  'Neighborhood Kitchen',
  'Sunrise Foods',
  'Metro Catering Co.',
  'Saffron Table',
  'City Feast Events',
  'Prana Foods',
  'Sagar Bhojanalaya',
  'Nourish Banquets',
  'Grain & Grace',
  'FoodCircle Events',
  'Basil Kitchen'
];

const ngoOrganizations = [
  'Asha Foundation',
  'Seva Trust',
  'Feed India NGO',
  'Annapurna Mission',
  'Hope Care Society',
  'Udaan Foundation',
  'Sankalp Welfare',
  'Nayi Disha Trust',
  'Sparsh NGO',
  'Khushi Seva'
];

const shelterOrganizations = [
  'Rahat Shelter',
  'Ghar Shelter Home',
  'Night Care Shelter',
  'Umeed Ashray',
  'Sanjeevani Shelter'
];

const volunteerNames = [
  'Aarav Sharma', 'Priya Verma', 'Rahul Mehta', 'Sneha Singh', 'Karan Malhotra',
  'Ananya Gupta', 'Rohit Kumar', 'Neha Joshi', 'Vikram Rana', 'Pooja Nair',
  'Aditya Chauhan', 'Simran Kaur', 'Nitin Bansal', 'Ishita Kapoor', 'Arjun Yadav',
  'Meera Iyer', 'Siddharth Jain', 'Riya Sethi', 'Harsh Vohra', 'Tanvi Bhatt'
];

const cityLatLng = (location) => ({
  latitude: Number((location.latitude + (Math.random() - 0.5) * 0.12).toFixed(7)),
  longitude: Number((location.longitude + (Math.random() - 0.5) * 0.12).toFixed(7))
});

const formatSqlString = (value) => `'${String(value).replace(/'/g, "''")}'`;
const formatSqlValue = (value) => (value === null || value === undefined ? 'NULL' : typeof value === 'number' ? value : formatSqlString(value));

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min, max, precision = 2) {
  return Number((min + Math.random() * (max - min)).toFixed(precision));
}

function randomDateInPast(daysBack = 15) {
  const now = Date.now();
  const offset = randomInt(1, daysBack) * 24 * 60 * 60 * 1000;
  return new Date(now - offset - randomInt(0, 10) * 60 * 60 * 1000);
}

function randomDateInFuture(hoursAheadMin = 2, hoursAheadMax = 72) {
  const now = Date.now();
  const offset = randomInt(hoursAheadMin, hoursAheadMax) * 60 * 60 * 1000;
  return new Date(now + offset);
}

function buildUsers() {
  const users = [];
  let idCounter = 1;

  const donorCities = ['Delhi', 'Noida', 'Gurgaon', 'Ghaziabad', 'Faridabad'];
  for (let i = 0; i < 20; i += 1) {
    const location = randomItem(cities);
    const coords = cityLatLng(location);
    users.push({
      id: idCounter,
      name: donorOrganizations[i],
      email: `donor${i + 1}@foodbridge.in`,
      password_hash: '$2a$10$seededhashdonor',
      phone: `9${randomInt(100000000, 999999999)}`,
      role: 'DONOR',
      organization_name: donorOrganizations[i],
      address: `${randomInt(1, 250)} ${location.city} Industrial Area`,
      city: donorCities[i % donorCities.length],
      state: location.state,
      country: 'India',
      latitude: coords.latitude,
      longitude: coords.longitude,
      profile_image: null,
      is_active: true
    });
    idCounter += 1;
  }

  for (let i = 0; i < 10; i += 1) {
    const location = randomItem(cities);
    const coords = cityLatLng(location);
    users.push({
      id: idCounter,
      name: `${ngoOrganizations[i]} Team`,
      email: `ngo${i + 1}@foodbridge.in`,
      password_hash: '$2a$10$seededhashngo',
      phone: `8${randomInt(100000000, 999999999)}`,
      role: 'NGO',
      organization_name: ngoOrganizations[i],
      address: `${randomInt(1, 180)} ${location.city} Sector`,
      city: location.city,
      state: location.state,
      country: 'India',
      latitude: coords.latitude,
      longitude: coords.longitude,
      profile_image: null,
      is_active: true
    });
    idCounter += 1;
  }

  for (let i = 0; i < 5; i += 1) {
    const location = randomItem(cities);
    const coords = cityLatLng(location);
    users.push({
      id: idCounter,
      name: `${shelterOrganizations[i]} Team`,
      email: `shelter${i + 1}@foodbridge.in`,
      password_hash: '$2a$10$seededhashshelter',
      phone: `7${randomInt(100000000, 999999999)}`,
      role: 'SHELTER',
      organization_name: shelterOrganizations[i],
      address: `${randomInt(1, 220)} ${location.city} Shelter Road`,
      city: location.city,
      state: location.state,
      country: 'India',
      latitude: coords.latitude,
      longitude: coords.longitude,
      profile_image: null,
      is_active: true
    });
    idCounter += 1;
  }

  for (let i = 0; i < 20; i += 1) {
    const location = randomItem(cities);
    const coords = cityLatLng(location);
    users.push({
      id: idCounter,
      name: volunteerNames[i],
      email: `volunteer${i + 1}@foodbridge.in`,
      password_hash: '$2a$10$seededhashvolunteer',
      phone: `9${randomInt(100000000, 999999999)}`,
      role: 'VOLUNTEER',
      organization_name: 'FoodBridge Volunteer Network',
      address: `${randomInt(1, 200)} ${location.city} Volunteer Colony`,
      city: location.city,
      state: location.state,
      country: 'India',
      latitude: coords.latitude,
      longitude: coords.longitude,
      profile_image: null,
      is_active: true
    });
    idCounter += 1;
  }

  users.push({
    id: idCounter,
    name: 'FoodBridge Admin',
    email: 'admin@foodbridge.in',
    password_hash: '$2a$10$seededhashadmin',
    phone: '9999999999',
    role: 'ADMIN',
    organization_name: 'FoodBridge Platform',
    address: 'Platform HQ',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    profile_image: null,
    is_active: true
  });

  return users;
}

function buildDonations(users, count) {
  const donors = users.filter((user) => user.role === 'DONOR');
  const donations = [];
  const statuses = [
    ...Array(35).fill('AVAILABLE'),
    ...Array(20).fill('CLAIMED'),
    ...Array(15).fill('PICKUP_ASSIGNED'),
    ...Array(10).fill('PICKED_UP'),
    ...Array(10).fill('DELIVERED'),
    ...Array(7).fill('EXPIRED'),
    ...Array(3).fill('CANCELLED')
  ];

  for (let i = 0; i < count; i += 1) {
    const donor = donors[i % donors.length];
    const category = randomItem(foodCategories);
    const location = cities[i % cities.length];
    const coords = cityLatLng(location);
    const foodName = randomItem(foodNames[category]);
    const quantity = randomDecimal(category === 'Cooked Meals' ? 15 : 8, category === 'Cooked Meals' ? 120 : 60, 2);
    const estimatedMeals = randomInt(Math.max(5, Math.round(quantity * 1.5)), Math.max(10, Math.round(quantity * 3)));
    const preparationTime = randomDateInPast(7);
    const expiryTime = category === 'Cooked Meals' || category === 'Dairy' || category === 'Beverages'
      ? randomDateInFuture(2, 18)
      : randomDateInFuture(6, 72);
    const pickupStartTime = new Date(preparationTime.getTime() + 60 * 60 * 1000);
    const pickupEndTime = new Date(expiryTime.getTime() - 60 * 60 * 1000);
    const status = statuses[i % statuses.length];

    donations.push({
      donor_id: donor.id,
      food_name: foodName,
      food_category: category,
      description: `${foodName} available from ${donor.organization_name} for nearby redistribution.`,
      quantity,
      quantity_unit: randomItem(quantityUnits[category]),
      estimated_meals: estimatedMeals,
      preparation_time: preparationTime.toISOString().slice(0, 19).replace('T', ' '),
      expiry_time: expiryTime.toISOString().slice(0, 19).replace('T', ' '),
      pickup_start_time: pickupStartTime.toISOString().slice(0, 19).replace('T', ' '),
      pickup_end_time: pickupEndTime.toISOString().slice(0, 19).replace('T', ' '),
      address: `${randomInt(1, 300)} ${location.city} Food Park`,
      city: location.city,
      state: location.state,
      latitude: coords.latitude,
      longitude: coords.longitude,
      status,
      image_url: `https://images.foodbridge.local/${category.toLowerCase().replace(/\s+/g, '-')}-${(i % 12) + 1}.jpg`
    });
  }

  return donations;
}

function buildClaims(donations, users) {
  const ngos = users.filter((user) => user.role === 'NGO' || user.role === 'SHELTER');
  const claims = [];
  const claimableStatuses = new Set(['CLAIMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'DELIVERED']);

  donations.forEach((donation, index) => {
    if (!claimableStatuses.has(donation.status)) {
      return;
    }
    const ngo = ngos[index % ngos.length];
    const status = donation.status === 'DELIVERED' ? 'COMPLETED' : donation.status === 'PICKED_UP' ? 'ACTIVE' : 'ACTIVE';
    claims.push({
      id: claims.length + 1,
      donation_id: index + 1,
      ngo_id: ngo.id,
      claimed_at: randomDateInPast(10).toISOString().slice(0, 19).replace('T', ' '),
      status
    });
  });

  return claims;
}

function buildVolunteerTasks(donations, claims, users) {
  const volunteers = users.filter((user) => user.role === 'VOLUNTEER');
  const tasks = [];
  const taskStatuses = ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];

  claims.forEach((claim, index) => {
    const volunteer = volunteers[index % volunteers.length];
    const status = taskStatuses[index % taskStatuses.length];
    const assignedAt = randomDateInPast(9);
    const acceptedAt = status === 'ASSIGNED' || status === 'CANCELLED' ? null : new Date(assignedAt.getTime() + 30 * 60 * 1000);
    const pickedUpAt = status === 'PICKED_UP' || status === 'DELIVERED' ? new Date(assignedAt.getTime() + 2 * 60 * 60 * 1000) : null;
    const deliveredAt = status === 'DELIVERED' ? new Date(assignedAt.getTime() + 4 * 60 * 60 * 1000) : null;

    tasks.push({
      donation_id: claim.donation_id,
      volunteer_id: volunteer.id,
      claim_id: claim.id,
      assigned_at: assignedAt.toISOString().slice(0, 19).replace('T', ' '),
      accepted_at: acceptedAt ? acceptedAt.toISOString().slice(0, 19).replace('T', ' ') : null,
      picked_up_at: pickedUpAt ? pickedUpAt.toISOString().slice(0, 19).replace('T', ' ') : null,
      delivered_at: deliveredAt ? deliveredAt.toISOString().slice(0, 19).replace('T', ' ') : null,
      status
    });
  });

  return tasks;
}

function buildImpactRecords(donations) {
  return donations
    .map((donation, index) => ({ donation, donationId: index + 1 }))
    .filter(({ donation }) => donation.status === 'DELIVERED')
    .map(({ donation, donationId }) => ({
      donation_id: donationId,
      meals_saved: donation.estimated_meals,
      co2_offset_kg: Number((donation.estimated_meals * IMPACT_FACTORS.MEAL_CO2_FACTOR).toFixed(2)),
      calculation_method: `meals_saved = estimated_meals; co2_offset_kg = meals_saved * ${IMPACT_FACTORS.MEAL_CO2_FACTOR}`
    }));
}

function buildNotifications(users, claims, tasks) {
  const notifications = [];
  users.forEach((user) => {
    notifications.push({
      user_id: user.id,
      title: 'Welcome to FoodBridge',
      message: `Your ${user.role.toLowerCase()} account has been seeded for Phase 2 testing.`,
      is_read: false
    });
  });

  claims.slice(0, 40).forEach((claim, index) => {
    notifications.push({
      user_id: claim.ngo_id,
      title: 'Donation claimed successfully',
      message: `Donation #${claim.donation_id} has been claimed for redistribution.`,
      is_read: index % 3 === 0
    });
  });

  tasks.slice(0, 40).forEach((task, index) => {
    notifications.push({
      user_id: task.volunteer_id,
      title: 'Volunteer task assigned',
      message: `Task for donation #${task.donation_id} has been assigned to you.`,
      is_read: index % 2 === 0
    });
  });

  return notifications;
}

function buildAuditLogs(users, donations, claims, tasks) {
  const admin = users.find((user) => user.role === 'ADMIN');
  const donor = users.find((user) => user.role === 'DONOR');
  return [
    {
      user_id: admin.id,
      action: 'SEED_USERS_CREATED',
      entity_type: 'users',
      entity_id: null,
      details: JSON.stringify({ totalUsers: users.length })
    },
    {
      user_id: donor.id,
      action: 'SEED_DONATIONS_CREATED',
      entity_type: 'donations',
      entity_id: null,
      details: JSON.stringify({ totalDonations: donations.length })
    },
    {
      user_id: admin.id,
      action: 'SEED_CLAIMS_CREATED',
      entity_type: 'donation_claims',
      entity_id: null,
      details: JSON.stringify({ totalClaims: claims.length })
    },
    {
      user_id: admin.id,
      action: 'SEED_TASKS_CREATED',
      entity_type: 'volunteer_tasks',
      entity_id: null,
      details: JSON.stringify({ totalTasks: tasks.length })
    }
  ];
}

function buildSql(users, donations, claims, tasks, impacts, notifications, auditLogs) {
  const statements = [];
  statements.push('USE foodbridge;');
  statements.push('SET FOREIGN_KEY_CHECKS = 0;');
  statements.push('TRUNCATE TABLE audit_logs;');
  statements.push('TRUNCATE TABLE notifications;');
  statements.push('TRUNCATE TABLE impact_records;');
  statements.push('TRUNCATE TABLE volunteer_tasks;');
  statements.push('TRUNCATE TABLE donation_claims;');
  statements.push('TRUNCATE TABLE donations;');
  statements.push('TRUNCATE TABLE users;');
  statements.push('SET FOREIGN_KEY_CHECKS = 1;');

  if (users.length > 0) {
    const userRows = users.map((user) => `(${[
      user.id,
      formatSqlValue(user.name),
      formatSqlValue(user.email),
      formatSqlValue(user.password_hash),
      formatSqlValue(user.phone),
      formatSqlValue(user.role),
      formatSqlValue(user.organization_name),
      formatSqlValue(user.address),
      formatSqlValue(user.city),
      formatSqlValue(user.state),
      formatSqlValue(user.country),
      formatSqlValue(user.latitude),
      formatSqlValue(user.longitude),
      formatSqlValue(user.profile_image),
      user.is_active ? 1 : 0
    ].join(', ')})`);
    statements.push(`INSERT INTO users (id, name, email, password_hash, phone, role, organization_name, address, city, state, country, latitude, longitude, profile_image, is_active) VALUES\n${userRows.join(',\n')};`);
  }

  if (donations.length > 0) {
    const donationRows = donations.map((donation, index) => `(${[
      index + 1,
      donation.donor_id,
      formatSqlValue(donation.food_name),
      formatSqlValue(donation.food_category),
      formatSqlValue(donation.description),
      formatSqlValue(donation.quantity),
      formatSqlValue(donation.quantity_unit),
      formatSqlValue(donation.estimated_meals),
      formatSqlValue(donation.preparation_time),
      formatSqlValue(donation.expiry_time),
      formatSqlValue(donation.pickup_start_time),
      formatSqlValue(donation.pickup_end_time),
      formatSqlValue(donation.address),
      formatSqlValue(donation.city),
      formatSqlValue(donation.state),
      formatSqlValue(donation.latitude),
      formatSqlValue(donation.longitude),
      formatSqlValue(donation.status),
      formatSqlValue(donation.image_url)
    ].join(', ')})`);
    statements.push(`INSERT INTO donations (id, donor_id, food_name, food_category, description, quantity, quantity_unit, estimated_meals, preparation_time, expiry_time, pickup_start_time, pickup_end_time, address, city, state, latitude, longitude, status, image_url) VALUES\n${donationRows.join(',\n')};`);
  }

  if (claims.length > 0) {
    const claimRows = claims.map((claim, index) => `(${[
      index + 1,
      claim.donation_id,
      claim.ngo_id,
      formatSqlValue(claim.claimed_at),
      formatSqlValue(claim.status)
    ].join(', ')})`);
    statements.push(`INSERT INTO donation_claims (id, donation_id, ngo_id, claimed_at, status) VALUES\n${claimRows.join(',\n')};`);
  }

  if (tasks.length > 0) {
    const taskRows = tasks.map((task, index) => `(${[
      index + 1,
      task.donation_id,
      task.volunteer_id,
      task.claim_id,
      formatSqlValue(task.assigned_at),
      formatSqlValue(task.accepted_at),
      formatSqlValue(task.picked_up_at),
      formatSqlValue(task.delivered_at),
      formatSqlValue(task.status)
    ].join(', ')})`);
    statements.push(`INSERT INTO volunteer_tasks (id, donation_id, volunteer_id, claim_id, assigned_at, accepted_at, picked_up_at, delivered_at, status) VALUES\n${taskRows.join(',\n')};`);
  }

  if (impacts.length > 0) {
    const impactRows = impacts.map((impact, index) => `(${[
      index + 1,
      impact.donation_id,
      impact.meals_saved,
      impact.co2_offset_kg,
      formatSqlValue(impact.calculation_method)
    ].join(', ')})`);
    statements.push(`INSERT INTO impact_records (id, donation_id, meals_saved, co2_offset_kg, calculation_method) VALUES\n${impactRows.join(',\n')};`);
  }

  if (notifications.length > 0) {
    const notificationRows = notifications.map((notification, index) => `(${[
      index + 1,
      notification.user_id,
      formatSqlValue(notification.title),
      formatSqlValue(notification.message),
      notification.is_read ? 1 : 0
    ].join(', ')})`);
    statements.push(`INSERT INTO notifications (id, user_id, title, message, is_read) VALUES\n${notificationRows.join(',\n')};`);
  }

  if (auditLogs.length > 0) {
    const auditRows = auditLogs.map((log, index) => `(${[
      index + 1,
      log.user_id,
      formatSqlValue(log.action),
      formatSqlValue(log.entity_type),
      'NULL',
      formatSqlValue(log.details)
    ].join(', ')})`);
    statements.push(`INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES\n${auditRows.join(',\n')};`);
  }

  return `${statements.join('\n\n')}\n`;
}

const users = buildUsers();
const donations = buildDonations(users, totalDonations);
const claims = buildClaims(donations, users);
const tasks = buildVolunteerTasks(donations, claims, users);
const impacts = buildImpactRecords(donations);
const notifications = buildNotifications(users, claims, tasks);
const auditLogs = buildAuditLogs(users, donations, claims, tasks);
const sql = buildSql(users, donations, claims, tasks, impacts, notifications, auditLogs);

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated ${users.length} users and ${donations.length} donations at ${outputPath}`);

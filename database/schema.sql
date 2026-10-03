CREATE DATABASE IF NOT EXISTS foodbridge
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE foodbridge;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  role ENUM('DONOR', 'NGO', 'SHELTER', 'VOLUNTEER', 'ADMIN') NOT NULL,
  organization_name VARCHAR(150),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  profile_image VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (role IN ('DONOR', 'NGO', 'SHELTER', 'VOLUNTEER', 'ADMIN')),
  CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS donations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  donor_id BIGINT NOT NULL,
  food_name VARCHAR(150) NOT NULL,
  food_category VARCHAR(50) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL,
  quantity_unit VARCHAR(30) NOT NULL,
  estimated_meals INT NOT NULL,
  preparation_time DATETIME,
  expiry_time DATETIME NOT NULL,
  pickup_start_time DATETIME,
  pickup_end_time DATETIME,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  status ENUM('AVAILABLE', 'CLAIMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'DELIVERED', 'EXPIRED', 'CANCELLED') DEFAULT 'AVAILABLE',
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT chk_donations_latitude CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_donations_longitude CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT chk_donations_quantity CHECK (quantity > 0),
  CONSTRAINT chk_donations_meals CHECK (estimated_meals > 0),
  CONSTRAINT chk_donations_status CHECK (status IN ('AVAILABLE', 'CLAIMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'DELIVERED', 'EXPIRED', 'CANCELLED'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS donation_claims (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  donation_id BIGINT NOT NULL,
  ngo_id BIGINT NOT NULL,
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  active_claim_donation_id BIGINT GENERATED ALWAYS AS (CASE WHEN status = 'ACTIVE' THEN donation_id ELSE NULL END) STORED,
  CONSTRAINT fk_claims_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE RESTRICT,
  CONSTRAINT fk_claims_ngo FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT chk_claims_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  UNIQUE KEY uniq_active_claim (active_claim_donation_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS volunteer_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  donation_id BIGINT NOT NULL,
  volunteer_id BIGINT NOT NULL,
  claim_id BIGINT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP NULL,
  picked_up_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  status ENUM('ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED') DEFAULT 'ASSIGNED',
  CONSTRAINT fk_tasks_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tasks_volunteer FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tasks_claim FOREIGN KEY (claim_id) REFERENCES donation_claims(id) ON DELETE SET NULL,
  CONSTRAINT chk_tasks_status CHECK (status IN ('ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS impact_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  donation_id BIGINT NOT NULL UNIQUE,
  meals_saved INT NOT NULL,
  co2_offset_kg DECIMAL(10,2) NOT NULL,
  calculation_method VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_impact_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE RESTRICT,
  CONSTRAINT chk_impact_meals CHECK (meals_saved >= 0),
  CONSTRAINT chk_impact_co2 CHECK (co2_offset_kg >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id BIGINT,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_city ON users(city);

CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_status_expiry_time ON donations(status, expiry_time);
CREATE INDEX idx_donations_food_category ON donations(food_category);
CREATE INDEX idx_donations_expiry_time ON donations(expiry_time);
CREATE INDEX idx_donations_latitude ON donations(latitude);
CREATE INDEX idx_donations_longitude ON donations(longitude);
CREATE INDEX idx_donations_city ON donations(city);
CREATE INDEX idx_donations_created_at ON donations(created_at);

CREATE INDEX idx_claims_donation_id ON donation_claims(donation_id);
CREATE INDEX idx_claims_ngo_id ON donation_claims(ngo_id);

CREATE INDEX idx_tasks_volunteer_id ON volunteer_tasks(volunteer_id);
CREATE INDEX idx_tasks_status ON volunteer_tasks(status);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

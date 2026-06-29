CREATE TABLE IF NOT EXISTS system_roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  clearance_level INTEGER,
  description TEXT
);

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES system_roles(role_id) ON DELETE SET NULL,
  company_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'P3-Medium',
  status VARCHAR(50) DEFAULT 'Open Queue',
  category_id INTEGER REFERENCES ticket_categories(category_id) ON DELETE SET NULL,
  requester_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  assigned_to INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  source VARCHAR(50) DEFAULT 'portal',
  impact VARCHAR(50),
  urgency VARCHAR(50),
  sla_due_date TIMESTAMP,
  first_response_at TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  resolution_notes TEXT,
  root_cause TEXT,
  parts_used TEXT,
  time_spent_minutes INTEGER,
  satisfaction_rating INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

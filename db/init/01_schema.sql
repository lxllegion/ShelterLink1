-- Users: store Firebase UID as text
CREATE TABLE IF NOT EXISTS donors (
  donor_id TEXT PRIMARY KEY,          -- firebase uid
  username  TEXT UNIQUE NOT NULL,
  email     TEXT UNIQUE NOT NULL,
  phone     TEXT
);

CREATE TABLE IF NOT EXISTS shelters (
  shelter_id TEXT PRIMARY KEY,        -- firebase uid
  username   TEXT UNIQUE NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  phone      TEXT,
  location   TEXT,
  verified   BOOLEAN DEFAULT FALSE
);

-- Requests posted by shelters
CREATE TABLE IF NOT EXISTS requests (
  request_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelter_id  TEXT NOT NULL REFERENCES shelters(shelter_id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  amount_needed INTEGER NOT NULL CHECK (amount_needed >= 0),
  urgency     TEXT CHECK (urgency IN ('low','medium','high')) DEFAULT 'low',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Donations posted by donors
CREATE TABLE IF NOT EXISTS donations (
  donation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id    TEXT NOT NULL REFERENCES donors(donor_id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  amount      INTEGER NOT NULL CHECK (amount >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_requests_category ON requests(category);
CREATE INDEX IF NOT EXISTS idx_donations_category ON donations(category);

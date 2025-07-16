-- TeamTango Database Setup Script
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- 1. Create Sports Reference Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS sports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default sports
INSERT INTO sports (name) VALUES 
  ('Hockey'),
  ('Baseball'), 
  ('Basketball'),
  ('Football'),
  ('Soccer'),
  ('Lacrosse'),
  ('Softball'),
  ('Volleyball')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. Create User Profiles Table (extends auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. Create Teams Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  sport_id UUID REFERENCES sports(id),
  skill_level VARCHAR(20) CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Elite')) NOT NULL,
  phone VARCHAR(20),
  city VARCHAR(50),
  state VARCHAR(2),
  zip VARCHAR(10),
  home_venue VARCHAR(100),
  venue_address TEXT,
  description TEXT,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. Create Team Availability Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration DECIMAL(3,1) DEFAULT 2.0,
  type VARCHAR(20) CHECK (type IN ('available', 'travel', 'unavailable')) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. Create Match Requests Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS match_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requesting_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  target_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  preferred_dates TEXT,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure teams can't request matches with themselves
  CONSTRAINT different_teams CHECK (requesting_team_id != target_team_id)
);

-- ============================================================================
-- 6. Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_sport_id ON teams(sport_id);
CREATE INDEX IF NOT EXISTS idx_teams_skill_level ON teams(skill_level);
CREATE INDEX IF NOT EXISTS idx_teams_location ON teams(city, state);

CREATE INDEX IF NOT EXISTS idx_team_availability_team_id ON team_availability(team_id);
CREATE INDEX IF NOT EXISTS idx_team_availability_date ON team_availability(date);
CREATE INDEX IF NOT EXISTS idx_team_availability_type ON team_availability(type);

CREATE INDEX IF NOT EXISTS idx_match_requests_requesting_team ON match_requests(requesting_team_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_target_team ON match_requests(target_team_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status);

-- ============================================================================
-- 7. Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

-- Sports table is public (no RLS needed)

-- ============================================================================
-- 8. Create RLS Policies
-- ============================================================================

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams Policies
DROP POLICY IF EXISTS "Anyone can view teams" ON teams;
CREATE POLICY "Anyone can view teams" ON teams
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own teams" ON teams;
CREATE POLICY "Users can manage own teams" ON teams
  FOR ALL USING (auth.uid() = user_id);

-- Team Availability Policies
DROP POLICY IF EXISTS "Anyone can view team availability" ON team_availability;
CREATE POLICY "Anyone can view team availability" ON team_availability
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team owners can manage availability" ON team_availability;
CREATE POLICY "Team owners can manage availability" ON team_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_availability.team_id 
      AND teams.user_id = auth.uid()
    )
  );

-- Match Requests Policies
DROP POLICY IF EXISTS "Users can view match requests for their teams" ON match_requests;
CREATE POLICY "Users can view match requests for their teams" ON match_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE (teams.id = match_requests.requesting_team_id OR teams.id = match_requests.target_team_id)
      AND teams.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create match requests from their teams" ON match_requests;
CREATE POLICY "Users can create match requests from their teams" ON match_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = match_requests.requesting_team_id 
      AND teams.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update match requests for their teams" ON match_requests;
CREATE POLICY "Users can update match requests for their teams" ON match_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE (teams.id = match_requests.requesting_team_id OR teams.id = match_requests.target_team_id)
      AND teams.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 9. Create Triggers for Updated At Timestamps
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at columns
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_match_requests_updated_at ON match_requests;
CREATE TRIGGER update_match_requests_updated_at
    BEFORE UPDATE ON match_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. Create Views for Common Queries
-- ============================================================================

-- View for teams with sport names
CREATE OR REPLACE VIEW teams_with_sports AS
SELECT 
  t.*,
  s.name as sport_name
FROM teams t
LEFT JOIN sports s ON t.sport_id = s.id;

-- View for upcoming team availability
CREATE OR REPLACE VIEW upcoming_availability AS
SELECT 
  ta.*,
  t.name as team_name,
  t.user_id,
  s.name as sport_name
FROM team_availability ta
JOIN teams t ON ta.team_id = t.id
LEFT JOIN sports s ON t.sport_id = s.id
WHERE ta.date >= CURRENT_DATE
ORDER BY ta.date, ta.time;

-- ============================================================================
-- Setup Complete!
-- ============================================================================

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as sports_count FROM sports;
SELECT 'Ready to use TeamTango!' as message; 
-- Create enums
CREATE TYPE deployment_status AS ENUM ('queued', 'in_progress', 'completed', 'failed', 'canceled');
CREATE TYPE deployment_type AS ENUM ('build', 'submit');
CREATE TYPE platform AS ENUM ('android', 'ios', 'all');
CREATE TYPE build_profile AS ENUM ('development', 'preview', 'production');
CREATE TYPE track AS ENUM ('production', 'beta', 'alpha', 'internal');

-- Create deployments table
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  type deployment_type NOT NULL,
  status deployment_status NOT NULL DEFAULT 'queued',
  platform platform NOT NULL,
  build_profile build_profile,
  track track,
  build_id TEXT,
  submission_id TEXT,
  build_url TEXT,
  logs TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  version_code INTEGER,
  version_name TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_deployments_app_id ON deployments(app_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at);

-- Add expo_project_id and expo_config columns to apps table
ALTER TABLE apps 
  ADD COLUMN IF NOT EXISTS expo_project_id TEXT,
  ADD COLUMN IF NOT EXISTS expo_config JSONB DEFAULT '{}'::jsonb;

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to the deployments table
CREATE TRIGGER update_deployments_updated_at
BEFORE UPDATE ON deployments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add a comment to the deployments table
COMMENT ON TABLE deployments IS 'Tracks Expo app deployments and submissions to app stores';

-- Add comments to the new columns in apps table
COMMENT ON COLUMN apps.expo_project_id IS 'The Expo project ID for this app';
COMMENT ON COLUMN apps.expo_config IS 'Expo app configuration (app.json) stored as JSONB for easy querying';

-- Create a function to get the latest deployment for an app
CREATE OR REPLACE FUNCTION get_latest_deployment(app_id_param UUID)
RETURNS SETOF deployments AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM deployments
  WHERE app_id = app_id_param
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

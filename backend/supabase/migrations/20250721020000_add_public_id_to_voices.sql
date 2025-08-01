-- Add public_id column to voices table for security
-- This will hide the actual agent_id from URLs

-- Add public_id column (nullable initially)
ALTER TABLE voices 
ADD COLUMN public_id TEXT;

-- Create function to generate random public_id
CREATE OR REPLACE FUNCTION generate_public_id()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    -- Generate 8-character random string
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing records with unique public_id
DO $$
DECLARE
    rec RECORD;
    new_public_id TEXT;
    attempt_count INTEGER;
    max_attempts INTEGER := 10;
BEGIN
    FOR rec IN SELECT id FROM voices WHERE public_id IS NULL LOOP
        attempt_count := 0;
        LOOP
            new_public_id := generate_public_id();
            attempt_count := attempt_count + 1;
            
            -- Check if this public_id already exists
            IF NOT EXISTS (SELECT 1 FROM voices WHERE public_id = new_public_id) THEN
                UPDATE voices SET public_id = new_public_id WHERE id = rec.id;
                EXIT;
            END IF;
            
            -- Prevent infinite loop
            IF attempt_count >= max_attempts THEN
                RAISE EXCEPTION 'Failed to generate unique public_id after % attempts', max_attempts;
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

-- Make public_id NOT NULL and UNIQUE after populating data
ALTER TABLE voices 
ALTER COLUMN public_id SET NOT NULL;

ALTER TABLE voices 
ADD CONSTRAINT voices_public_id_unique UNIQUE (public_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_voices_public_id ON voices (public_id);

-- Drop the generation function as it's no longer needed
DROP FUNCTION generate_public_id();

-- Add comment for documentation
COMMENT ON COLUMN voices.public_id IS 'Public identifier for secure URL routing, hides internal agent_id'; 
const pool = require("../config/database");

class Response {
  // Table definition - Create table if it doesn't exist
  static async createTable() {
    const query = `
      -- Enable PostGIS extension
      CREATE EXTENSION IF NOT EXISTS postgis;
      
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE IF NOT EXISTS responses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- Reporter Information
        role TEXT[] DEFAULT '{}',
        role_other_text TEXT,
        respondent_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        
        -- Location
        country VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        town VARCHAR(100) NOT NULL,
        date_of_report DATE NOT NULL,
        
        -- Geographic coordinates
        longitude DECIMAL(10, 8),
        latitude DECIMAL(10, 8),
        altitude DECIMAL(10, 2),
        geom GEOMETRY(Point, 4326),
        
        -- Conditions Assessment
        dry_wet_condition VARCHAR(50),
        experience_years VARCHAR(50),
        times_seen_like_this VARCHAR(50),
        when_was_it_once VARCHAR(10),
        when_most_recently_twice VARCHAR(10),
        when_other_text TEXT,
        
        -- Normal or Wet Conditions
        normal_or_wet_conditions TEXT[] DEFAULT '{}',
        
        -- Crop Production
        crop_production_effects TEXT[] DEFAULT '{}',
        crop_production_other_text TEXT,
        crop_conditions VARCHAR(50),
        planting_status VARCHAR(50),
        harvest_status VARCHAR(50),
        
        -- Livestock Production
        livestock_production_effects TEXT[] DEFAULT '{}',
        livestock_production_other_text TEXT,
        range_conditions VARCHAR(50),
        
        -- Public Health
        public_health_effects TEXT[] DEFAULT '{}',
        public_health_other_text TEXT,
        
        -- Household
        household_effects TEXT[] DEFAULT '{}',
        household_other_text TEXT,
        
        -- Business/Industry
        business_industry_effects TEXT[] DEFAULT '{}',
        business_industry_other_text TEXT,
        
        -- Forest
        forest_effects TEXT[] DEFAULT '{}',
        forest_other_text TEXT,
        
        -- Legacy fields (if needed)
        affected_area TEXT,
        crop_damage TEXT,
        livestock_losses TEXT,
        water_availability TEXT,
        drought_severity VARCHAR(50),
        response_actions TEXT,
        additional_info TEXT,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_responses_email ON responses(email);
      CREATE INDEX IF NOT EXISTS idx_responses_country ON responses(country);
      CREATE INDEX IF NOT EXISTS idx_responses_region ON responses(region);
      CREATE INDEX IF NOT EXISTS idx_responses_date ON responses(date_of_report);
      CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);
      
      -- Note: Spatial index for geom is created after the column is added (see alterQuery below)

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_responses_updated_at ON responses;
      CREATE TRIGGER update_responses_updated_at BEFORE UPDATE
          ON responses FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const alterQuery = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Convert id column to UUID if it's currently SERIAL/INTEGER
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='responses' AND column_name='id' 
                   AND data_type='integer') THEN
          -- Drop the default constraint first
          ALTER TABLE responses ALTER COLUMN id DROP DEFAULT;
          
          -- Convert integer id to UUID (generate new UUIDs for existing rows)
          ALTER TABLE responses 
          ALTER COLUMN id TYPE UUID USING uuid_generate_v4();
          
          -- Set new UUID default
          ALTER TABLE responses 
          ALTER COLUMN id SET DEFAULT uuid_generate_v4();
        END IF;
        
        -- Ensure UUID default exists even if column is already UUID
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='responses' AND column_name='id' 
                   AND data_type='uuid') THEN
          -- Check if default is already set
          IF NOT EXISTS (
            SELECT 1 FROM pg_attrdef 
            WHERE adrelid = 'responses'::regclass 
            AND adnum = (
              SELECT attnum FROM pg_attribute 
              WHERE attrelid = 'responses'::regclass 
              AND attname = 'id'
            )
          ) THEN
            ALTER TABLE responses 
            ALTER COLUMN id SET DEFAULT uuid_generate_v4();
          END IF;
        END IF;
      END $$;

      -- Add longitude column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='responses' AND column_name='longitude') THEN
          ALTER TABLE responses ADD COLUMN longitude DECIMAL(10, 8);
        END IF;
      END $$;

      -- Add latitude column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='responses' AND column_name='latitude') THEN
          ALTER TABLE responses ADD COLUMN latitude DECIMAL(10, 8);
        END IF;
      END $$;

      -- Add altitude column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='responses' AND column_name='altitude') THEN
          ALTER TABLE responses ADD COLUMN altitude DECIMAL(10, 2);
        END IF;
      END $$;

      -- Add geom column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='responses' AND column_name='geom') THEN
          ALTER TABLE responses ADD COLUMN geom GEOMETRY(Point, 4326);
        END IF;
      END $$;

      -- Create spatial index for geom if column exists and index doesn't exist
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='responses' AND column_name='geom')
           AND NOT EXISTS (SELECT 1 FROM pg_indexes 
                          WHERE indexname='idx_responses_geom' AND tablename='responses') THEN
          CREATE INDEX idx_responses_geom ON responses USING GIST(geom);
        END IF;
      END $$;
    `;

    try {
      await pool.query(query);
      await pool.query(alterQuery);
      console.log("Responses table created/verified successfully");
      console.log("Geographic columns verified/added");
    } catch (error) {
      console.error("Error creating table:", error);
      throw error;
    }
  }

  // Sync table - alias for createTable (for consistency)
  static async sync() {
    return await this.createTable();
  }
}

module.exports = Response;

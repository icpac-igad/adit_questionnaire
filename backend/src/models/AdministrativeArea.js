const pool = require("../config/database");

class AdministrativeArea {
  // Create tables for administrative areas
  static async createTable() {
    const query = `
      -- Admin Level 0: Countries
      CREATE TABLE IF NOT EXISTS admin_level_0 (
        id SERIAL PRIMARY KEY,
        code VARCHAR(3) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_iso VARCHAR(255),
        gadm_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Admin Level 1: First-level subdivisions (states, provinces, regions)
      CREATE TABLE IF NOT EXISTS admin_level_1 (
        id SERIAL PRIMARY KEY,
        admin_level_0_id INTEGER NOT NULL REFERENCES admin_level_0(id) ON DELETE CASCADE,
        code VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        name_local VARCHAR(255),
        gadm_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(admin_level_0_id, code)
      );

      -- Admin Level 2: Second-level subdivisions (districts, counties, municipalities)
      CREATE TABLE IF NOT EXISTS admin_level_2 (
        id SERIAL PRIMARY KEY,
        admin_level_1_id INTEGER NOT NULL REFERENCES admin_level_1(id) ON DELETE CASCADE,
        code VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        name_local VARCHAR(255),
        gadm_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(admin_level_1_id, code)
      );

      -- Admin Level 3: Third-level subdivisions (sub-districts, communes, wards)
      CREATE TABLE IF NOT EXISTS admin_level_3 (
        id SERIAL PRIMARY KEY,
        admin_level_2_id INTEGER NOT NULL REFERENCES admin_level_2(id) ON DELETE CASCADE,
        code VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        name_local VARCHAR(255),
        gadm_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(admin_level_2_id, code)
      );

      -- Indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_admin_1_level_0_id ON admin_level_1(admin_level_0_id);
      CREATE INDEX IF NOT EXISTS idx_admin_2_level_1_id ON admin_level_2(admin_level_1_id);
      CREATE INDEX IF NOT EXISTS idx_admin_3_level_2_id ON admin_level_3(admin_level_2_id);
      CREATE INDEX IF NOT EXISTS idx_admin_0_code ON admin_level_0(code);
      CREATE INDEX IF NOT EXISTS idx_admin_1_code ON admin_level_1(code);
      CREATE INDEX IF NOT EXISTS idx_admin_2_code ON admin_level_2(code);
      CREATE INDEX IF NOT EXISTS idx_admin_3_code ON admin_level_3(code);
    `;

    try {
      await pool.query(query);
      console.log("Administrative areas tables created/verified successfully");
    } catch (error) {
      console.error("Error creating administrative areas tables:", error);
      throw error;
    }
  }

  // Sync table - alias for createTable
  static async sync() {
    return await this.createTable();
  }

  // Helper methods for data insertion
  static async upsertAdminLevel0(code, name, nameIso = null, gadmId = null) {
    const query = `
      INSERT INTO admin_level_0 (code, name, name_iso, gadm_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (code) 
      DO UPDATE SET 
        name = EXCLUDED.name, 
        name_iso = EXCLUDED.name_iso,
        gadm_id = EXCLUDED.gadm_id
      RETURNING *;
    `;
    const result = await pool.query(query, [code, name, nameIso, gadmId]);
    return result.rows[0];
  }

  static async upsertAdminLevel1(
    adminLevel0Id,
    code,
    name,
    nameLocal = null,
    gadmId = null
  ) {
    const query = `
      INSERT INTO admin_level_1 (admin_level_0_id, code, name, name_local, gadm_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (admin_level_0_id, code) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        name_local = EXCLUDED.name_local,
        gadm_id = EXCLUDED.gadm_id
      RETURNING *;
    `;
    const result = await pool.query(query, [
      adminLevel0Id,
      code,
      name,
      nameLocal,
      gadmId,
    ]);
    return result.rows[0];
  }

  static async upsertAdminLevel2(
    adminLevel1Id,
    code,
    name,
    nameLocal = null,
    gadmId = null
  ) {
    const query = `
      INSERT INTO admin_level_2 (admin_level_1_id, code, name, name_local, gadm_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (admin_level_1_id, code) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        name_local = EXCLUDED.name_local,
        gadm_id = EXCLUDED.gadm_id
      RETURNING *;
    `;
    const result = await pool.query(query, [
      adminLevel1Id,
      code,
      name,
      nameLocal,
      gadmId,
    ]);
    return result.rows[0];
  }

  static async upsertAdminLevel3(
    adminLevel2Id,
    code,
    name,
    nameLocal = null,
    gadmId = null
  ) {
    const query = `
      INSERT INTO admin_level_3 (admin_level_2_id, code, name, name_local, gadm_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (admin_level_2_id, code) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        name_local = EXCLUDED.name_local,
        gadm_id = EXCLUDED.gadm_id
      RETURNING *;
    `;
    const result = await pool.query(query, [
      adminLevel2Id,
      code,
      name,
      nameLocal,
      gadmId,
    ]);
    return result.rows[0];
  }

  // Legacy methods for backward compatibility
  static async upsertCountry(code, name, nameIso = null, gadmId = null) {
    return this.upsertAdminLevel0(code, name, nameIso, gadmId);
  }

  static async upsertRegion(
    countryId,
    code,
    name,
    nameLocal = null,
    gadmId = null
  ) {
    return this.upsertAdminLevel1(countryId, code, name, nameLocal, gadmId);
  }

  static async upsertCity(
    regionId,
    code,
    name,
    nameLocal = null,
    gadmId = null
  ) {
    return this.upsertAdminLevel2(regionId, code, name, nameLocal, gadmId);
  }

  // Query methods
  static async getAllCountries() {
    const query = `
      SELECT id, code, name, name_iso, gadm_id
      FROM admin_level_0
      ORDER BY name;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getAdminLevel1ByCountry(countryCode) {
    const query = `
      SELECT a1.id, a1.code, a1.name, a1.name_local, a1.gadm_id
      FROM admin_level_1 a1
      JOIN admin_level_0 a0 ON a1.admin_level_0_id = a0.id
      WHERE a0.code = $1
      ORDER BY a1.name;
    `;
    const result = await pool.query(query, [countryCode]);
    return result.rows;
  }

  static async getAdminLevel2ByAdminLevel1(adminLevel1Code, countryCode) {
    const query = `
      SELECT a2.id, a2.code, a2.name, a2.name_local, a2.gadm_id
      FROM admin_level_2 a2
      JOIN admin_level_1 a1 ON a2.admin_level_1_id = a1.id
      JOIN admin_level_0 a0 ON a1.admin_level_0_id = a0.id
      WHERE a1.code = $1 AND a0.code = $2
      ORDER BY a2.name;
    `;
    const result = await pool.query(query, [adminLevel1Code, countryCode]);
    return result.rows;
  }

  static async getAdminLevel3ByAdminLevel2(
    adminLevel2Code,
    adminLevel1Code,
    countryCode
  ) {
    const query = `
      SELECT a3.id, a3.code, a3.name, a3.name_local, a3.gadm_id
      FROM admin_level_3 a3
      JOIN admin_level_2 a2 ON a3.admin_level_2_id = a2.id
      JOIN admin_level_1 a1 ON a2.admin_level_1_id = a1.id
      JOIN admin_level_0 a0 ON a1.admin_level_0_id = a0.id
      WHERE a2.code = $1 AND a1.code = $2 AND a0.code = $3
      ORDER BY a3.name;
    `;
    const result = await pool.query(query, [
      adminLevel2Code,
      adminLevel1Code,
      countryCode,
    ]);
    return result.rows;
  }

  // Legacy methods for backward compatibility
  static async getRegionsByCountry(countryCode) {
    return this.getAdminLevel1ByCountry(countryCode);
  }

  static async getCitiesByRegion(regionCode, countryCode) {
    return this.getAdminLevel2ByAdminLevel1(regionCode, countryCode);
  }

  static async getRegionsByCountryId(countryId) {
    const query = `
      SELECT id, code, name, name_local, gadm_id
      FROM admin_level_1
      WHERE admin_level_0_id = $1
      ORDER BY name;
    `;
    const result = await pool.query(query, [countryId]);
    return result.rows;
  }

  static async getCitiesByRegionId(regionId) {
    const query = `
      SELECT id, code, name, name_local, gadm_id
      FROM admin_level_2
      WHERE admin_level_1_id = $1
      ORDER BY name;
    `;
    const result = await pool.query(query, [regionId]);
    return result.rows;
  }
}

module.exports = AdministrativeArea;

const pool = require("../config/database");

// Create a new response
exports.create = async (req, res) => {
  try {
    const data = req.body;

    // Parse numeric fields
    const longitude = data.longitude ? parseFloat(data.longitude) : null;
    const latitude = data.latitude ? parseFloat(data.latitude) : null;
    const altitude = data.altitude ? parseFloat(data.altitude) : null;

    // Fields to exclude from INSERT (handled separately)
    const excludedFields = ["id", "created_at", "updated_at", "geom"];

    // Build columns and values dynamically from request body
    const columns = [];
    const values = [];
    const placeholders = [];
    let paramIndex = 1;

    // Process all fields from request body
    for (const [key, value] of Object.entries(data)) {
      if (excludedFields.includes(key)) continue;

      // Special handling for longitude/latitude/altitude
      if (key === "longitude") {
        columns.push("longitude");
        values.push(longitude);
        placeholders.push(`$${paramIndex++}`);
      } else if (key === "latitude") {
        columns.push("latitude");
        values.push(latitude);
        placeholders.push(`$${paramIndex++}`);
      } else if (key === "altitude") {
        columns.push("altitude");
        values.push(altitude);
        placeholders.push(`$${paramIndex++}`);
      } else {
        // Handle array fields (default to empty array)
        if (Array.isArray(value)) {
          columns.push(key);
          values.push(value.length > 0 ? value : []);
          placeholders.push(`$${paramIndex++}`);
        } else {
          // Handle other fields (default to null if undefined/empty string)
          columns.push(key);
          values.push(value !== undefined && value !== "" ? value : null);
          placeholders.push(`$${paramIndex++}`);
        }
      }
    }

    // Build INSERT query
    const query = `
      INSERT INTO responses (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *
    `;

    // Insert the record first (geom will be NULL)
    const result = await pool.query(query, values);
    const insertedId = result.rows[0].id;

    // If we have coordinates, update the geom column
    if (longitude && latitude) {
      const updateQuery = `
        UPDATE responses 
        SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)
        WHERE id = $3
        RETURNING *
      `;
      await pool.query(updateQuery, [longitude, latitude, insertedId]);

      // Fetch the updated record
      const updatedResult = await pool.query(
        "SELECT * FROM responses WHERE id = $1",
        [insertedId]
      );

      res.status(201).json({
        success: true,
        message: "Response created successfully",
        data: updatedResult.rows[0],
      });
    } else {
      res.status(201).json({
        success: true,
        message: "Response created successfully",
        data: result.rows[0],
      });
    }
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({
      success: false,
      message: "Error creating response",
      error: error.message,
    });
  }
};

// Get all responses
exports.findAll = async (req, res) => {
  try {
    const filters = {
      email: req.query.email,
      country: req.query.country,
      region: req.query.region,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
    };

    let query = "SELECT * FROM responses WHERE 1=1";
    const values = [];
    let paramCount = 1;

    if (filters.email) {
      query += ` AND email = $${paramCount++}`;
      values.push(filters.email);
    }

    if (filters.country) {
      query += ` AND country = $${paramCount++}`;
      values.push(filters.country);
    }

    if (filters.region) {
      query += ` AND region = $${paramCount++}`;
      values.push(filters.region);
    }

    if (filters.startDate) {
      query += ` AND date_of_report >= $${paramCount++}`;
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ` AND date_of_report <= $${paramCount++}`;
      values.push(filters.endDate);
    }

    query += " ORDER BY created_at DESC";

    if (filters.limit) {
      query += ` LIMIT $${paramCount++}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount++}`;
      values.push(filters.offset);
    }

    const responsesResult = await pool.query(query, values);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM responses WHERE 1=1";
    const countValues = [];
    let countParamCount = 1;

    if (filters.email) {
      countQuery += ` AND email = $${countParamCount++}`;
      countValues.push(filters.email);
    }

    if (filters.country) {
      countQuery += ` AND country = $${countParamCount++}`;
      countValues.push(filters.country);
    }

    if (filters.region) {
      countQuery += ` AND region = $${countParamCount++}`;
      countValues.push(filters.region);
    }

    if (filters.startDate) {
      countQuery += ` AND date_of_report >= $${countParamCount++}`;
      countValues.push(filters.startDate);
    }

    if (filters.endDate) {
      countQuery += ` AND date_of_report <= $${countParamCount++}`;
      countValues.push(filters.endDate);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: responsesResult.rows,
      total,
      limit: filters.limit,
      offset: filters.offset,
    });
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching responses",
      error: error.message,
    });
  }
};

// Get response by ID
exports.findById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM responses WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Response not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching response:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching response",
      error: error.message,
    });
  }
};

// Update response by ID
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      "role",
      "role_other_text",
      "respondent_name",
      "email",
      "country",
      "region",
      "town",
      "date_of_report",
      "dry_wet_condition",
      "experience_years",
      "times_seen_like_this",
      "when_was_it_once",
      "when_most_recently_twice",
      "when_other_text",
      "normal_or_wet_conditions",
      "crop_production_effects",
      "crop_production_other_text",
      "crop_conditions",
      "planting_status",
      "harvest_status",
      "livestock_production_effects",
      "livestock_production_other_text",
      "range_conditions",
      "public_health_effects",
      "public_health_other_text",
      "household_effects",
      "household_other_text",
      "business_industry_effects",
      "business_industry_other_text",
      "forest_effects",
      "forest_other_text",
      "affected_area",
      "crop_damage",
      "livestock_losses",
      "water_availability",
      "drought_severity",
      "response_actions",
      "additional_info",
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramCount++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    values.push(id);
    const query = `UPDATE responses SET ${fields.join(
      ", "
    )} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Response not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Response updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating response:", error);
    res.status(500).json({
      success: false,
      message: "Error updating response",
      error: error.message,
    });
  }
};

// Delete response by ID
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM responses WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Response not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Response deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting response:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting response",
      error: error.message,
    });
  }
};

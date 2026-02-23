const express = require("express");
const router = express.Router();
const AdministrativeArea = require("../models/AdministrativeArea");

// Test endpoint to verify route is registered
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Location routes are working!",
  });
});

// Get all countries
router.get("/countries", async (req, res) => {
  try {
    console.log("Fetching countries from database...");
    const countries = await AdministrativeArea.getAllCountries();
    console.log(`Found ${countries.length} countries`);
    res.json({
      success: true,
      data: countries,
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching countries",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Get regions by country code
router.get("/countries/:countryCode/regions", async (req, res) => {
  try {
    const { countryCode } = req.params;
    const regions = await AdministrativeArea.getRegionsByCountry(
      countryCode.toUpperCase()
    );
    res.json({
      success: true,
      data: regions,
    });
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching regions",
      error: error.message,
    });
  }
});

// Get cities by region code and country code
router.get(
  "/countries/:countryCode/regions/:regionCode/cities",
  async (req, res) => {
    try {
      const { countryCode, regionCode } = req.params;
      const cities = await AdministrativeArea.getCitiesByRegion(
        regionCode,
        countryCode.toUpperCase()
      );
      res.json({
        success: true,
        data: cities,
      });
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching cities",
        error: error.message,
      });
    }
  }
);

// Alternative endpoint: Get regions by country ID
router.get("/countries/:countryId/regions-by-id", async (req, res) => {
  try {
    const { countryId } = req.params;
    const regions = await AdministrativeArea.getRegionsByCountryId(
      parseInt(countryId)
    );
    res.json({
      success: true,
      data: regions,
    });
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching regions",
      error: error.message,
    });
  }
});

// Alternative endpoint: Get cities by region ID
router.get("/regions/:regionId/cities", async (req, res) => {
  try {
    const { regionId } = req.params;
    const cities = await AdministrativeArea.getCitiesByRegionId(
      parseInt(regionId)
    );
    res.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cities",
      error: error.message,
    });
  }
});

module.exports = router;

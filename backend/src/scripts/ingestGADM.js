const fs = require("fs");
const path = require("path");
const https = require("https");
const AdministrativeArea = require("../models/AdministrativeArea");
require("dotenv").config();

// Country codes for selected countries
const COUNTRIES_TO_INGEST = [
  { code: "KEN", name: "Kenya", iso3: "KEN" },
  { code: "UGA", name: "Uganda", iso3: "UGA" },
  { code: "SDN", name: "Sudan", iso3: "SDN" },
  { code: "DJI", name: "Djibouti", iso3: "DJI" },
];

// GADM data is available at https://gadm.org/download_country.html
// We'll use the direct download URLs or API if available
// For now, we'll use the GeoJSON format from GADM
const GADM_BASE_URL = "https://geodata.ucdavis.edu/gadm/gadm4.1/json";
const DOWNLOAD_DIR = path.join(__dirname, "../../data/gadm");
const TEMP_DIR = path.join(__dirname, "../../data/temp");

// Ensure directories exist
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Download a file from URL
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          return downloadFile(response.headers.location, dest)
            .then(resolve)
            .catch(reject);
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

/**
 * Check if a file exists and has valid content
 */
function isValidJSONFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  const content = fs.readFileSync(filePath, "utf8").trim();
  if (!content || content.length === 0) {
    return false;
  }
  try {
    JSON.parse(content);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Download GADM data for a specific admin level
 */
async function downloadGADMLevel(countryCode, level) {
  const url = `${GADM_BASE_URL}/gadm41_${countryCode}_${level}.json`;
  const filePath = path.join(
    DOWNLOAD_DIR,
    `gadm41_${countryCode}_${level}.json`
  );

  console.log(`Downloading GADM Admin Level ${level} for ${countryCode}...`);
  console.log(`URL: ${url}`);

  try {
    // Check if file already exists and is valid
    if (fs.existsSync(filePath)) {
      if (isValidJSONFile(filePath)) {
        console.log(`File already exists: ${filePath}`);
        return filePath;
      } else {
        // File exists but is empty/invalid, delete it and re-download
        console.log(`Existing file is empty/invalid, re-downloading...`);
        fs.unlinkSync(filePath);
      }
    }

    await downloadFile(url, filePath);

    // Verify the downloaded file is valid
    if (isValidJSONFile(filePath)) {
      console.log(`Downloaded: ${filePath}`);
      return filePath;
    } else {
      // Downloaded file is empty/invalid (might not exist on server)
      console.log(
        `Downloaded file is empty - level ${level} may not be available for ${countryCode}`
      );
      fs.unlinkSync(filePath); // Clean up empty file
      return null;
    }
  } catch (error) {
    // If file was created but download failed, clean it up
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    console.log(
      `Level ${level} not available for ${countryCode}: ${error.message}`
    );
    return null;
  }
}

/**
 * Download all GADM levels for a country
 */
async function downloadGADMData(countryCode) {
  const levels = [0, 1, 2, 3];
  const downloadedFiles = {};

  for (const level of levels) {
    const filePath = await downloadGADMLevel(countryCode, level);
    if (filePath) {
      downloadedFiles[`level${level}`] = filePath;
    }
  }

  return downloadedFiles;
}

/**
 * Parse GADM GeoJSON and extract administrative areas for all levels
 */
function parseGADMGeoJSON(filePath, level = null) {
  // Check if file is valid before parsing
  if (!isValidJSONFile(filePath)) {
    console.log(`  Warning: File ${filePath} is empty or invalid, skipping...`);
    return {
      adminLevel0: null,
      adminLevel1: [],    
      adminLevel2: [],
      adminLevel3: [],
    };
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const features = data.features || [];

  // Determine level from filename if not provided
  if (level === null) {
    const match = filePath.match(/gadm41_\w+_(\d)\.json/);
    level = match ? parseInt(match[1]) : 0;
  }

  const adminAreas = {
    adminLevel0: null,
    adminLevel1: [],
    adminLevel2: [],
    adminLevel3: [],
  };

  features.forEach((feature) => {
    const props = feature.properties;

    // Admin Level 0 (Country)
    if (level === 0 && props.NAME_0) {
      if (!adminAreas.adminLevel0) {
        adminAreas.adminLevel0 = {
          code: props.GID_0 || props.ISO,
          name: props.NAME_0 || props.COUNTRY,
          nameIso: props.NAME_0,
          gadmId: props.GID_0,
        };
      }
    }

    // Admin Level 1
    if (level === 1 && props.NAME_1) {
      adminAreas.adminLevel1.push({
        code: props.GID_1 || props.HASC_1 || `AL1_${props.NAME_1}`,
        name: props.NAME_1,
        nameLocal: props.VARNAME_1 || props.NL_NAME_1,
        gadmId: props.GID_1,
        countryCode: props.GID_0 || props.ISO,
      });
    }

    // Admin Level 2
    if (level === 2 && props.NAME_2) {
      adminAreas.adminLevel2.push({
        code: props.GID_2 || `AL2_${props.NAME_2}`,
        name: props.NAME_2,
        nameLocal: props.VARNAME_2 || props.NL_NAME_2,
        gadmId: props.GID_2,
        adminLevel1Code: props.GID_1,
        countryCode: props.GID_0 || props.ISO,
      });
    }

    // Admin Level 3
    if (level === 3 && props.NAME_3) {
      adminAreas.adminLevel3.push({
        code: props.GID_3 || `AL3_${props.NAME_3}`,
        name: props.NAME_3,
        nameLocal: props.VARNAME_3 || props.NL_NAME_3,
        gadmId: props.GID_3,
        adminLevel2Code: props.GID_2,
        adminLevel1Code: props.GID_1,
        countryCode: props.GID_0 || props.ISO,
      });
    }
  });

  return adminAreas;
}

/**
 * Ingest data into database for all admin levels
 */
async function ingestData(adminAreas, countryCode) {
  try {
    let adminLevel0, adminLevel1Map, adminLevel2Map;
    let adminLevel1Count = 0,
      adminLevel2Count = 0,
      adminLevel3Count = 0;

    // Insert Admin Level 0 (Country)
    if (adminAreas.adminLevel0) {
      adminLevel0 = await AdministrativeArea.upsertAdminLevel0(
        adminAreas.adminLevel0.code,
        adminAreas.adminLevel0.name,
        adminAreas.adminLevel0.nameIso,
        adminAreas.adminLevel0.gadmId
      );
      console.log(
        `Inserted Admin Level 0: ${adminLevel0.name} (${adminLevel0.code})`
      );
    } else {
      // Fallback: create country from countryCode if not found
      const countryName =
        COUNTRIES_TO_INGEST.find((c) => c.code === countryCode)?.name ||
        countryCode;
      adminLevel0 = await AdministrativeArea.upsertAdminLevel0(
        countryCode,
        countryName,
        countryCode,
        `${countryCode}.0`
      );
      console.log(
        `Created Admin Level 0: ${adminLevel0.name} (${adminLevel0.code})`
      );
    }

    // Insert Admin Level 1
    adminLevel1Map = new Map();
    const uniqueAL1 = new Map();
    adminAreas.adminLevel1.forEach((al1) => {
      const key = al1.code || al1.name;
      if (!uniqueAL1.has(key)) {
        uniqueAL1.set(key, al1);
      }
    });

    for (const al1 of uniqueAL1.values()) {
      const dbAL1 = await AdministrativeArea.upsertAdminLevel1(
        adminLevel0.id,
        al1.code || al1.name,
        al1.name,
        al1.nameLocal,
        al1.gadmId
      );
      adminLevel1Map.set(al1.code || al1.name, dbAL1.id);
      adminLevel1Count++;
      if (adminLevel1Count % 50 === 0) {
        console.log(`  Inserted ${adminLevel1Count} Admin Level 1 areas...`);
      }
    }
    console.log(`  Inserted ${adminLevel1Count} Admin Level 1 areas`);

    // Insert Admin Level 2
    adminLevel2Map = new Map();
    const uniqueAL2 = new Map();
    adminAreas.adminLevel2.forEach((al2) => {
      const key = `${al2.adminLevel1Code}-${al2.code || al2.name}`;
      if (!uniqueAL2.has(key)) {
        uniqueAL2.set(key, al2);
      }
    });

    for (const al2 of uniqueAL2.values()) {
      const adminLevel1Id = adminLevel1Map.get(al2.adminLevel1Code);
      if (adminLevel1Id) {
        const dbAL2 = await AdministrativeArea.upsertAdminLevel2(
          adminLevel1Id,
          al2.code || al2.name,
          al2.name,
          al2.nameLocal,
          al2.gadmId
        );
        adminLevel2Map.set(al2.code || al2.name, dbAL2.id);
        adminLevel2Count++;
        if (adminLevel2Count % 100 === 0) {
          console.log(`  Inserted ${adminLevel2Count} Admin Level 2 areas...`);
        }
      }
    }
    console.log(`  Inserted ${adminLevel2Count} Admin Level 2 areas`);

    // Insert Admin Level 3
    const uniqueAL3 = new Map();
    adminAreas.adminLevel3.forEach((al3) => {
      const key = `${al3.adminLevel2Code}-${al3.code || al3.name}`;
      if (!uniqueAL3.has(key)) {
        uniqueAL3.set(key, al3);
      }
    });

    for (const al3 of uniqueAL3.values()) {
      const adminLevel2Id = adminLevel2Map.get(al3.adminLevel2Code);
      if (adminLevel2Id) {
        await AdministrativeArea.upsertAdminLevel3(
          adminLevel2Id,
          al3.code || al3.name,
          al3.name,
          al3.nameLocal,
          al3.gadmId
        );
        adminLevel3Count++;
        if (adminLevel3Count % 100 === 0) {
          console.log(`  Inserted ${adminLevel3Count} Admin Level 3 areas...`);
        }
      }
    }
    console.log(`  Inserted ${adminLevel3Count} Admin Level 3 areas`);

    return {
      adminLevel0,
      adminLevel1: adminLevel1Count,
      adminLevel2: adminLevel2Count,
      adminLevel3: adminLevel3Count,
    };
  } catch (error) {
    console.error("Error ingesting data:", error);
    throw error;
  }
}

/**
 * Main ingestion function
 */
async function main() {
  try {
    console.log("Starting GADM data ingestion...");

    // Create tables
    await AdministrativeArea.createTable();

    // Process each country
    for (const country of COUNTRIES_TO_INGEST) {
      try {
        console.log(`\nProcessing ${country.name} (${country.code})...`);

        // Download all admin levels
        const downloadedFiles = await downloadGADMData(country.code);

        // Combine all admin levels
        const adminAreas = {
          adminLevel0: null,
          adminLevel1: [],
          adminLevel2: [],
          adminLevel3: [],
        };

        // Parse each level (only if file exists and is valid)
        if (downloadedFiles.level0 && isValidJSONFile(downloadedFiles.level0)) {
          const level0Data = parseGADMGeoJSON(downloadedFiles.level0, 0);
          adminAreas.adminLevel0 = level0Data.adminLevel0;
        }

        if (downloadedFiles.level1 && isValidJSONFile(downloadedFiles.level1)) {
          const level1Data = parseGADMGeoJSON(downloadedFiles.level1, 1);
          adminAreas.adminLevel1 = level1Data.adminLevel1;
        }

        if (downloadedFiles.level2 && isValidJSONFile(downloadedFiles.level2)) {
          const level2Data = parseGADMGeoJSON(downloadedFiles.level2, 2);
          adminAreas.adminLevel2 = level2Data.adminLevel2;
        }

        if (downloadedFiles.level3 && isValidJSONFile(downloadedFiles.level3)) {
          const level3Data = parseGADMGeoJSON(downloadedFiles.level3, 3);
          adminAreas.adminLevel3 = level3Data.adminLevel3;
        }

        // Ensure country info is set
        if (!adminAreas.adminLevel0) {
          adminAreas.adminLevel0 = {
            code: country.code,
            name: country.name,
            nameIso: country.iso3,
            gadmId: `${country.code}.0`,
          };
        }

        const result = await ingestData(adminAreas, country.code);
        console.log(
          `✓ Completed ${country.name}: AL1=${result.adminLevel1}, AL2=${result.adminLevel2}, AL3=${result.adminLevel3}`
        );
      } catch (error) {
        console.error(`Error processing ${country.name}:`, error.message);
      }
    }

    console.log("\n✓ GADM data ingestion completed!");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().then(() => process.exit(0));
}

module.exports = { main, downloadGADMData, parseGADMGeoJSON, ingestData };

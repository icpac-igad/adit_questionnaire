# GADM Data Ingestion

This guide explains how to download and ingest GADM (Global Administrative Areas) data into the database.

## Overview

GADM provides maps and spatial data for all countries and their sub-divisions. We use this data to populate the location dropdowns (countries, regions, cities) in the questionnaire form.

## Prerequisites

1. Database is running and accessible
2. Environment variables are set in `.env` file
3. Node.js and npm are installed

## Steps to Ingest GADM Data

### 1. Ensure Database Tables are Created

The tables will be created automatically when you start the server, but you can also create them manually by running:

```bash
npm start
```

This will create the `countries`, `regions`, and `cities` tables.

### 2. Run the Ingestion Script

```bash
npm run ingest:gadm
```

This script will:

- Download GADM GeoJSON files for East African countries (Kenya, Uganda, Sudan, Djibouti, Ethiopia, Somalia, Eritrea, South Sudan)
- Parse the administrative boundaries (countries, regions/admin level 1, cities/admin level 2)
- Insert the data into the database

### 3. Verify the Data

You can verify the data was ingested by checking the API endpoints:

```bash
# Get all countries
curl http://localhost:3003/api/locations/countries

# Get regions for a country (e.g., Kenya)
curl http://localhost:3003/api/locations/countries/KEN/regions

# Get cities for a region (e.g., Nairobi region in Kenya)
curl http://localhost:3003/api/locations/countries/KEN/regions/KEN.1_1/cities
```

## GADM Data Source

GADM data is available at: https://gadm.org/

The script downloads data from:

- Base URL: `https://geodata.ucdavis.edu/gadm/gadm4.1/json`

## Manual Download (Alternative)

If the automatic download fails, you can manually download GADM data:

1. Visit https://gadm.org/download_country.html
2. Select the country you want
3. Choose GeoJSON format
4. Download and place in `backend/data/gadm/` directory
5. Modify the ingestion script to read from local files

## Troubleshooting

### Download Fails

If downloads fail, check:

- Internet connection
- GADM server availability
- File permissions in `backend/data/` directory

### Data Not Appearing

If data doesn't appear:

- Check database connection
- Verify tables were created
- Check for errors in the ingestion script output
- Verify country codes match expected format

### Partial Data

If only some countries are ingested:

- Check the script output for errors
- Re-run the script (it uses `ON CONFLICT` so it's safe to re-run)
- Check individual country files for issues

## Data Structure

The ingested data follows this hierarchy:

- **Countries**: Top-level administrative units
- **Regions**: Admin Level 1 (states, provinces, counties)
- **Cities**: Admin Level 2 (districts, municipalities, cities)

## Updating Data

To update the GADM data:

1. Delete old data if needed (optional, script handles updates)
2. Re-run the ingestion script: `npm run ingest:gadm`
3. The script uses `ON CONFLICT` clauses, so it will update existing records

## Notes

- The script downloads data for all East African countries defined in `EAST_AFRICAN_COUNTRIES`
- Downloaded files are cached in `backend/data/gadm/` to avoid re-downloading
- The ingestion process may take several minutes depending on data size
- Large countries may have thousands of cities/towns

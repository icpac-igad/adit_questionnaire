# ICPAC Drought Impact Tracker API

Node.js Express backend API with PostgreSQL for the ICPAC Drought Impact Tracker questionnaire system.

## Features

- ✅ Full CRUD operations for questionnaire responses
- ✅ PostgreSQL database with proper schema
- ✅ Input validation using express-validator
- ✅ Error handling middleware
- ✅ CORS support for frontend integration
- ✅ Security headers with Helmet
- ✅ Request logging with Morgan
- ✅ Database connection pooling
- ✅ Automatic table creation on startup

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials:

```env
PORT=3003
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adit_questionnaire
DB_USER=postgres
DB_PASSWORD=postgres
CORS_ORIGIN=http://localhost:3000
```

4. Create the PostgreSQL database:

```bash
createdb adit_questionnaire
```

Or using psql:

```sql
CREATE DATABASE adit_questionnaire;
```

## Running the Server

### Development mode (with auto-reload):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will automatically create the database table on startup if it doesn't exist.

## API Endpoints

### Health Check

- **GET** `/health` - Check server and database health

### Responses

- **POST** `/api/responses` - Create a new response
- **GET** `/api/responses` - Get all responses (with optional filters)
- **GET** `/api/responses/:id` - Get a specific response by ID
- **PUT** `/api/responses/:id` - Update a response by ID
- **DELETE** `/api/responses/:id` - Delete a response by ID

### Query Parameters (for GET /api/responses)

- `email` - Filter by email
- `country` - Filter by country
- `region` - Filter by region
- `startDate` - Filter by start date (ISO 8601 format)
- `endDate` - Filter by end date (ISO 8601 format)
- `limit` - Limit number of results (1-100)
- `offset` - Offset for pagination

### Example Requests

#### Create a response:

```bash
POST /api/responses
Content-Type: application/json

{
  "respondent_name": "John Doe",
  "email": "john@example.com",
  "country": "Kenya",
  "region": "Nairobi",
  "town": "Nairobi",
  "date_of_report": "2024-01-15",
  "role": ["Farmer or livestock producer"],
  "dry_wet_condition": "severely_dry"
}
```

#### Get all responses:

```bash
GET /api/responses
```

#### Get responses with filters:

```bash
GET /api/responses?country=Kenya&limit=10&offset=0
```

#### Get a specific response:

```bash
GET /api/responses/1
```

#### Update a response:

```bash
PUT /api/responses/1
Content-Type: application/json

{
  "dry_wet_condition": "moderately_dry"
}
```

#### Delete a response:

```bash
DELETE /api/responses/1
```

## Project Structure

```
api/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection configuration
│   ├── controllers/
│   │   └── responseController.js # Business logic for responses
│   ├── middleware/
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── validation.js        # Request validation middleware
│   ├── models/
│   │   └── Response.js          # Database model for responses
│   ├── routes/
│   │   └── responseRoutes.js    # API routes for responses
│   └── server.js                # Express server setup
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Response Model Fields

The response model includes all fields from the questionnaire form:

- Reporter Information: `role`, `role_other_text`, `respondent_name`, `email`
- Location: `country`, `region`, `town`, `date_of_report`
- Conditions Assessment: `dry_wet_condition`, `experience_years`, `times_seen_like_this`, etc.
- Normal/Wet Conditions: `normal_or_wet_conditions` (array)
- Crop Production: `crop_production_effects` (array), `crop_conditions`, etc.
- Livestock Production: `livestock_production_effects` (array), `range_conditions`
- Public Health: `public_health_effects` (array)
- Household: `household_effects` (array)
- Business/Industry: `business_industry_effects` (array)
- Forest: `forest_effects` (array)
- Timestamps: `created_at`, `updated_at`

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Validation

All input is validated using express-validator. Invalid requests return:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## Security

- Helmet.js for security headers
- CORS configured for frontend origin
- Input validation and sanitization
- SQL injection protection via parameterized queries

## License

ISC

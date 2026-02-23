# ICPAC Drought Impact Tracker Questionnaire

A Node.js Express + React application for collecting drought impact questionnaire responses with PostgreSQL database.

## Project Structure

```
adit-questionnaire/
├── backend/              # Node.js Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── types/
│   │   └── data/
│   ├── public/
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 14+
- PostgreSQL 12+
- npm or yarn

## Setup Instructions

### 1. Backend (Node.js Express API)

Navigate to api directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:

Create PostgreSQL database:

Run development server:

```bash
npm run dev or npm start
```

The server will automatically create the database table on startup.

API will be available at: http://localhost:3003

### 2. Frontend (React)

Navigate to frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm start
```

Frontend will be available at: http://localhost:3000

## Database Configuration

The app uses PostgreSQL. Configure the database settings in the `backend/.env` file.

Make sure PostgreSQL is running and the database `adit_questionnaire` exists.

## Features

- **Mobile-optimized** web-based questionnaire form
- PostgreSQL database for storing responses
- RESTful API endpoints for CRUD operations
- Responsive React frontend with Material-UI
- Input validation and error handling
- CORS support for frontend integration
- Automatic database table creation on startup

## API Endpoints

### Health Check

- `GET /health` - Check server and database health

### Responses

- `POST /api/responses` - Create a new response
- `GET /api/responses` - Get all responses (with optional filters)
  - Query parameters: `email`, `country`, `region`, `startDate`, `endDate`, `limit`, `offset`
- `GET /api/responses/:id` - Get a specific response by ID
- `PUT /api/responses/:id` - Update a response by ID
- `DELETE /api/responses/:id` - Delete a response by ID

### Example API Requests

#### Create a response:

```bash
curl -X POST http://localhost:3003/api/responses \
  -H "Content-Type: application/json" \
  -d '{
    "respondent_name": "John Doe",
    "email": "john@example.com",
    "country": "Kenya",
    "region": "Nairobi",
    "town": "Nairobi",
    "date_of_report": "2024-01-15",
    "role": ["Farmer or livestock producer"],
    "dry_wet_condition": "severely_dry"
  }'
```

#### Get all responses:

```bash
curl http://localhost:3003/api/responses
```

#### Get responses with filters:

```bash
curl "http://localhost:3003/api/responses?country=Kenya&limit=10&offset=0"
```

#### Get a specific response:

```bash
curl http://localhost:3003/api/responses/1
```

#### Update a response:

```bash
curl -X PUT http://localhost:3003/api/responses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "dry_wet_condition": "moderately_dry"
  }'
```

#### Delete a response:

```bash
curl -X DELETE http://localhost:3003/api/responses/1
```

## Questionnaire Form Fields

The questionnaire collects comprehensive drought impact data including:

- **Reporter Information**: Role, name, email
- **Location**: Country, region, town, date of report
- **Conditions Assessment**: Dry/wet conditions, experience, historical patterns
- **Normal/Wet Conditions**: Various indicators
- **Crop Production Impact**: Effects, conditions, planting/harvest status
- **Livestock Production Impact**: Effects, range conditions
- **Public Health Impact**: Community health effects
- **Household Impact**: Household-level effects
- **Business/Industry Impact**: Economic effects
- **Forest Impact**: Forestry-related effects

## Development

### Backend Development

- Uses Node.js with Express framework
- PostgreSQL with connection pooling
- Input validation with express-validator
- Error handling middleware
- CORS, Helmet, and Morgan for security and logging

### Frontend Development

- React with TypeScript
- Material-UI components
- Mobile-first responsive design
- Form validation
- Optimized for mobile devices

## Testing

Test the API endpoints using curl, Postman, or any HTTP client (see examples above).

You can also test the health endpoint:

```bash
curl http://localhost:3003/health
```

## Project Architecture

### Backend (API)

- **Models**: Table definitions and sync methods
- **Controllers**: All CRUD operations with database queries
- **Routes**: API endpoints with validation middleware
- **Middleware**: Request validation and error handling

### Frontend

- **Components**: Reusable React components
- **Types**: TypeScript type definitions
- **Data**: Static data and configuration

## License

ISC

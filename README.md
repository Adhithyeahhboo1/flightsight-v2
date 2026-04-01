# FlightSight v2

FlightSight is a full-stack flight tracking dashboard with:

- React frontend
- Express backend
- MySQL database
- AI assistant drawer
- single-host local and deployment mode

## Local run

Use only:

```bat
START_BACKEND.bat
```

Then open:

```text
http://localhost:3001
```

## Database

Database setup file:

```text
backend/setup.sql
```

Quick verification inside MySQL:

```sql
SHOW DATABASES;
USE flightsight;
SHOW TABLES;
SELECT COUNT(*) FROM flights;
SELECT COUNT(*) FROM airports;
SELECT COUNT(*) FROM users;
```

## Environment

Backend environment file:

```text
backend/.env
```

Expected variables:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=flightsight
JWT_SECRET=flightsight_jwt_secret_2024
FRONTEND_ORIGIN=http://localhost:3001
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

## Deployment

This project is configured for single-host deployment:

- backend serves the built frontend
- one deployed app URL can serve both frontend and backend

Recommended deployment flow:

1. Push this folder to one GitHub repository
2. Deploy the repo as one Node web service
3. Set backend environment variables on the deployment platform

For forms that ask for separate frontend/backend links, you can usually use the same repo URL and same deployed app URL because this app now runs as a single-host monorepo.

## Useful links after deployment

- Frontend URL: your app root URL
- Backend URL: your app root URL plus `/api/...`
- Health check: `/api/health`
- Flight lookup example: `/api/flight/AI203`

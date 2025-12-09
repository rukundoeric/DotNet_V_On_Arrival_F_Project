# Visa On Arrival Management System

This project is split into two parts:
- **Backend**: .NET Web API
- **Frontend**: React application

## Project Structure

```
/backend
  /VisaOnArrivalApi - .NET Web API project
    /Controllers - API endpoints
    /Models - Entity models
    /Data - Database context
    /Migrations - EF Core migrations

/frontend
  - React application
  /src/services - API service layer
```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/VisaOnArrivalApi
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Update database connection string in `appsettings.json`

4. Run migrations:
   ```bash
   dotnet ef database update
   ```

5. Run the API:
   ```bash
   dotnet run
   ```

The API will be available at `https://localhost:7127` (or the port shown in console)

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API URL in `.env` file if needed:
   ```
   REACT_APP_API_URL=https://localhost:7127/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Visa Applications
- `GET /api/VisaApplications` - Get all visa applications
- `GET /api/VisaApplications/{id}` - Get visa application by ID
- `POST /api/VisaApplications` - Create new visa application
- `PUT /api/VisaApplications/{id}` - Update visa application
- `DELETE /api/VisaApplications/{id}` - Delete visa application

### Arrival Records
- `GET /api/ArrivalRecords` - Get all arrival records
- `GET /api/ArrivalRecords/{id}` - Get arrival record by ID
- `POST /api/ArrivalRecords` - Create new arrival record
- `PUT /api/ArrivalRecords/{id}` - Update arrival record
- `DELETE /api/ArrivalRecords/{id}` - Delete arrival record

### Users
- `GET /api/Users` - Get all users
- `GET /api/Users/{id}` - Get user by ID
- `POST /api/Users` - Create new user
- `PUT /api/Users/{id}` - Update user
- `DELETE /api/Users/{id}` - Delete user

## Features Implemented

### Backend (Web API)
- Complete CRUD operations for Visa Applications, Arrival Records, and Users
- Automatic reference number generation (format: RW{year}{dayOfYear}{random})
- DTOs for clean API contracts
- Entity Framework Core with SQL Server
- CORS configured for React frontend
- **Comprehensive logging with Serilog**
  - Logs all API operations (GET, POST, PUT, DELETE)
  - Logs errors, warnings, and informational messages
  - Console logging for development
  - File logging with daily rotation (logs stored in `logs/` folder)
  - Structured logging with context (operation details, IDs, etc.)
  - Request/response logging middleware

### Frontend (React)
- Rwanda-themed visa application form
- Form validation
- Success confirmation with reference number display
- Error handling
- Responsive design
- API integration with axios

## API Testing

You can test the API using tools like Postman or curl:

```bash
# Create a visa application
curl -X POST https://localhost:7127/api/VisaApplications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "contactNumber": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "passportNumber": "AB123456",
    "nationality": "American",
    "arrivalDate": "2025-01-15",
    "expectedDepartureDate": "2025-01-30",
    "purposeOfVisit": "Tourism",
    "accommodationAddress": "Kigali Marriott Hotel"
  }'
```

## Logging

The backend uses **Serilog** for comprehensive logging:

### Log Locations
- **Console**: Real-time logs displayed in the terminal
- **Files**: Daily rotating log files in `backend/VisaOnArrivalApi/logs/`
  - Format: `visa-api-YYYY-MM-DD.txt`
  - Retention: 30 days

### What Gets Logged
- **Information**: All API operations (start and completion)
- **Warning**: Not found resources, validation failures, ID mismatches
- **Error**: Exceptions with full stack traces, database errors, concurrency issues
- **Request Logging**: HTTP requests and responses (via Serilog middleware)

### Log Format
```
[HH:mm:ss INF] VisaOnArrivalApi.Controllers.VisaApplicationsController: Creating new visa application for John Doe
[HH:mm:ss ERR] VisaOnArrivalApi.Controllers.VisaApplicationsController: Error occurred while creating visa application
System.Exception: Database connection failed
   at VisaOnArrivalApi.Controllers.VisaApplicationsController.CreateVisaApplication()
```

### Configuration
Logging levels can be adjusted in `appsettings.json`:
```json
"Serilog": {
  "MinimumLevel": {
    "Default": "Information",
    "Override": {
      "Microsoft": "Warning"
    }
  }
}
```

## Notes

- CORS is configured to allow requests from `http://localhost:3000` and `http://localhost:5173`
- The old Razor Pages project is still available in `DotNet_V_On_Arrival_F_Projectcation2/` directory for reference
- Frontend and backend are completely decoupled - they can be deployed separately
- The application replicates all functionality from the original Razor Pages project
- Logs folder is gitignored - logs are not committed to version control
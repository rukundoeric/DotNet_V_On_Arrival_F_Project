# API Testing Guide

## Files

- **`visaApplication.http`** - Full test suite with HTTPS (requires trusted certificate)
- **`visaApplication-http.http`** - HTTP version (no SSL issues, recommended for development)

## Quick Start

### Option 1: Use HTTP (Recommended - No SSL Issues)

Use `visaApplication-http.http` which connects to `http://localhost:5262/api`

### Option 2: Fix SSL Certificate for HTTPS

If you want to use HTTPS (`https://localhost:7268`), you need to trust the development certificate:

#### macOS:
```bash
dotnet dev-certs https --trust
```

#### Windows:
```bash
dotnet dev-certs https --trust
```

#### Linux:
```bash
dotnet dev-certs https
# Then manually import the certificate to your system's trusted store
```

### Option 3: Disable SSL Validation (Development Only)

For IntelliJ/Rider HTTP Client:
1. Go to Settings/Preferences
2. Tools → HTTP Client
3. Check "Allow untrusted certificates"

For VS Code REST Client:
Add to settings.json:
```json
{
  "rest-client.certificates": {
    "localhost:7268": {
      "cert": "",
      "key": "",
      "pfx": "",
      "passphrase": "",
      "rejectUnauthorized": false
    }
  }
}
```

## How to Use

### IntelliJ IDEA / Rider (Built-in)
1. Open any `.http` file
2. Click the green ▶ (play) button next to any request
3. View response in the bottom panel

### VS Code (with REST Client Extension)
1. Install "REST Client" by Huachao Mao
2. Open any `.http` file
3. Click "Send Request" link above the request
4. View response in a new tab

### Postman
Import the requests manually or use the examples as reference

## Testing Workflow

### 1. Start Backend
```bash
cd backend/VisaOnArrivalApi
dotnet run
```

### 2. Basic Smoke Test
Run "Get All Visa Applications" - should return `[]` or existing applications

### 3. Create Application
Run "Create New Visa Application" - note the `referenceNumber` in response

### 4. Verify Creation
- Run "Get All Visa Applications" again
- Or use "Get by Reference Number" with the reference from step 3

### 5. Test Other Endpoints
Try GET by ID, UPDATE, DELETE as needed

## Typical Test Sequence

```http
1. GET /api/VisaApplications        → Should return []
2. POST /api/VisaApplications       → Creates application, returns ID and reference
3. GET /api/VisaApplications        → Should show 1 application
4. GET /api/VisaApplications/{id}   → Get specific application
5. PUT /api/VisaApplications/{id}   → Update application
6. DELETE /api/VisaApplications/{id}→ Remove application
7. GET /api/VisaApplications        → Should return [] again
```

## Response Examples

### Successful Create (201 Created)
```json
{
  "id": 1,
  "referenceNumber": "RW25343789",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "passportNumber": "AB123456",
  "nationality": "American",
  "dateOfBirth": "1990-05-15T00:00:00",
  "contactNumber": "+1-555-123-4567",
  "arrivalDate": "2025-01-20T00:00:00",
  "expectedDepartureDate": "2025-02-10T00:00:00",
  "purposeOfVisit": "Tourism",
  "accommodationAddress": "Kigali Marriott Hotel",
  "applicationStatus": "Pending",
  "applicationDate": "2025-12-09T13:21:00"
}
```

### Validation Error (400 Bad Request)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Email": ["The Email field is not a valid e-mail address."]
  }
}
```

### Not Found (404)
```json
"Not Found"
```

### Server Error (500)
```
An error occurred while retrieving visa applications
```

## Environment Variables

Both files use variables at the top:
```http
@baseUrl = http://localhost:5262/api
@testFirstName = John
@testLastName = Doe
```

You can modify these to change test data easily.

## Backend Logs

Watch the backend console for detailed logs:
```
[13:21:18 INF] Creating new visa application for John Doe
[13:21:18 INF] Successfully created visa application with reference number: RW25343789
```

## Troubleshooting

### Connection Refused
- Backend not running: Start with `dotnet run`
- Wrong port: Check backend console for actual port

### SSL/Certificate Error
- Use `visaApplication-http.http` instead
- Or trust certificate with `dotnet dev-certs https --trust`

### 500 Server Error
- Check backend logs/console
- Check database connection
- Logs are also in `backend/VisaOnArrivalApi/logs/`

## Tips

1. **Start Simple**: Begin with GET requests
2. **Save IDs**: Copy IDs from responses to use in subsequent requests
3. **Watch Logs**: Keep backend console visible to see what's happening
4. **Use HTTP First**: Avoid SSL issues during development
5. **Check Database**: Verify data is actually being saved

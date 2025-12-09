# Quick Start - No SSL Issues!

## ⚠️ IMPORTANT: Use the HTTP File!

**OPEN THIS FILE:** `visaApplication-http.http`
**NOT THIS FILE:** `visaApplication.http`

## In IntelliJ IDEA / Rider

### Step 1: Open the HTTP File
```
httpTests/visaApplication-http.http
```

### Step 2: Look for this at the top:
```http
@baseUrl = http://localhost:5262/api
```
☑️ Make sure it says **`http://`** (not `https://`)

### Step 3: Click Green Play Button
Click the ▶️ button next to any request

### Step 4: If Still Getting SSL Error

The IDE might be redirecting to HTTPS. To disable SSL verification:

**For IntelliJ IDEA/Rider:**
1. Open Settings/Preferences (⌘+, on Mac, Ctrl+Alt+S on Windows)
2. Navigate to: **Tools → HTTP Client**
3. Check: **☑️ Allow untrusted certificates**
4. Click **OK**

OR create a file: `httpTests/http-client.private.env.json`:
```json
{
  "dev": {
    "allowUntrusted": true
  }
}
```

## Quick Test

### Test 1: Get All Applications
```http
GET http://localhost:5262/api/VisaApplications
```
Expected: `[]`

### Test 2: Create Application
```http
POST http://localhost:5262/api/VisaApplications
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "contactNumber": "+1-555-123-4567",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "passportNumber": "AB123456",
  "nationality": "American",
  "arrivalDate": "2025-01-20T00:00:00.000Z",
  "expectedDepartureDate": "2025-02-10T00:00:00.000Z",
  "purposeOfVisit": "Tourism",
  "accommodationAddress": "Kigali Marriott Hotel"
}
```

Expected Response:
```json
{
  "id": 1,
  "referenceNumber": "RW25343789",
  "firstName": "John",
  ...
}
```

## Still Having Issues?

### Use curl Instead:
```bash
# Test GET
curl http://localhost:5262/api/VisaApplications

# Test POST
curl -X POST http://localhost:5262/api/VisaApplications \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "contactNumber": "+1-555-123-4567",
    "dateOfBirth": "1990-05-15T00:00:00.000Z",
    "passportNumber": "AB123456",
    "nationality": "American",
    "arrivalDate": "2025-01-20T00:00:00.000Z",
    "expectedDepartureDate": "2025-02-10T00:00:00.000Z",
    "purposeOfVisit": "Tourism",
    "accommodationAddress": "Kigali Marriott Hotel"
  }'
```

### Or Use Postman:
1. Open Postman
2. Create new request
3. Method: `POST`
4. URL: `http://localhost:5262/api/VisaApplications`
5. Body → raw → JSON:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "contactNumber": "+1-555-123-4567",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "passportNumber": "AB123456",
  "nationality": "American",
  "arrivalDate": "2025-01-20T00:00:00.000Z",
  "expectedDepartureDate": "2025-02-10T00:00:00.000Z",
  "purposeOfVisit": "Tourism",
  "accommodationAddress": "Kigali Marriott Hotel"
}
```

## Verify Backend is Running

Check you see this in terminal:
```
[13:16:26 INF] Starting Visa On Arrival API application
[13:16:26 INF] Visa On Arrival API application started successfully
```

The backend is listening on:
- HTTP: `http://localhost:5262`
- HTTPS: `https://localhost:7268` (requires certificate trust)

**Use HTTP for testing!**

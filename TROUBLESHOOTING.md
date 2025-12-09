# Troubleshooting Guide

## Frontend Error: "An error occurred while submitting your application"

If you're seeing this error with no backend logs, follow these steps:

### 1. Check Backend is Running

**Start the backend:**
```bash
cd backend/VisaOnArrivalApi
dotnet run
```

You should see output like:
```
[12:34:56 INF] Starting Visa On Arrival API application
[12:34:57 INF] Now listening on: https://localhost:7127
[12:34:57 INF] Application started. Press Ctrl+C to shut down.
```

### 2. Verify Backend URL

Check what URL the backend is running on in the console output. Common ports:
- `https://localhost:7127` (default for .NET 9)
- `https://localhost:5001`
- `http://localhost:5000`

Update `frontend/.env` if needed:
```env
REACT_APP_API_URL=https://localhost:7127/api
```

**Important:** After changing `.env`, restart the React app:
```bash
cd frontend
npm start
```

### 3. Check Browser Console

Open browser Developer Tools (F12) and check the Console tab for detailed errors:

**Network Error (ERR_NETWORK):**
- Backend is not running
- Wrong URL in `.env`
- Firewall blocking connection

**CORS Error:**
```
Access to XMLHttpRequest at 'https://localhost:7127/api/VisaApplications'
from origin 'http://localhost:3000' has been blocked by CORS policy
```
Solution: Backend CORS is already configured. Make sure backend is running.

**SSL Certificate Error:**
```
NET::ERR_CERT_AUTHORITY_INVALID
```
Solution: Trust the development certificate:
```bash
dotnet dev-certs https --trust
```

### 4. Test Backend Directly

Test if the backend is responding:

**Using curl:**
```bash
curl -k https://localhost:7127/api/VisaApplications
```

**Using browser:**
Navigate to: `https://localhost:7127/api/VisaApplications`
(Accept the certificate warning in development)

You should see an empty array `[]` or existing applications.

### 5. Check Database Connection

If backend starts but crashes on first request, check database:

**Error in logs:**
```
[ERR] Error occurred while creating visa application
Microsoft.Data.SqlClient.SqlException: A network-related or instance-specific error...
```

**Solution:**
1. Ensure SQL Server is running
2. Check connection string in `backend/VisaOnArrivalApi/appsettings.json`
3. Run migrations:
```bash
cd backend/VisaOnArrivalApi
dotnet ef database update
```

### 6. Common Fixes

**Frontend shows old cached data:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

**Backend compilation errors:**
```bash
cd backend/VisaOnArrivalApi
dotnet clean
dotnet restore
dotnet build
```

**Port already in use:**
```bash
# Kill process on port 7127 (macOS/Linux)
lsof -ti:7127 | xargs kill -9

# Kill process on port 7127 (Windows)
netstat -ano | findstr :7127
taskkill /PID <PID> /F
```

### 7. Enable Detailed Logging

Temporarily increase logging level in `backend/VisaOnArrivalApi/appsettings.json`:

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug",
      "Override": {
        "Microsoft": "Information",
        "Microsoft.AspNetCore": "Information"
      }
    }
  }
}
```

This will show all HTTP requests and responses in the console.

### 8. Verify Form Data

Check browser console for the form data being sent:
```javascript
console.log('Form data:', formData);
console.log('Converted data:', submitData);
```

Ensure dates are in ISO format:
```json
{
  "dateOfBirth": "2024-01-15T00:00:00.000Z",
  "arrivalDate": "2025-01-20T00:00:00.000Z"
}
```

### Quick Checklist

- [ ] Backend is running (`dotnet run`)
- [ ] Backend URL matches frontend `.env`
- [ ] Browser console shows no CORS errors
- [ ] SSL certificate is trusted (`dotnet dev-certs https --trust`)
- [ ] Database is accessible
- [ ] React app restarted after `.env` changes
- [ ] No firewall blocking localhost connections

### Still Having Issues?

1. Check backend logs in `backend/VisaOnArrivalApi/logs/`
2. Check browser Network tab for the actual request/response
3. Try the curl command to isolate if it's a frontend or backend issue
4. Ensure both frontend and backend are using the same protocol (http vs https)

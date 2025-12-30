# Testing Instructions

## Prerequisites
1. Install Node.js and npm from https://nodejs.org/
2. Generate Gmail App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate new app password for "Mail"
   - Update `.env` file with the password

## Setup Steps
```bash
# Install dependencies
npm install

# Start the server
npm start
```

## Testing Methods

### Method 1: Test Form (Recommended)
1. Open `test-form.html` in your browser
2. Fill in the test form (pre-filled with sample data)
3. Click "Test Notifications"
4. Check both email and WhatsApp for notifications

### Method 2: Main Website Form
1. Start the server: `npm start`
2. Open your main website (index.html or contact.html)
3. Fill out the enquiry form
4. Submit and check notifications

### Method 3: Direct API Test
```bash
curl -X POST http://localhost:3000/api/submit-enquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "location": "Chennai",
    "email": "test@example.com",
    "phone1": "9940764517",
    "phone2": "9876543210",
    "date": "2024-12-25"
  }'
```

## Expected Results
- **Email**: Should receive "New Trip Enquiry" with formatted HTML table
- **WhatsApp**: Should receive message with all form details
- **Form**: Should show success message

## Troubleshooting
- Check server console for errors
- Verify Gmail app password in `.env`
- Ensure Twilio credentials are correct
- Check network connectivity to localhost:3000

# DuduIVHub Backend Setup

## Installation
```bash
npm install
```

## Configuration
1. Update `.env` file with your Gmail App Password:
   - Go to Google Account settings
   - Enable 2-factor authentication
   - Generate an App Password
   - Replace `your_app_password_here` with the generated password

2. Verify Twilio credentials are correct

## Running the Server
```bash
# Development
npm run dev

# Production
npm start
```

## Features
- Automatic email notifications via Gmail SMTP
- Automatic WhatsApp notifications via Twilio
- Form validation and error handling
- Health check endpoint at `/api/health`

## Form Submission Endpoint
- POST `/api/submit-enquiry`
- Accepts JSON data from the frontend form
- Sends both email and WhatsApp notifications automatically

const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000; // Render uses port 10000

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://your-netlify-site.netlify.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio WhatsApp Client
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// Your WhatsApp number (where you want to receive messages)
const YOUR_WHATSAPP_NUMBER = process.env.MY_WHATSAPP || '+919940764517';

// Email sending function
async function sendEmail(message) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'New Trip Enquiry',
    html: `<pre>${message}</pre>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// WhatsApp sending function
async function sendWhatsAppMessage(message) {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP,
      to: YOUR_WHATSAPP_NUMBER
    });
    console.log('WhatsApp message sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

// Form submission endpoint
app.post('/api/submit-enquiry', async (req, res) => {
  try {
    const formData = req.body;
    
    console.log('Received form submission:', formData);

    // Build simple message from form data
    let message = 'New Trip Enquiry\n\n';
    for (const [key, value] of Object.entries(formData)) {
      if (key && value && value.toString().trim() !== '') {
        message += `${key}: ${value}\n`;
      }
    }

    // Send email
    const emailSent = await sendEmail(message);
    
    // Send WhatsApp message
    const whatsappSent = await sendWhatsAppMessage(message);

    if (emailSent && whatsappSent) {
      res.json({ 
        success: true, 
        message: 'Form submitted successfully! You will receive email and WhatsApp notifications.' 
      });
    } else if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Form submitted successfully! Email notification sent. WhatsApp notification failed.' 
      });
    } else if (whatsappSent) {
      res.json({ 
        success: true, 
        message: 'Form submitted successfully! WhatsApp notification sent. Email notification failed.' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Form submitted but notifications failed. Please check your configuration.' 
      });
    }
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing form submission. Please try again.' 
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DuduIVHub API is running', 
    status: 'active',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Register API endpoint
app.get("/api/register", (req, res) => {
  res.send("Register API is working. Use POST method.");
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;

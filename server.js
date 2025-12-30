const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000; // Render uses port 10000

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio WhatsApp Client
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// Your WhatsApp number (where you want to receive messages)
const YOUR_WHATSAPP_NUMBER = process.env.MY_WHATSAPP || '+919940764517';

// Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email sending function
async function sendEmail(message) {
  console.log('📧 Email function called with message length:', message.length);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'New Trip Enquiry',
    html: `<pre>${message}</pre>`
  };

  try {
    console.log('📧 Sending email to:', process.env.EMAIL_USER);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully, Message ID:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('Email error details:', {
      code: error.code,
      message: error.message,
      command: error.command
    });
    return false;
  }
}

// WhatsApp sending function
async function sendWhatsAppMessage(message) {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP,
      to: YOUR_WHATSAPP_NUMBER
    });
    console.log('✅ WhatsApp message sent successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    return false;
  }
}

// Form submission endpoint
app.post('/api/submit-enquiry', async (req, res) => {
  try {
    const formData = req.body;
    
    console.log('=== FORM SUBMISSION START (submit-enquiry) ===');
    console.log('📥 Request received:', formData);
    console.log('📋 Form data keys:', Object.keys(formData));
    console.log('🔍 Environment check:', {
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      TWILIO_SID: !!process.env.TWILIO_SID,
      TWILIO_TOKEN: !!process.env.TWILIO_TOKEN,
      TWILIO_WHATSAPP: !!process.env.TWILIO_WHATSAPP,
      MY_WHATSAPP: !!process.env.MY_WHATSAPP
    });

    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ MISSING EMAIL CONFIGURATION');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Email not configured'
      });
    }

    if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.TWILIO_WHATSAPP || !process.env.MY_WHATSAPP) {
      console.error('❌ MISSING TWILIO CONFIGURATION');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: WhatsApp not configured'
      });
    }

    // Build simple message from form data
    let message = 'New Trip Enquiry\n\n';
    for (const [key, value] of Object.entries(formData)) {
      if (key && value && value.toString().trim() !== '') {
        message += `${key}: ${value}\n`;
      }
    }
    
    console.log('📝 Built message length:', message.length);
    console.log('📧 Starting email transmission...');

    // Send email - MUST SUCCEED
    const emailSent = await sendEmail(message);
    console.log('📧 Email result:', emailSent);
    
    console.log('📱 Starting WhatsApp transmission...');
    // Send WhatsApp - MUST SUCCEED
    const whatsappSent = await sendWhatsAppMessage(message);
    console.log('📱 WhatsApp result:', whatsappSent);

    // STRICT SUCCESS: BOTH MUST SUCCEED
    if (emailSent && whatsappSent) {
      console.log('🎉 BOTH NOTIFICATIONS DELIVERED - SUCCESS');
      res.json({ 
        success: true, 
        message: 'Form submitted successfully! You will receive email and WhatsApp notifications.' 
      });
    } else {
      console.log('💥 NOTIFICATION FAILURE - ONE OR BOTH FAILED');
      console.log('📊 Results:', {
        email: emailSent,
        whatsapp: whatsappSent
      });
      
      const errorMessage = [];
      if (!emailSent) errorMessage.push('Email delivery failed');
      if (!whatsappSent) errorMessage.push('WhatsApp delivery failed');
      
      res.status(500).json({ 
        success: false, 
        message: `Notification system error: ${errorMessage.join(' and ')}. Please try again or contact directly.` 
      });
    }
    
    console.log('=== FORM SUBMISSION END ===');
  } catch (error) {
    console.error('💥 CRITICAL SYSTEM ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Critical system error. Please try again.' 
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

app.post("/api/register", async (req, res) => {
  try {
    const formData = req.body;
    
    console.log('=== FORM SUBMISSION START ===');
    console.log('📥 Request received:', formData);
    console.log('📋 Form data keys:', Object.keys(formData));
    console.log('🔍 Environment check:', {
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      TWILIO_SID: !!process.env.TWILIO_SID,
      TWILIO_TOKEN: !!process.env.TWILIO_TOKEN,
      TWILIO_WHATSAPP: !!process.env.TWILIO_WHATSAPP,
      MY_WHATSAPP: !!process.env.MY_WHATSAPP
    });

    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ MISSING EMAIL CONFIGURATION');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Email not configured'
      });
    }

    if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.TWILIO_WHATSAPP || !process.env.MY_WHATSAPP) {
      console.error('❌ MISSING TWILIO CONFIGURATION');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: WhatsApp not configured'
      });
    }

    // Build simple message from form data
    let message = 'New Trip Enquiry\n\n';
    for (const [key, value] of Object.entries(formData)) {
      if (key && value && value.toString().trim() !== '') {
        message += `${key}: ${value}\n`;
      }
    }
    
    console.log('📝 Built message length:', message.length);
    console.log('📧 Starting email transmission...');

    // Send email - MUST SUCCEED
    let emailSent = false;
    let emailError = null;
    try {
      const result = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Trip Enquiry',
        html: `<pre>${message}</pre>`
      });
      emailSent = true;
      console.log('✅ Email delivered successfully. Message ID:', result.messageId);
    } catch (error) {
      emailError = error;
      console.error('❌ Email delivery FAILED:', {
        code: error.code,
        message: error.message,
        command: error.command
      });
    }

    console.log('📱 Starting WhatsApp transmission...');

    // Send WhatsApp - MUST SUCCEED
    let whatsappSent = false;
    let whatsappError = null;
    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP,
        to: process.env.MY_WHATSAPP
      });
      whatsappSent = true;
      console.log('✅ WhatsApp delivered successfully. Message SID:', result.sid);
    } catch (error) {
      whatsappError = error;
      console.error('❌ WhatsApp delivery FAILED:', {
        code: error.code,
        message: error.message,
        status: error.status
      });
    }

    // STRICT SUCCESS: BOTH MUST SUCCEED
    if (emailSent && whatsappSent) {
      console.log('🎉 BOTH NOTIFICATIONS DELIVERED - SUCCESS');
      res.json({ 
        success: true, 
        message: 'Form submitted successfully! You will receive email and WhatsApp notifications.' 
      });
    } else {
      console.log('💥 NOTIFICATION FAILURE - ONE OR BOTH FAILED');
      console.log('📊 Results:', {
        email: { delivered: emailSent, error: emailError?.message },
        whatsapp: { delivered: whatsappSent, error: whatsappError?.message }
      });
      
      const errorMessage = [];
      if (!emailSent) errorMessage.push('Email delivery failed');
      if (!whatsappSent) errorMessage.push('WhatsApp delivery failed');
      
      res.status(500).json({ 
        success: false, 
        message: `Notification system error: ${errorMessage.join(' and ')}. Please try again or contact directly.`
      });
    }
    
    console.log('=== FORM SUBMISSION END ===');
  } catch (error) {
    console.error('💥 CRITICAL SYSTEM ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Critical system error. Please try again.' 
    });
  }
});

// Test endpoint for notification verification
app.post('/api/test-notifications', async (req, res) => {
  try {
    console.log('🧪 Testing notification system...');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      whatsapp: '1234567890',
      city: 'Test City',
      destination: 'Tamil Nadu',
      travelDate: '2025-12-31',
      people: '2'
    };
    
    // Build test message
    let message = 'New Trip Enquiry\n\n';
    for (const [key, value] of Object.entries(testData)) {
      message += `${key}: ${value}\n`;
    }
    
    console.log('📧 Testing email...');
    const emailSent = await sendEmail(message);
    console.log('📱 Testing WhatsApp...');
    const whatsappSent = await sendWhatsAppMessage(message);
    
    res.json({
      success: true,
      message: 'Test completed',
      results: {
        email: emailSent,
        whatsapp: whatsappSent,
        both: emailSent && whatsappSent
      }
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
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

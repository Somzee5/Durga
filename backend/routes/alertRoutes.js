const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Twilio client (optional - only used if env present)
let twilioClient = null;
try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (accountSid && authToken) {
    twilioClient = require('twilio')(accountSid, authToken);
  }
} catch (e) {
  console.warn('Twilio not configured:', e.message);
}

// Local disk storage for quick prototype (MMS requires public URL; here we just accept audioUrl or skip media)
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// POST /api/v1/alerts/sos
// body: { phone, message, lat, lng, audioUrl? }
router.post('/sos', async (req, res) => {
  try {
    const { phone, message, lat, lng, audioUrl } = req.body || {};

    if (!phone || !message) {
      return res.status(400).json({ error: 'phone and message are required', code: 'INVALID_INPUT' });
    }

    const finalMessage = [
      'SOS EMERGENCY ALERT',
      message,
      (lat && lng) ? `Location: https://www.google.com/maps?q=${lat},${lng}` : null,
    ].filter(Boolean).join('\n');

    if (!twilioClient) {
      return res.status(200).json({
        message: 'SOS received (Twilio not configured on server).',
        payload: { phone, finalMessage, audioUrl },
        code: 'SOS_RECEIVED'
      });
    }

    const from = process.env.TWILIO_FROM_NUMBER;
    const to = phone;

    const twilioPayload = { from, to, body: finalMessage };
    if (audioUrl) {
      twilioPayload.mediaUrl = [audioUrl];
    }

    const result = await twilioClient.messages.create(twilioPayload);
    res.json({ message: 'SOS sent', sid: result.sid, code: 'SOS_SENT' });
  } catch (error) {
    console.error('SOS send error:', error);
    res.status(500).json({ error: 'Failed to send SOS', code: 'SOS_ERROR' });
  }
});

// POST /api/v1/alerts/sos-audio (multipart) -> returns a fake public URL placeholder
router.post('/sos-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'audio file is required', code: 'INVALID_INPUT' });
    }
    // In production, upload to S3/Cloud storage and return public URL
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ message: 'Audio uploaded', audioUrl: publicUrl, code: 'AUDIO_UPLOADED' });
  } catch (error) {
    console.error('SOS audio upload error:', error);
    res.status(500).json({ error: 'Failed to upload audio', code: 'AUDIO_ERROR' });
  }
});

module.exports = router;



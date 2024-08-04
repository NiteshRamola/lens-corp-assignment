const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

const sendMessage = async (body, phone) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+91' + phone,
    });
    logger.log(`Message sent successfully: ${message.sid}`);
  } catch (error) {
    logger.log(`Failed to send message: ${error}`, 'error');
  }
};

module.exports = sendMessage;

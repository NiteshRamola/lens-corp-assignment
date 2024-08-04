const nodemailer = require('nodemailer');
const aws = require('@aws-sdk/client-ses');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');

// Create a transporter using Amazon SES
const transporter = nodemailer.createTransport({
  SES: {
    ses: new aws.SES({
      apiVersion: '2010-12-01',
      region: process.env.AWS_REGION,
      defaultProvider,
    }),
    aws,
  },
});

const sendEmail = async (to, subject, body) => {
  try {
    console.log(process.env.EMAIL_SENDER_ID, to);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_SENDER_ID,
      to,
      subject,
      html: body,
    });
    logger.log(`Message sent successfully: ${info.messageId}`);
  } catch (error) {
    logger.log(`Failed to send message: ${error}`, 'error');
  }
};

module.exports = sendEmail;

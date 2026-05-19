import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Octune Vintage" <hello@octunevintage.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

export const orderConfirmationTemplate = (order) => `
<div style="background-color: #F4EDE0; color: #1A1410; font-family: 'Times New Roman', serif; padding: 40px;">
  <h1 style="color: #B5432A; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</h1>
  <p style="font-family: Arial, sans-serif;">Your 1-of-1 is being prepared.</p>
  <p style="font-family: Arial, sans-serif;">Order Number: ${order.orderNumber}</p>
  <p style="font-family: Arial, sans-serif;">Total: ₹${order.pricing.total}</p>
  <p style="font-family: Arial, sans-serif; margin-top: 40px; font-style: italic;">— The Octune Vintage Crew</p>
</div>
`;

export const dropScheduledTemplate = (drop) => `
<div style="background-color: #F4EDE0; color: #1A1410; font-family: 'Times New Roman', serif; padding: 40px;">
  <h1 style="color: #B5432A; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">New Drop Scheduled</h1>
  <p style="font-family: Arial, sans-serif;">New drop scheduled: ${drop.name} goes live ${new Date(drop.dropAt).toLocaleString()}.</p>
  <p style="font-family: Arial, sans-serif; margin-top: 40px; font-style: italic;">— The Octune Vintage Crew</p>
</div>
`;

export const dropLiveTemplate = (drop, products) => `
<div style="background-color: #F4EDE0; color: #1A1410; font-family: 'Times New Roman', serif; padding: 40px;">
  <h1 style="color: #B5432A; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">It's Live</h1>
  <p style="font-family: Arial, sans-serif;">${drop.name} is now live. ${products.length} pieces. First come, first kept.</p>
  <p style="font-family: Arial, sans-serif; margin-top: 40px; font-style: italic;">— The Octune Vintage Crew</p>
</div>
`;

export const unsubscribeFooter = (token) => `
<div style="margin-top: 40px; font-family: Arial, sans-serif; font-size: 12px; color: #8C7E6D;">
  <a href="${process.env.FRONTEND_URL}/api/subscribers/unsubscribe/${token}">Unsubscribe</a>
</div>
`;

export default sendEmail;

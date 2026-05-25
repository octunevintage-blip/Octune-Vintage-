import nodemailer from 'nodemailer';

export const backInStockEmailTemplate = (product, productUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Courier New', Courier, monospace; background-color: #f4f4f4; padding: 20px; }
    .container { background-color: #ffffff; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; border-top: 4px solid #000; }
    .header { text-align: center; border-bottom: 2px dashed #eee; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
    .content { line-height: 1.6; color: #333; }
    .product-img { max-width: 100%; height: auto; border-radius: 4px; margin: 20px 0; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; font-weight: bold; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">OCTUNE VINTAGE</div>
    </div>
    <div class="content">
      <h2>Good News! It's Back in Stock 🔥</h2>
      <p>The item you were waiting for, <strong>${product.name}</strong>, is now available again.</p>
      ${product.images && product.images[0] ? `<img src="${product.images[0].url}" alt="${product.name}" class="product-img">` : ''}
      <p>Stock is limited and it's first-come, first-served. Grab it before it's gone again!</p>
      <div style="text-align: center;">
        <a href="${productUrl}" class="btn">BUY NOW</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async ({ to, subject, html }) => {
  try {
    const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000, // 5 seconds timeout to prevent hanging
      socketTimeout: 5000,
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
    throw new Error('Email could not be sent');
  }
};

export const orderConfirmationTemplate = (order) => `
<div style="background-color: #F4EDE0; color: #1A1410; font-family: 'Times New Roman', serif; padding: 40px;">
  <img src="${process.env.FRONTEND_URL}/logo.png" alt="Octune Vintage" style="height: 40px; margin-bottom: 20px;" />
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

export const otpEmailTemplate = (otp) => `
<div style="background-color: #F4EDE0; color: #1A1410; font-family: 'Times New Roman', serif; padding: 40px; border: 1px solid #DCD3C1; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #B5432A; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Join the Community</h1>
  <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333230;">Your Octune Vintage verification code is:</p>
  <div style="background-color: #EFE6D5; padding: 20px; text-align: center; border-radius: 4px; margin: 25px 0;">
    <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #B5432A;">${otp}</span>
  </div>
  <p style="font-family: Arial, sans-serif; font-size: 14px; color: #6E6557;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
  <p style="font-family: Arial, sans-serif; margin-top: 40px; font-style: italic; color: #1A1410;">— The Octune Vintage Crew</p>
</div>
`;

export const resetPasswordEmailTemplate = (resetUrl) => `
<div style="background-color: #F4EDE0; color: #1A1410; font-family: 'Times New Roman', serif; padding: 40px; border: 1px solid #DCD3C1; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #B5432A; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Reset Password</h1>
  <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333230;">You requested to reset your password. Click the button below to choose a new password:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetUrl}" style="background-color: #1A1410; color: #FFFFFF; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; text-decoration: none; padding: 15px 30px; border-radius: 4px; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">Reset Password</a>
  </div>
  <p style="font-family: Arial, sans-serif; font-size: 14px; color: #6E6557;">This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
  <p style="font-family: Arial, sans-serif; margin-top: 40px; font-style: italic; color: #1A1410;">— The Octune Vintage Crew</p>
</div>
`;

export default sendEmail;

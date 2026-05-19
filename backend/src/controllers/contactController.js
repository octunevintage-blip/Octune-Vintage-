import sendEmail from '../utils/sendEmail.js';

// Beautiful HTML email template for admin notification
const contactInquiryTemplate = ({ name, email, subject, message, ticketId }) => `
<div style="background-color: #F4EDE0; color: #1A1410; font-family: 'Times New Roman', serif; padding: 40px; max-width: 600px; margin: 0 auto;">
  <div style="border-bottom: 3px solid #B5432A; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: #B5432A; font-size: 24px; text-transform: uppercase; letter-spacing: 3px; margin: 0;">
      New Customer Inquiry
    </h1>
    <p style="font-family: Arial, sans-serif; font-size: 12px; color: #8C7E6D; margin: 8px 0 0 0; letter-spacing: 1px;">
      TICKET ID: ${ticketId}
    </p>
  </div>

  <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #D4C5B0; font-size: 12px; color: #8C7E6D; text-transform: uppercase; letter-spacing: 1px; width: 120px; vertical-align: top;">
        Name
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #D4C5B0; font-size: 15px; color: #1A1410;">
        ${name}
      </td>
    </tr>
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #D4C5B0; font-size: 12px; color: #8C7E6D; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">
        Email
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #D4C5B0; font-size: 15px; color: #1A1410;">
        <a href="mailto:${email}" style="color: #B5432A; text-decoration: none;">${email}</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #D4C5B0; font-size: 12px; color: #8C7E6D; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">
        Subject
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #D4C5B0; font-size: 15px; color: #1A1410;">
        ${subject || 'General Inquiry'}
      </td>
    </tr>
    <tr>
      <td style="padding: 12px 0; font-size: 12px; color: #8C7E6D; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">
        Message
      </td>
      <td style="padding: 12px 0; font-size: 15px; color: #1A1410; line-height: 1.6;">
        ${message.replace(/\n/g, '<br/>')}
      </td>
    </tr>
  </table>

  <div style="margin-top: 30px; padding: 16px; background-color: #EDE5D5; border-left: 3px solid #B5432A;">
    <p style="font-family: Arial, sans-serif; font-size: 13px; color: #8C7E6D; margin: 0;">
      Reply directly to this email or contact the customer at 
      <a href="mailto:${email}" style="color: #B5432A; text-decoration: none;">${email}</a>
    </p>
  </div>

  <p style="font-family: Arial, sans-serif; margin-top: 40px; font-size: 13px; font-style: italic; color: #8C7E6D;">
    — Octune Vintage System
  </p>
</div>
`;

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // Generate unique ticket ID
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@octunevintage.com';

    // Send email to admin using the project's sendEmail utility
    const htmlContent = contactInquiryTemplate({ name, email, subject, message, ticketId });

    await sendEmail({
      to: adminEmail,
      subject: `[${ticketId}] ${subject || 'New Contact Form Inquiry'} — from ${name}`,
      html: htmlContent,
    });

    console.log(`✅ Contact inquiry ${ticketId} from ${name} <${email}> sent to ${adminEmail}`);

    res.status(200).json({ 
      message: 'Message sent successfully!', 
      ticketId 
    });

  } catch (error) {
    console.error('Contact Form Error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};

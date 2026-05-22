import dotenv from 'dotenv';
dotenv.config();

/**
 * Sends an SMS to the registered phone number.
 * Utilizes Twilio if configured in environment variables,
 * otherwise falls back to a mock console output for local development.
 * 
 * @param {string} phone - The recipient's phone number.
 * @param {string} otp - The 6-digit verification code.
 * @returns {Promise<boolean>} Resolves to true if successful, false otherwise.
 */
export const sendSMS = async (phone, otp) => {
  const message = `Your Octune Vintage verification code is ${otp}. Valid for 5 minutes.`;
  
  // Clean phone input and ensure formatting
  let formattedPhone = phone.trim();
  // If it's a 10 digit Indian number without country code, prefix +91
  if (formattedPhone.length === 10 && /^\d+$/.test(formattedPhone)) {
    formattedPhone = `+91${formattedPhone}`;
  }

  // Always log to the console for ease of testing in development
  console.log('\n========================================');
  console.log(`[SMS MOCK] TO: ${formattedPhone}`);
  console.log(`[SMS MOCK] MESSAGE: ${message}`);
  console.log('========================================\n');

  // Check if Twilio API keys are configured and are not placeholders
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    !process.env.TWILIO_ACCOUNT_SID.includes('your_') &&
    process.env.TWILIO_AUTH_TOKEN &&
    !process.env.TWILIO_AUTH_TOKEN.includes('your_') &&
    process.env.TWILIO_FROM_NUMBER &&
    !process.env.TWILIO_FROM_NUMBER.includes('your_')
  ) {
    try {
      // Dynamic import to prevent app crashes if package is not present in local packages
      const { default: twilio } = await import('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_FROM_NUMBER,
        to: formattedPhone,
      });
      console.log(`[Twilio] SMS successfully sent to ${formattedPhone}`);
      return true;
    } catch (error) {
      console.error('[Twilio] Failed to send SMS:', error.message);
      return false;
    }
  }

  return true;
};

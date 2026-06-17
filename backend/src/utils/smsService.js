import dotenv from 'dotenv';
dotenv.config();

/**
 * Mocks sending an SMS. Twilio has been removed.
 * 
 * @param {string} phone - The recipient's phone number.
 * @param {string} otp - The 6-digit verification code.
 * @returns {Promise<boolean>} Resolves to true.
 */
export const sendSMS = async (phone, otp) => {
  const message = `Your Octune Vintage verification code is ${otp}. Valid for 5 minutes.`;
  
  // Clean phone input and ensure formatting
  let formattedPhone = phone.trim();
  if (formattedPhone.length === 10 && /^\d+$/.test(formattedPhone)) {
    formattedPhone = `+91${formattedPhone}`;
  }

  // Always log to the console for ease of testing in development
  console.log('\n========================================');
  console.log(`[SMS MOCK] TO: ${formattedPhone}`);
  console.log(`[SMS MOCK] MESSAGE: ${message}`);
  console.log('========================================\n');

  return true;
};

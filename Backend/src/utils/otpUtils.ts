import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

const transporter = nodemailer.createTransport(emailConfig);

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: emailConfig.auth.user,
      to: email,
      subject: 'Your OTP for Stock Trading Portfolio',
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <h1>Stock Trading Portfolio Authentication</h1>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
};

export const verifyOTP = (userOTP: string, storedOTP: string): boolean => {
  return userOTP === storedOTP;
};

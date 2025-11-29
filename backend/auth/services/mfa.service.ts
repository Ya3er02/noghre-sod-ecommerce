import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface MFASecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerification {
  verified: boolean;
  message: string;
}

/**
 * سرویس Multi-Factor Authentication (2FA)
 * برای امنیت بیشتر حساب‌های کاربری
 */
export class MFAService {
  /**
   * ایجاد Secret جدید برای کاربر
   */
  async generateMFASecret(userId: string, userEmail: string): Promise<MFASecret> {
    const secret = speakeasy.generateSecret({
      name: `نقره سود (${userEmail})`,
      issuer: 'Noghre Sood',
      length: 32,
    });

    // تولید QR Code برای اسکن در اپلیکیشن‌های Authenticator
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    // تولید Backup Codes برای موارد اضطراری
    const backupCodes = this.generateBackupCodes(10);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * تایید کد 2FA وارد شده توسط کاربر
   */
  verifyMFAToken(secret: string, token: string): MFAVerification {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // تلرانس زمانی (±60 ثانیه)
    });

    return {
      verified,
      message: verified 
        ? 'کد تایید صحیح است' 
        : 'کد تایید اشتباه یا منقضی شده است',
    };
  }

  /**
   * تولید Backup Codes برای موارد اضطراری
   * (وقتی کاربر دسترسی به authenticator app ندارد)
   */
  generateBackupCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () => {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      // فرمت: XXXX-XXXX
      return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
    });
  }

  /**
   * بررسی Backup Code
   */
  verifyBackupCode(storedCodes: string[], inputCode: string): boolean {
    const normalizedInput = inputCode.replace(/[^A-Z0-9]/g, '').toUpperCase();
    
    return storedCodes.some(code => {
      const normalizedStored = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
      return normalizedStored === normalizedInput;
    });
  }

  /**
   * تولید کد OTP برای ارسال SMS
   */
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  /**
   * ایجاد Hash از OTP برای ذخیره در دیتابیس
   */
  hashOTP(otp: string, phone: string): string {
    return crypto
      .createHmac('sha256', process.env.OTP_SECRET || 'default-secret')
      .update(`${otp}:${phone}`)
      .digest('hex');
  }

  /**
   * تایید OTP
   */
  verifyOTP(inputOTP: string, phone: string, storedHash: string): boolean {
    const inputHash = this.hashOTP(inputOTP, phone);
    return inputHash === storedHash;
  }
}

// Singleton instance
export const mfaService = new MFAService();

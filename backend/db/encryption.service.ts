import crypto from 'crypto';

/**
 * سرویس رمزنگاری داده‌های حساس
 * برای محافظت از اطلاعات شخصی و مالی کاربران
 */
export class DataEncryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  private keyRotationInterval = 90 * 24 * 60 * 60 * 1000; // 90 روز

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    // کلید باید 32 بایت (256 بیت) باشد
    if (encryptionKey.length !== 64) { // 64 hex chars = 32 bytes
      throw new Error('ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes)');
    }
    
    this.key = Buffer.from(encryptionKey, 'hex');
  }

  /**
   * رمزنگاری متن
   */
  encrypt(text: string): string {
    try {
      // تولید Initialization Vector تصادفی
      const iv = crypto.randomBytes(16);
      
      // ایجاد cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      // رمزنگاری
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // دریافت Authentication Tag برای تایید یکپارچگی داده
      const authTag = cipher.getAuthTag();
      
      // بازگشت به صورت JSON که شامل iv، داده رمزشده و authTag است
      return JSON.stringify({
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        authTag: authTag.toString('hex'),
        version: '1', // برای key rotation
      });
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('خطا در رمزنگاری داده');
    }
  }

  /**
   * رمزگشایی متن
   */
  decrypt(encryptedString: string): string {
    try {
      const { iv, encryptedData, authTag, version } = JSON.parse(encryptedString);
      
      // ایجاد decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(iv, 'hex')
      );
      
      // تنظیم Auth Tag
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      // رمزگشایی
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('خطا در رمزگشایی داده');
    }
  }

  /**
   * Hash کردن داده (یک‌طرفه)
   * برای پسوردها و داده‌هایی که نیازی به رمزگشایی ندارند
   */
  hash(text: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(text, actualSalt, 100000, 64, 'sha512').toString('hex');
    
    return `${actualSalt}:${hash}`;
  }

  /**
   * مقایسه Hash
   */
  compareHash(text: string, hashedText: string): boolean {
    const [salt, hash] = hashedText.split(':');
    const newHash = crypto.pbkdf2Sync(text, salt, 100000, 64, 'sha512').toString('hex');
    
    return hash === newHash;
  }

  /**
   * Mask کردن داده برای نمایش
   * مثلاً شماره کارت: 1234-****-****-5678
   */
  maskData(data: string, type: 'card' | 'phone' | 'email' | 'nationalId'): string {
    switch (type) {
      case 'card':
        // نمایش 4 رقم اول و آخر
        if (data.length === 16) {
          return `${data.slice(0, 4)}-****-****-${data.slice(-4)}`;
        }
        return '****-****-****-****';
      
      case 'phone':
        // 0912***4567
        if (data.length === 11) {
          return `${data.slice(0, 4)}***${data.slice(-4)}`;
        }
        return '****';
      
      case 'email':
        // u***@example.com
        const [local, domain] = data.split('@');
        if (local && domain) {
          return `${local[0]}***@${domain}`;
        }
        return '***@***.com';
      
      case 'nationalId':
        // 123******789
        if (data.length === 10) {
          return `${data.slice(0, 3)}******${data.slice(-3)}`;
        }
        return '**********';
      
      default:
        return '****';
    }
  }

  /**
   * تولید Token تصادفی امن
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * تولید کلید رمزنگاری جدید (برای Key Rotation)
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Singleton instance
export const encryption = new DataEncryption();

/**
 * TypeORM Transformer برای رمزنگاری خودکار
 */
export const encryptionTransformer = {
  to: (value: string | null): string | null => {
    if (!value) return null;
    return encryption.encrypt(value);
  },
  from: (value: string | null): string | null => {
    if (!value) return null;
    return encryption.decrypt(value);
  },
};

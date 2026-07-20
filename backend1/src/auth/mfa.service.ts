import { Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';

// otplib v12 functional API — all calls receive plain objects.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const otplib = require('otplib') as {
  generateSecret: () => string;
  generateSync: (opts: { secret: string }) => string;
  verifySync: (opts: { secret: string; token: string }) => { valid: boolean } | false;
  generateURI: (opts: { accountName: string; label: string; secret: string }) => string;
};

@Injectable()
export class MfaService {
  /** Generate a base-32 TOTP secret and an otpauth:// URI for QR scanning. */
  generateSecret(email: string) {
    const secret = otplib.generateSecret();
    const otpauthUrl = otplib.generateURI({
      accountName: email,
      label: 'MTN Elite One',
      secret,
    });
    return { secret, otpauthUrl };
  }

  /** Encode the otpauth URI as a data-URL PNG for display in the browser. */
  async generateQrCode(otpauthUrl: string): Promise<string> {
    return qrcode.toDataURL(otpauthUrl);
  }

  /** Verify a 6-digit TOTP code against the stored secret. */
  verifyCode(secret: string, token: string): boolean {
    const result = otplib.verifySync({ secret, token });
    if (!result) return false;
    return (result as { valid: boolean }).valid === true;
  }
}

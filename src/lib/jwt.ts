import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  type?: string;
  iat?: number;
  exp?: number;
}

class JWTService {
  private readonly secret: string;
  private readonly expiresIn: string = '7d'; // 7 days

  constructor() {
    this.secret = process.env.JWT_SECRET!;
    if (!this.secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
  }

  // Generate JWT token
  generateToken(userId: string, email: string): string {
    const payload = { userId, email };
    const options: jwt.SignOptions = { expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'] };
    return jwt.sign(payload, this.secret, options);
  }

  // Generate JWT reset token with short expiration
  generateResetToken(userId: string, email: string): string {
    const payload = { userId, email, type: 'reset' };
    const options: jwt.SignOptions = { expiresIn: '15m' as jwt.SignOptions['expiresIn'] };
    return jwt.sign(payload, this.secret, options);
  }

  // Verify JWT token
  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.secret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Decode token without verification (for debugging)
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  // Get token expiration time
  getTokenExpiration(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  }
}

export default JWTService;

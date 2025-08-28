export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number;
  feedback: string[];
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength?: number;
}

// Default password requirements
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128
};

/**
 * Validate password against requirements
 */
export function validatePassword(
  password: string, 
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];
  const feedback: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
    feedback.push(`At least ${requirements.minLength} characters`);
  } else {
    score += 1;
  }

  // Check maximum length
  if (requirements.maxLength && password.length > requirements.maxLength) {
    errors.push(`Password cannot exceed ${requirements.maxLength} characters`);
  }

  // Check for lowercase letters
  if (requirements.requireLowercase) {
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
      feedback.push('Include lowercase letter');
    } else {
      score += 1;
    }
  }

  // Check for uppercase letters
  if (requirements.requireUppercase) {
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
      feedback.push('Include uppercase letter');
    } else {
      score += 1;
    }
  }

  // Check for numbers
  if (requirements.requireNumbers) {
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
      feedback.push('Include number');
    } else {
      score += 1;
    }
  }

  // Check for special characters
  if (requirements.requireSpecialChars) {
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      errors.push('Password must contain at least one special character');
      feedback.push('Include special character');
    } else {
      score += 1;
    }
  }

  // Check for common weak passwords
  const weakPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
    feedback.push('Choose a more unique password');
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain repeated characters (e.g., aaa, 111)');
    feedback.push('Avoid repeated characters');
  }

  // Check for keyboard sequences
  const keyboardSequences = ['qwerty', 'asdfgh', 'zxcvbn', '123456'];
  const passwordLower = password.toLowerCase();
  for (const sequence of keyboardSequences) {
    if (passwordLower.includes(sequence)) {
      errors.push('Password cannot contain keyboard sequences');
      feedback.push('Avoid keyboard sequences');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
    feedback
  };
}

/**
 * Get password strength level
 */
export function getPasswordStrength(score: number): 'weak' | 'medium' | 'strong' | 'very-strong' {
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  if (score <= 4) return 'strong';
  return 'very-strong';
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong' | 'very-strong'): string {
  switch (strength) {
    case 'weak': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'strong': return 'text-blue-500';
    case 'very-strong': return 'text-green-500';
    default: return 'text-gray-500';
  }
}

/**
 * Get password strength background color
 */
export function getPasswordStrengthBgColor(strength: 'weak' | 'medium' | 'strong' | 'very-strong'): string {
  switch (strength) {
    case 'weak': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'strong': return 'bg-blue-500';
    case 'very-strong': return 'bg-green-500';
    default: return 'bg-gray-300';
  }
}

/**
 * Check if password meets minimum requirements for login
 */
export function isPasswordValidForLogin(password: string): boolean {
  // For login, we only check if password exists and has minimum length
  return Boolean(password && password.length >= 1);
}

/**
 * Check if password meets requirements for registration/reset
 */
export function isPasswordValidForRegistration(password: string): boolean {
  const result = validatePassword(password);
  return result.isValid;
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required category
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special char
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

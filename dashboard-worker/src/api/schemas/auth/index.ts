/**
 * Authentication Schemas
 * Login, registration, and authentication-related validation schemas
 */

import { z } from 'zod';

/**
 * Login request schema
 */
export const LoginRequestSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username too long'),
  password: z.string().min(1, 'Password is required').max(100, 'Password too long'),
  rememberMe: z.boolean().optional().default(false),
  deviceId: z.string().optional(),
  ipAddress: z.string().optional(),
});

/**
 * Login response schema
 */
export const LoginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    user: z.object({
      id: z.string(),
      username: z.string(),
      role: z.string(),
      permissions: z.array(z.string()),
    }),
  }),
  timestamp: z.string().datetime(),
});

/**
 * Refresh token request schema
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Refresh token response schema
 */
export const RefreshTokenResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
  }),
  timestamp: z.string().datetime(),
});

/**
 * Logout request schema
 */
export const LogoutRequestSchema = z.object({
  token: z.string().optional(),
  allDevices: z.boolean().optional().default(false),
});

/**
 * Change password request schema
 */
export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Reset password request schema
 */
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  token: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
});

/**
 * Verify email request schema
 */
export const VerifyEmailRequestSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

/**
 * Two-factor authentication setup schema
 */
export const TwoFactorSetupRequestSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

/**
 * Two-factor authentication setup response
 */
export const TwoFactorSetupResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    secret: z.string(),
    qrCode: z.string(),
    backupCodes: z.array(z.string()),
  }),
});

/**
 * Two-factor authentication verify schema
 */
export const TwoFactorVerifyRequestSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only digits'),
});

/**
 * Session information schema
 */
export const SessionInfoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userAgent: z.string(),
  ipAddress: z.string(),
  createdAt: z.string().datetime(),
  lastActivity: z.string().datetime(),
  expiresAt: z.string().datetime(),
  isActive: z.boolean(),
});

/**
 * User profile update schema
 */
export const UserProfileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/)
    .optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  avatar: z.string().url().optional(),
});

/**
 * User preferences schema
 */
export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  notifications: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    })
    .default({}),
  dashboard: z
    .object({
      defaultView: z.string().default('overview'),
      itemsPerPage: z.number().min(10).max(100).default(25),
      autoRefresh: z.boolean().default(true),
      refreshInterval: z.number().min(30).max(300).default(60),
    })
    .default({}),
});

/**
 * Password strength validation schema
 */
export const PasswordStrengthSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    ),
});

/**
 * Security question schema
 */
export const SecurityQuestionSchema = z.object({
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters')
    .max(200, 'Question too long'),
  answer: z.string().min(1, 'Answer is required').max(100, 'Answer too long'),
});

/**
 * Account lockout schema
 */
export const AccountLockoutSchema = z.object({
  isLocked: z.boolean(),
  lockoutReason: z.string().optional(),
  lockoutUntil: z.string().datetime().optional(),
  failedAttempts: z.number().min(0),
  lastFailedAttempt: z.string().datetime().optional(),
});

// Export types for TypeScript
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;
export type TwoFactorSetupRequest = z.infer<typeof TwoFactorSetupRequestSchema>;
export type TwoFactorSetupResponse = z.infer<typeof TwoFactorSetupResponseSchema>;
export type TwoFactorVerifyRequest = z.infer<typeof TwoFactorVerifyRequestSchema>;
export type SessionInfo = z.infer<typeof SessionInfoSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type PasswordStrength = z.infer<typeof PasswordStrengthSchema>;
export type SecurityQuestion = z.infer<typeof SecurityQuestionSchema>;
export type AccountLockout = z.infer<typeof AccountLockoutSchema>;

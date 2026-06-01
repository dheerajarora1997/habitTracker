import { describe, it, expect, vi } from 'vitest';
import { generateToken, getVerifiedTokenData, JWTPayload } from './auth';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

describe('Auth Utilities', () => {
  const mockPayload: JWTPayload = {
    userId: '60c72b2f9b1d8b2e1c8d4f1a',
    phoneNumber: '+19998887766',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token string', () => {
      const token = generateToken(mockPayload);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWTs have 3 parts: header.payload.signature
    });

    it('should correctly encode the user payload', () => {
      const token = generateToken(mockPayload);
      const decoded = jwt.decode(token) as JWTPayload;
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.phoneNumber).toBe(mockPayload.phoneNumber);
    });
  });

  describe('getVerifiedTokenData', () => {
    it('should parse bearer authorization headers and return decoded payload', () => {
      const token = generateToken(mockPayload);
      
      // Mock NextRequest with headers
      const mockRequest = {
        cookies: {
          get: () => undefined,
        },
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
        }),
        url: 'http://localhost/api/v1/records',
      } as unknown as NextRequest;

      const result = getVerifiedTokenData(mockRequest);
      expect(result).not.toBeNull();
      expect(result?.userId).toBe(mockPayload.userId);
      expect(result?.phoneNumber).toBe(mockPayload.phoneNumber);
    });

    it('should return null if no token or bearer header is present', () => {
      const mockRequest = {
        cookies: {
          get: () => undefined,
        },
        headers: new Headers(),
        url: 'http://localhost/api/v1/records',
      } as unknown as NextRequest;

      const result = getVerifiedTokenData(mockRequest);
      expect(result).toBeNull();
    });

    it('should return null if token signature is invalid', () => {
      const badToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.signature';
      
      const mockRequest = {
        cookies: {
          get: () => undefined,
        },
        headers: new Headers({
          'Authorization': `Bearer ${badToken}`,
        }),
        url: 'http://localhost/api/v1/records',
      } as unknown as NextRequest;

      // Spy on console.error to avoid test output polluting
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = getVerifiedTokenData(mockRequest);
      expect(result).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });
});

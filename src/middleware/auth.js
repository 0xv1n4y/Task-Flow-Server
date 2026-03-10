import { requireAuth } from '@clerk/express';

// Verify Clerk JWT and attach userId to req
export const protect = requireAuth();

// Extract userId helper used in controllers
export function getUserId(req) {
  return req.auth?.userId;
}

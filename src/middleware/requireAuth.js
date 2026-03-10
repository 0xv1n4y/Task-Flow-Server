import { getAuth } from "@clerk/express";

/**
 * Middleware that verifies the Clerk JWT from the Authorization header.
 * Attaches req.userId (Clerk user ID) for downstream use.
 * Returns 401 if the request is unauthenticated.
 */
export function requireAuth(req, res, next) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "A valid Clerk session token is required.",
    });
  }

  req.userId = userId;
  next();
}

import { AuthService } from "../services/AuthService.js";

const authService = new AuthService();

// Authentication Middleware
export const authenticate = (req, res, next) => {
  try {
    // Prefer the HttpOnly cookie; fall back to Authorization header for API clients (e.g. Postman)
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};

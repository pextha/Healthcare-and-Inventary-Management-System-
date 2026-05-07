import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";

export class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  // Register a new user
  async register(registerData) {
    const {
      fullName,
      email,
      contactNumber,
      address,
      dateOfBirth,
      password,
      role,
    } = registerData;

    // Validate required fields
    if (!fullName || !email || !password) {
      const err = new Error("Full name, email, and password are required");
      err.statusCode = 400;
      throw err;
    }

    if (!contactNumber) {
      const err = new Error("Contact number is required");
      err.statusCode = 400;
      throw err;
    }

    if (!address) {
      const err = new Error("Address is required");
      err.statusCode = 400;
      throw err;
    }

    if (!dateOfBirth) {
      const err = new Error("Date of birth is required");
      err.statusCode = 400;
      throw err;
    }

    // Validate date of birth format and ensure it's in the past
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      const err = new Error("Invalid date of birth format");
      err.statusCode = 400;
      throw err;
    }
    if (dob >= new Date()) {
      const err = new Error("Date of birth must be in the past");
      err.statusCode = 400;
      throw err;
    }

    const minAgeDate = new Date();
    minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
    if (dob > minAgeDate) {
      const err = new Error("You must be at least 18 years old to register");
      err.statusCode = 400;
      throw err;
    }

    // Validate fullName — letters, spaces, hyphens, and apostrophes only
    const fullNameRegex = /^[a-zA-Z\s''\-]+$/;
    if (!fullNameRegex.test(fullName.trim())) {
      const err = new Error("Full name must contain letters only (no numbers or special characters)");
      err.statusCode = 400;
      throw err;
    }

    // Validate contact number format
    const contactRegex = /^0\d{9}$/;
    if (!contactRegex.test(contactNumber)) {
      const err = new Error(
        "Invalid contact number format. Must be 10 digits starting with 0",
      );
      err.statusCode = 400;
      throw err;
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      const err = new Error("User with this email already exists");
      err.statusCode = 409;
      throw err;
    }

    // Validate password strength
    if (password.length < 6) {
      const err = new Error("Password must be at least 6 characters long");
      err.statusCode = 400;
      throw err;
    }

    const normalizedRole = (role || "MOTHER").toUpperCase();

    if (normalizedRole === "ADMIN") {
      const err = new Error(
        "Admin accounts cannot be created via registration",
      );
      err.statusCode = 403;
      throw err;
    }

    const isActive = !["DOCTOR", "MIDWIFE"].includes(normalizedRole);

    // Create new user
    const user = await this.userRepository.create({
      fullName,
      email,
      contactNumber,
      address,
      dateOfBirth: dob,
      password,
      role: normalizedRole,
      isActive,
    });

    // Return user without password
    return this.sanitizeUser(user);
  }

  // Login user with email and password

  async login(email, password) {
    // Validate inputs
    if (!email || !password) {
      const err = new Error("Email and password are required");
      err.statusCode = 400;
      throw err;
    }

    // Find user with password field selected
    const user = await this.userRepository.findByIdWithPassword(
      (await this.userRepository.findByEmail(email))?._id,
    );

    if (!user) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }

    // Check if user is active
    if (user.isDeleted) {
      const err = new Error("User account is Deleted");
      err.statusCode = 403;
      throw err;
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      const err = new Error("Invalid or expired token");
      err.statusCode = 401;
      throw err;
    }
  }

  // Generate JWT token
  generateToken(user) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });
  }

  // Request a password reset – sends a reset token via email
  async forgotPassword(email) {
    if (!email) {
      const err = new Error("Email is required");
      err.statusCode = 400;
      throw err;
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const err = new Error("No account found with that email");
      err.statusCode = 404;
      throw err;
    }

    if (user.isDeleted) {
      const err = new Error("User account is deleted");
      err.statusCode = 403;
      throw err;
    }

    // Generate a random 6-digit token and hash it for storage
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save hashed token and 15-minute expiry to the user record
    await this.userRepository.update(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    // Send plain-text token to the user's email via Resend
    await sendPasswordResetEmail(email, resetToken);

    return { message: "Password reset token sent to email" };
  }

  // Reset the password using the token received via email
  async resetPassword(email, token, newPassword) {
    if (!email || !token || !newPassword) {
      const err = new Error("Email, token, and new password are required");
      err.statusCode = 400;
      throw err;
    }

    if (newPassword.length < 6) {
      const err = new Error("Password must be at least 6 characters long");
      err.statusCode = 400;
      throw err;
    }

    // Hash the incoming token to compare with the stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await this.userRepository.findByResetToken(hashedToken);

    if (!user) {
      const err = new Error("Invalid or expired reset token");
      err.statusCode = 400;
      throw err;
    }

    // Verify the token belongs to the correct email
    if (user.email !== email.toLowerCase()) {
      const err = new Error("Invalid or expired reset token");
      err.statusCode = 400;
      throw err;
    }

    // Update password and clear reset token fields
    await this.userRepository.updatePassword(user._id, newPassword);
    await this.userRepository.update(user._id, {
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: "Password has been reset successfully" };
  }

  // Remove password from user object
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    return userObj;
  }
}

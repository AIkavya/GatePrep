import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  findUserByUsername,
  findUserById,
  insertUser,
  generateUserId,
} from "./db.js";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error(
          "CRITICAL SECURITY ERROR: JWT_SECRET environment variable must be set in production!",
        );
      })()
    : "gate-prep-super-secret-jwt-key-2026");

// Default token lifespan for production security: 7 days
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
  isGuest?: boolean;
}

export interface TokenPayload {
  userId: string;
  username: string;
  isGuest?: boolean;
}

export function generateToken(
  user: { id: string; username: string; isGuest?: boolean },
  expiresIn: string = TOKEN_EXPIRES_IN,
): string {
  return jwt.sign(
    { userId: user.id, username: user.username, isGuest: !!user.isGuest },
    JWT_SECRET,
    { expiresIn: expiresIn as any },
  );
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required." };
  }
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long." };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain both letters and numbers." };
  }
  return { valid: true };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid token format" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized: Missing token" });
    return;
  }

  // Gracefully handle legacy guest tokens during session transition
  if (token === "guest_token_permanent" || token.startsWith("guest_token_")) {
    req.userId = "guest_aspirant";
    req.username = "Guest Aspirant";
    req.isGuest = true;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.isGuest = decoded.isGuest;
    next();
  } catch (err: any) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired token. Please log in again." });
  }
}

export async function handleRegister(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { username, password } = req.body || {};

    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length < 3
    ) {
      res
        .status(400)
        .json({ error: "Username must be at least 3 characters long." });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.message });
      return;
    }

    // Standardize clean username lowercased to avoid duplicate account collision attacks
    const cleanUsername = username.trim().toLowerCase();

    // Check if user already exists
    const existing = await findUserByUsername(cleanUsername);
    if (existing) {
      res.status(409).json({
        error: "Username is already taken. Please choose another or log in.",
      });
      return;
    }

    // Hash password securely with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate unique user ID
    const userId = generateUserId(cleanUsername);

    // Create user record in database
    const newUser = await insertUser(userId, cleanUsername, passwordHash);

    // Generate secure 7-day JWT token
    const token = generateToken({ id: newUser.id, username: newUser.username });

    res.status(201).json({
      message: "Account registered successfully.",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    });
  } catch (error: any) {
    console.error("Error in handleRegister:", error);
    res
      .status(500)
      .json({ error: "Internal server error during registration." });
  }
}

export async function handleLogin(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body || {};

    if (
      !username ||
      typeof username !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      res
        .status(400)
        .json({ error: "Please enter both username and password." });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      res
        .status(400)
        .json({ error: "Please enter both username and password." });
      return;
    }

    const user = await findUserByUsername(cleanUsername);

    if (!user) {
      res.status(401).json({ error: "Invalid username or password." });
      return;
    }

    let isMatch = false;
    if (user.password_hash) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }
    if (!isMatch) {
      res.status(401).json({ error: "Invalid username or password." });
      return;
    }

    // Generate secure 7-day token
    const token = generateToken({ id: user.id, username: user.username });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error: any) {
    console.error("Error in handleLogin:", error);
    res.status(500).json({ error: "Internal server error during login." });
  }
}

export async function handleGuestToken(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const guestUser = {
      id: "guest_aspirant",
      username: "Guest Aspirant",
      isGuest: true,
    };
    const token = generateToken(guestUser, "24h");
    res.status(200).json({
      message: "Guest session initialized.",
      token,
      user: guestUser,
    });
  } catch (error: any) {
    console.error("Error generating guest token:", error);
    res.status(500).json({ error: "Failed to initialize guest session." });
  }
}

export async function handleLogout(
  _req: Request,
  res: Response,
): Promise<void> {
  res.status(200).json({ message: "Logged out successfully." });
}

export async function handleMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (req.userId === "guest_aspirant") {
      res.status(200).json({
        user: {
          id: "guest_aspirant",
          username: "Guest Aspirant",
        },
      });
      return;
    }

    const user = await findUserById(req.userId);
    if (!user) {
      res
        .status(401)
        .json({
          error: "User session expired or user not found. Please log in again.",
        });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error: any) {
    console.error("Error in handleMe:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

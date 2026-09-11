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
  process.env.JWT_SECRET || "gate-prep-super-secret-jwt-key-2026";

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

export function generateToken(user: { id: string; username: string }): string {
  return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "36500d",
  });
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized: Missing token" });
    return;
  }

  // Handle guest token gracefully
  if (token === "guest_token_permanent" || token.startsWith("guest_token_")) {
    req.userId = "guest_aspirant";
    req.username = "Guest Aspirant";
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      username: string;
    };
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
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

    if (!password || typeof password !== "string" || password.length < 4) {
      res
        .status(400)
        .json({ error: "Password must be at least 4 characters long." });
      return;
    }

    // The username is stored strictly as entered by the user (trimmed of outer whitespace),
    // without any manipulation, artificial suffixes, timestamps (such as user_time or Date.now()), or casing mutations.
    const cleanUsername = username.trim();

    // Check if user already exists
    const existing = await findUserByUsername(cleanUsername);
    if (existing) {
      res
        .status(409)
        .json({
          error: "Username is already taken. Please choose another or log in.",
        });
      return;
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate unique user ID based on username + cryptographic entropy
    const userId = generateUserId(cleanUsername);

    // Create user and initial fresh empty database record
    const newUser = await insertUser(userId, cleanUsername, passwordHash);

    // Generate permanent JWT token
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

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      res
        .status(400)
        .json({ error: "Please enter both username and password." });
      return;
    }

    const user = await findUserByUsername(cleanUsername);

    if (!user) {
      // Do NOT auto-register on failed login. Return 401 Unauthorized.
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

    // Generate token directly without redundant re-hashing or DB re-write
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

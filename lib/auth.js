import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import User from './models/User';
import { signSessionToken, verifySessionToken } from './jwt';

const DEV_DATA_FILE = path.join(process.cwd(), 'lib', 'devUsers.json');

function readDevUsers() {
  try {
    if (fs.existsSync(DEV_DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DEV_DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading dev users:', e);
  }
  return [];
}

function writeDevUsers(users) {
  try {
    fs.writeFileSync(DEV_DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing dev users:', e);
  }
}

/**
 * Hash password with bcrypt (Cost Factor 10)
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password with support for bcrypt and legacy scrypt hashes
 */
export async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  // Modern bcrypt hash
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return bcrypt.compare(password, storedHash);
  }

  // Legacy scrypt hash fallback for smooth dev migration
  if (storedHash.includes(':')) {
    try {
      const [salt, key] = storedHash.split(':');
      const keyBuffer = Buffer.from(key, 'hex');
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch (e) {
      return false;
    }
  }

  return false;
}

/**
 * Register user (Customer only — prevents privilege escalation)
 */
export async function registerUser({ name, email, phone, password }) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanPhone = phone.trim();
  const passwordHash = await hashPassword(password);

  if (process.env.MONGODB_URI) {
    await connectDB();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) throw new Error('An account with this email already exists.');

    const user = await User.create({
      name,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: 'customer', // Enforce customer role on registration
    });

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }

  // Fallback for dev mode before MongoDB Atlas connection string is provided
  const users = readDevUsers();
  if (users.find((u) => u.email === cleanEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    _id: 'user_' + Date.now(),
    name,
    email: cleanEmail,
    phone: cleanPhone,
    passwordHash,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeDevUsers(users);

  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
  };
}

/**
 * Authenticate user (Customer or Admin)
 */
export async function authenticateUser({ email, password }) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanPassword = (password || '').trim();

  // Admin credentials check (Configurable via environment variables)
  // Admin login requires both ADMIN_EMAIL and ADMIN_PASSWORD; if either is missing it is disabled.
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const adminConfigured = Boolean(adminEmail && adminPassword);

  if (adminConfigured && cleanEmail === adminEmail && cleanPassword === adminPassword) {
    return {
      _id: 'admin_1',
      name: 'Store Owner (Admin)',
      email: adminEmail,
      phone: '+91 9876543210',
      role: 'admin',
    };
  }

  if (process.env.MONGODB_URI) {
    await connectDB();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) throw new Error('Invalid email or password.');

    // Check account lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitMin = Math.ceil((user.lockUntil - Date.now()) / 60000);
      throw new Error(`Account temporarily locked due to failed attempts. Try again in ${waitMin} minutes.`);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lockout
      }
      await user.save();
      throw new Error('Invalid email or password.');
    }

    // Reset lockout counters on success
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    // Seamlessly upgrade legacy hash to bcrypt if needed
    if (!user.passwordHash.startsWith('$2a$') && !user.passwordHash.startsWith('$2b$')) {
      user.passwordHash = await hashPassword(password);
      await user.save();
    }

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }

  const users = readDevUsers();
  const user = users.find((u) => u.email === cleanEmail);
  if (!user) throw new Error('Invalid email or password.');

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) throw new Error('Invalid email or password.');

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

/**
 * Generate a Cryptographically Secure Password Reset Token (15-minute expiry)
 */
export async function createPasswordResetToken(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  if (process.env.MONGODB_URI) {
    await connectDB();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Return null so callers can maintain constant-time response and avoid email enumeration
      return null;
    }

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    return { rawToken, email: cleanEmail, expiresAt };
  }

  const users = readDevUsers();
  const user = users.find((u) => u.email === cleanEmail);
  if (!user) return null;

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpires = expiresAt.toISOString();
  writeDevUsers(users);

  return { rawToken, email: cleanEmail, expiresAt };
}

/**
 * Reset User Password using Verified Token
 */
export async function resetPasswordWithToken({ token, newPassword }) {
  if (!token || typeof token !== 'string' || token.length < 16) {
    throw new Error('Invalid password reset token.');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const newHash = await hashPassword(newPassword);

  if (process.env.MONGODB_URI) {
    await connectDB();
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired password reset link. Please request a new one.');
    }

    user.passwordHash = newHash;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return { success: true, email: user.email };
  }

  const users = readDevUsers();
  const now = Date.now();
  const user = users.find(
    (u) =>
      u.resetPasswordTokenHash === tokenHash &&
      u.resetPasswordExpires &&
      new Date(u.resetPasswordExpires).getTime() > now
  );

  if (!user) {
    throw new Error('Invalid or expired password reset link. Please request a new one.');
  }

  user.passwordHash = newHash;
  delete user.resetPasswordTokenHash;
  delete user.resetPasswordExpires;
  writeDevUsers(users);

  return { success: true, email: user.email };
}

/**
 * Extract and Verify Authenticated User from Request Cookies
 */
export function getAuthenticatedUser(req) {
  let token = null;

  // Check from NextRequest / headers
  if (req?.cookies?.get) {
    token = req.cookies.get('si_session')?.value;
  } else if (req?.headers?.get) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/si_session=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Server-Side Admin Authorization Guard
 * Use in Admin API endpoints to block unauthorized access
 */
export function requireAdmin(req) {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    throw new Error('UNAUTHORIZED_ADMIN_ACCESS');
  }
  return user;
}

/**
 * Fetch all registered customers for Admin
 */
export async function getAllCustomers() {
  if (process.env.MONGODB_URI) {
    await connectDB();
    const users = await User.find({ role: 'customer' })
      .select('-passwordHash -resetPasswordTokenHash -resetPasswordExpires')
      .lean();
    return JSON.parse(JSON.stringify(users));
  }
  const users = readDevUsers();
  return users.map(({ passwordHash, resetPasswordTokenHash, resetPasswordExpires, ...rest }) => rest);
}

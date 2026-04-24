import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function signup(email, password) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw {
      status: 409,
      message: 'Email already exists',
    };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'customer',
    },
  });

  // Generate token
  const token = generateToken(user.id, user.role);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token,
  };
}

export async function login(email, password) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw {
      status: 401,
      message: 'Invalid email or password',
    };
  }

  // Compare passwords
  const isPasswordValid = await comparePasswords(password, user.password);

  if (!isPasswordValid) {
    throw {
      status: 401,
      message: 'Invalid email or password',
    };
  }

  // Generate token
  const token = generateToken(user.id, user.role);

  return {
    token,
  };
}

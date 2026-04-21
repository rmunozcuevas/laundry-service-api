import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../repositories/userRepo.js';

export async function signUp({ email, password, name, address, phone, role }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await createUser({
    email,
    password: hashedPassword,
    name,
    address,
    phone,
    role,
  });
  return newUser;
}

export async function logIn(email, password) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

  if (!JWT_SECRET) {
    const err = new Error('Server misconfigured: JWT_SECRET is missing');
    err.status = 500;
    throw err;
  }
  if (!JWT_EXPIRES_IN) {
    const err = new Error('Server misconfigured: JWT_EXPIRES_IN is missing');
    err.status = 500;
    throw err;
  }

  const error = new Error('Invalid credentials');
  error.status = 401;

  const user = await findUserByEmail(email);
  if (!user) throw error;

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw error;

  const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return accessToken;
}

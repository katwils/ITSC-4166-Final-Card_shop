import { signup, login } from '../services/authService.js';

export async function signupHandler(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await signup(email, password);
    res.status(201).json({
      id: result.id,
      email: result.email,
      role: result.role,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await login(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

import { signUp, logIn } from '../services/authService.js';

export async function signUpHandler(req, res, next) {
  try {
    const { email, password, name, address, phone, role } = req.body;
    const user = await signUp({ email, password, name, address, phone, role });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function logInHandler(req, res, next) {
  try {
    const { email, password } = req.body;
    const accessToken = await logIn(email, password);
    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
}

import express from 'express';
import { AuthControllers } from './auth.controller';
// import { loginHandler } from '../../../app';

const router = express.Router();

router.post(
  "/login",
  AuthControllers.loginUser);

router.post("/logout", AuthControllers.logout);

export const AuthRoutes = router;
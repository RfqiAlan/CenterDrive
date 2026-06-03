import { Router, Request } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { requireAuth } from '../utils/auth';

const router = Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value || '';
      
      let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0].value
          }
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
));

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req: Request, res) => {
  const user = (req as any).user;
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.redirect(process.env.FRONTEND_URL || 'http://localhost:4000');
});

router.post('/logout', requireAuth, (req: Request, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/me', requireAuth, async (req: Request, res) => {
  try {
    const userId = (req as any).user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, googleId: true, email: true, name: true, avatar: true }
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;

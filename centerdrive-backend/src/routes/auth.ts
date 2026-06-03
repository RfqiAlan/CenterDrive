import { Router, Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { requireAuth } from '../utils/auth';

const router = Router();

router.post('/register', async (req: Request, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validasi
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    // Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      }
    });

    // Buat token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    // Jangan kirim password ke frontend
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mendaftar' });
  }
});

router.post('/login', async (req: Request, res) => {
  try {
    const { email, password } = req.body;

    // Cek user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Cek password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Buat token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Gagal login' });
  }
});

// Logout tidak terlalu butuh karena frontend hanya akan menghapus token dari localStorage
router.post('/logout', (req: Request, res) => {
  res.json({ success: true });
});

router.get('/me', requireAuth, async (req: Request, res) => {
  try {
    const userId = (req as any).user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;

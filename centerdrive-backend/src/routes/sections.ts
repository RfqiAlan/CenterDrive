import { Router } from 'express';
import prisma from '../utils/prisma';
import { requireAuth, AuthRequest } from '../utils/auth';

const router = Router();

// Apply auth middleware to all section routes
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const sections = await prisma.section.findMany({
      where: { userId: req.user?.id },
      orderBy: { order: 'asc' }
    });
    res.json({ sections });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { label, driveUrl, folderId } = req.body;
    
    // Get highest order
    const maxOrderSection = await prisma.section.findFirst({
      where: { userId: req.user?.id },
      orderBy: { order: 'desc' }
    });
    const newOrder = maxOrderSection ? maxOrderSection.order + 1 : 0;

    const newSection = await prisma.section.create({
      data: {
        userId: req.user!.id,
        label,
        driveUrl,
        folderId,
        order: newOrder
      }
    });

    res.json(newSection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create section' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { label, driveUrl } = req.body;

    const section = await prisma.section.updateMany({
      where: { id, userId: req.user?.id },
      data: { label, driveUrl }
    });

    if (section.count === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update section' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const section = await prisma.section.deleteMany({
      where: { id, userId: req.user?.id }
    });

    if (section.count === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

export default router;

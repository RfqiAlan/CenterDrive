import { Router, Request } from 'express';
import prisma from '../utils/prisma';
import { requireAuth } from '../utils/auth';

const router = Router();

// Apply auth middleware to all section routes
router.use(requireAuth);

router.get('/', async (req: Request, res) => {
  try {
    const userId = (req as any).user?.id;
    const sections = await prisma.section.findMany({
      where: { userId },
      orderBy: { order: 'asc' }
    });
    res.json({ sections });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

router.post('/', async (req: Request, res) => {
  try {
    const { label, driveUrl, folderId } = req.body;
    const userId = (req as any).user?.id;
    
    // Get highest order
    const maxOrderSection = await prisma.section.findFirst({
      where: { userId },
      orderBy: { order: 'desc' }
    });
    const newOrder = maxOrderSection ? maxOrderSection.order + 1 : 0;

    const newSection = await prisma.section.create({
      data: {
        userId,
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

router.put('/:id', async (req: Request, res) => {
  try {
    const id = req.params.id as string;
    const { label, driveUrl } = req.body;
    const userId = (req as any).user?.id;

    const section = await prisma.section.updateMany({
      where: { id, userId },
      data: { label, driveUrl }
    });

    if (section.count === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update section' });
  }
});

router.delete('/:id', async (req: Request, res) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user?.id;

    const section = await prisma.section.deleteMany({
      where: { id, userId }
    });

    if (section.count === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

export default router;

import { Router, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { type AuthRequest, authMiddleware } from '../auth.js';

const router: IRouter = Router();

router.use(authMiddleware);

// GET /api/ad-slots - List ad slots (publishers see only their own; sponsors see all for marketplace)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, available } = req.query;
    const publisherId = req.user?.publisherId;

    const adSlots = await prisma.adSlot.findMany({
      where: {
        ...(publisherId && { publisherId }),
        ...(type && {
          type: type as string as 'DISPLAY' | 'VIDEO' | 'NATIVE' | 'NEWSLETTER' | 'PODCAST',
        }),
        ...(available === 'true' && { isAvailable: true }),
      },
      include: {
        publisher: { select: { id: true, name: true, category: true, monthlyViews: true } },
        _count: { select: { placements: true } },
      },
      orderBy: { basePrice: 'desc' },
    });

    res.json(adSlots);
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// GET /api/ad-slots/:id - Get single ad slot (publishers: verify ownership; sponsors: allow for marketplace)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: {
        publisher: true,
        placements: {
          include: {
            campaign: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    if (req.user?.publisherId && adSlot.publisherId !== req.user.publisherId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(adSlot);
  } catch (error) {
    console.error('Error fetching ad slot:', error);
    res.status(500).json({ error: 'Failed to fetch ad slot' });
  }
});

// POST /api/ad-slots - Create ad slot (must be for user's publisher)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const publisherId = req.user?.publisherId;
    if (!publisherId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { name, description, type, position, width, height, basePrice, cpmFloor } = req.body;

    if (!name || !type || !basePrice) {
      res.status(400).json({
        error: 'Name, type, and basePrice are required',
      });
      return;
    }

    const adSlot = await prisma.adSlot.create({
      data: {
        name,
        description,
        type,
        position,
        width,
        height,
        basePrice,
        cpmFloor,
        publisherId,
      },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(adSlot);
  } catch (error) {
    console.error('Error creating ad slot:', error);
    res.status(500).json({ error: 'Failed to create ad slot' });
  }
});

// POST /api/ad-slots/:id/book - Book an ad slot (simplified booking flow)
router.post('/:id/book', async (req: AuthRequest, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const { sponsorId, message } = req.body;

    if (!sponsorId) {
      res.status(400).json({ error: 'sponsorId is required' });
      return;
    }

    // Check if slot exists and is available
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: { publisher: true },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    if (!adSlot.isAvailable) {
      res.status(400).json({ error: 'Ad slot is no longer available' });
      return;
    }

    // Mark slot as unavailable
    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: false },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    // In a real app, you'd create a Placement record here
    // For now, we just mark it as booked
    console.log(`Ad slot ${id} booked by sponsor ${sponsorId}. Message: ${message || 'None'}`);

    res.json({
      success: true,
      message: 'Ad slot booked successfully!',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error booking ad slot:', error);
    res.status(500).json({ error: 'Failed to book ad slot' });
  }
});

// POST /api/ad-slots/:id/unbook - Reset ad slot to available (publisher owner only)
router.post('/:id/unbook', async (req: AuthRequest, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const adSlot = await prisma.adSlot.findUnique({ where: { id } });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    if (adSlot.publisherId !== req.user?.publisherId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: true },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      message: 'Ad slot is now available again',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error unbooking ad slot:', error);
    res.status(500).json({ error: 'Failed to unbook ad slot' });
  }
});

// PUT /api/ad-slots/:id - Update ad slot (publisher owner only)
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const publisherId = req.user?.publisherId;
    if (!publisherId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const id = getParam(req.params.id);
    const existing = await prisma.adSlot.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    if (existing.publisherId !== publisherId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { name, description, type, position, width, height, basePrice, cpmFloor, isAvailable } =
      req.body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (type !== undefined) data.type = type;
    if (position !== undefined) data.position = position;
    if (width !== undefined) data.width = width;
    if (height !== undefined) data.height = height;
    if (basePrice !== undefined) data.basePrice = basePrice;
    if (cpmFloor !== undefined) data.cpmFloor = cpmFloor;
    if (isAvailable !== undefined) data.isAvailable = isAvailable;

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const adSlot = await prisma.adSlot.update({
      where: { id },
      data,
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json(adSlot);
  } catch (error) {
    console.error('Error updating ad slot:', error);
    res.status(500).json({ error: 'Failed to update ad slot' });
  }
});

// DELETE /api/ad-slots/:id - Delete ad slot (publisher owner only)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const publisherId = req.user?.publisherId;
    if (!publisherId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const id = getParam(req.params.id);
    const existing = await prisma.adSlot.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    if (existing.publisherId !== publisherId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.adSlot.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ad slot:', error);
    res.status(500).json({ error: 'Failed to delete ad slot' });
  }
});

export default router;

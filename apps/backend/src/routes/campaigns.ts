import { Router, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { type AuthRequest, authMiddleware } from '../auth.js';

const router: IRouter = Router();

router.use(authMiddleware);

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// GET /api/campaigns - List campaigns (sponsors see only their own). Supports ?page=1&limit=10
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const sponsorId = req.user?.sponsorId;
    if (!sponsorId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { status, page: pageStr, limit: limitStr } = req.query;
    const where = {
      sponsorId,
      ...(status && { status: status as string as 'ACTIVE' | 'PAUSED' | 'COMPLETED' }),
    };

    const usePagination = pageStr != null || limitStr != null;
    const page = usePagination ? Math.max(1, parseInt(String(pageStr), 10) || 1) : 1;
    const limit = usePagination
      ? Math.min(MAX_LIMIT, Math.max(1, parseInt(String(limitStr), 10) || DEFAULT_LIMIT))
      : undefined;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          sponsor: { select: { id: true, name: true, logo: true } },
          _count: { select: { creatives: true, placements: true } },
        },
        orderBy: { createdAt: 'desc' },
        ...(limit != null && { skip: (page - 1) * limit, take: limit }),
      }),
      usePagination ? prisma.campaign.count({ where }) : Promise.resolve(0),
    ]);

    if (usePagination) {
      res.json({ items: campaigns, total, page, limit });
    } else {
      res.json(campaigns);
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// GET /api/campaigns/:id - Get single campaign (verify ownership)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        sponsor: true,
        creatives: true,
        placements: {
          include: {
            adSlot: true,
            publisher: { select: { id: true, name: true, category: true } },
          },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    if (campaign.sponsorId !== req.user?.sponsorId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// POST /api/campaigns - Create campaign (must be for user's sponsor)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const sponsorId = req.user?.sponsorId;
    if (!sponsorId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const {
      name,
      description,
      budget,
      cpmRate,
      cpcRate,
      startDate,
      endDate,
      status,
      targetCategories,
      targetRegions,
    } = req.body;

    if (!name || !budget || !startDate || !endDate) {
      res.status(400).json({
        error: 'Name, budget, startDate, and endDate are required',
      });
      return;
    }

    const validStatuses = [
      'DRAFT',
      'PENDING_REVIEW',
      'APPROVED',
      'ACTIVE',
      'PAUSED',
      'COMPLETED',
      'CANCELLED',
    ] as const;
    const campaignStatus = status && validStatuses.includes(status) ? status : 'DRAFT';

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        budget,
        cpmRate,
        cpcRate,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: campaignStatus,
        targetCategories: targetCategories || [],
        targetRegions: targetRegions || [],
        sponsorId,
      },
      include: {
        sponsor: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// PUT /api/campaigns/:id - Update campaign (verify ownership)
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const sponsorId = req.user?.sponsorId;
    if (!sponsorId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const id = getParam(req.params.id);
    const existing = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    if (existing.sponsorId !== sponsorId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const {
      name,
      description,
      budget,
      spent,
      cpmRate,
      cpcRate,
      startDate,
      endDate,
      targetCategories,
      targetRegions,
      status,
    } = req.body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (budget !== undefined) data.budget = budget;
    if (spent !== undefined) data.spent = spent;
    if (cpmRate !== undefined) data.cpmRate = cpmRate;
    if (cpcRate !== undefined) data.cpcRate = cpcRate;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = new Date(endDate);
    if (targetCategories !== undefined) data.targetCategories = targetCategories;
    if (targetRegions !== undefined) data.targetRegions = targetRegions;
    if (status !== undefined) data.status = status;

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data,
      include: {
        sponsor: { select: { id: true, name: true } },
      },
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// DELETE /api/campaigns/:id - Delete campaign (verify ownership)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const sponsorId = req.user?.sponsorId;
    if (!sponsorId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const id = getParam(req.params.id);
    const existing = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    if (existing.sponsorId !== sponsorId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.campaign.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router;

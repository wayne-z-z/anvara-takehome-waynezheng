import { type Request, type Response, type NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './better-auth.js';
import { prisma } from './db.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    sponsorId?: string;
    publisherId?: string;
  };
}

/**
 * Middleware that validates the session via Better Auth and attaches
 * user info (id, email, sponsorId, publisherId) to req.user.
 * Returns 401 if no valid session.
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = session.user.id;
    const email = session.user.email ?? '';

    const [sponsor, publisher] = await Promise.all([
      prisma.sponsor.findUnique({ where: { userId }, select: { id: true } }),
      prisma.publisher.findUnique({ where: { userId }, select: { id: true } }),
    ]);

    req.user = {
      id: userId,
      email,
      sponsorId: sponsor?.id,
      publisherId: publisher?.id,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export function roleMiddleware(allowedRoles: Array<'SPONSOR' | 'PUBLISHER'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const hasSponsor = !!req.user?.sponsorId;
    const hasPublisher = !!req.user?.publisherId;
    const role = hasSponsor ? 'SPONSOR' : hasPublisher ? 'PUBLISHER' : null;

    if (!req.user || !role || !allowedRoles.includes(role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

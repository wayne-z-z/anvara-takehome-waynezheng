import { Router, type Request, type Response, type IRouter } from 'express';

const router: IRouter = Router();

// Simple email format validation (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter/subscribe - Dummy endpoint: validate email, return success (no persistence)
router.post('/subscribe', (req: Request, res: Response) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';

  if (!email) {
    res.status(400).json({
      success: false,
      error: 'Email is required',
    });
    return;
  }

  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({
      success: false,
      error: 'Please enter a valid email address',
    });
    return;
  }

  // Dummy: no DB or external service; just validate and respond
  res.status(200).json({
    success: true,
    message: 'Thanks for subscribing!',
  });
});

export default router;

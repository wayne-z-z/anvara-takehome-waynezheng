import { Router, type Request, type Response, type IRouter } from 'express';

const router: IRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/quotes/request - Dummy: validate body, return quoteId (no persistence)
router.post('/request', (req: Request, res: Response) => {
  const { adSlotId, email, companyName } = req.body ?? {};

  const emailStr = typeof email === 'string' ? email.trim() : '';
  const companyStr = typeof companyName === 'string' ? companyName.trim() : '';
  const adSlotIdStr = typeof adSlotId === 'string' ? adSlotId.trim() : '';

  if (!adSlotIdStr) {
    res.status(400).json({ success: false, error: 'Ad slot is required' });
    return;
  }
  if (!emailStr) {
    res.status(400).json({ success: false, error: 'Email is required' });
    return;
  }
  if (!EMAIL_REGEX.test(emailStr)) {
    res.status(400).json({ success: false, error: 'Please enter a valid email address' });
    return;
  }
  if (!companyStr) {
    res.status(400).json({ success: false, error: 'Company name is required' });
    return;
  }

  // Dummy: no DB or email; return a fake quote id
  const quoteId = `qt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  res.status(200).json({ success: true, quoteId });
});

export default router;

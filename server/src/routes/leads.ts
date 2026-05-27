import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { getStates, findStateBySlug, getCitiesByState } from '../data/brazil';

const router = Router();

// List leads by city (public)
router.get('/city/:citySlug', async (req: Request, res: Response) => {
  try {
    const leads = await (prisma as any).barberLead.findMany({
      where: { citySlug: req.params.citySlug as string },
      orderBy: { rating: 'desc' },
      take: 50,
    });
    return res.json(leads.map((l: any) => ({
      id: l.id,
      name: l.name,
      address: l.address,
      rating: l.rating,
      reviewCount: l.reviewCount,
      website: l.website,
      slug: l.slug,
      claimed: l.claimed,
      verified: l.verified,
      neighborhood: l.neighborhood,
      street: l.street,
      city: l.city,
      state: l.state,
    })));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get single lead by slug (public - NO phone exposed)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const lead = await (prisma as any).barberLead.findUnique({
      where: { slug: req.params.slug as string },
    });
    if (!lead) return res.status(404).json({ error: 'Perfil não encontrado' });

    // Find nearby cities in the same state
    let nearbyCities: { nome: string; slug: string }[] = [];
    if (lead.state) {
      const brState = findStateBySlug(lead.state.toLowerCase());
      if (brState) {
        const cities = await getCitiesByState(brState.id);
        nearbyCities = cities
          .filter((c: any) => c.slug !== lead.citySlug)
          .slice(0, 8)
          .map((c: any) => ({ nome: c.nome, slug: c.slug }));
      }
    }

    return res.json({
      id: lead.id,
      name: lead.name,
      address: lead.address,
      rating: lead.rating,
      reviewCount: lead.reviewCount,
      website: lead.website,
      category: lead.category,
      slug: lead.slug,
      claimed: lead.claimed,
      verified: lead.verified,
      neighborhood: lead.neighborhood,
      street: lead.street,
      city: lead.city,
      state: lead.state,
      citySlug: lead.citySlug,
      campaign: lead.campaign,
      source: lead.source,
      createdAt: lead.createdAt,
      nearbyCities,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Claim a lead profile (requires authentication)
router.post('/:slug/claim', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const lead = await (prisma as any).barberLead.findUnique({
      where: { slug: req.params.slug as string },
    });
    if (!lead) return res.status(404).json({ error: 'Perfil não encontrado' });
    if (lead.claimed) return res.status(400).json({ error: 'Este perfil já foi reivindicado' });

    const updated = await (prisma as any).barberLead.update({
      where: { slug: req.params.slug as string },
      data: {
        claimed: true,
        claimedById: user.id,
        claimedAt: new Date(),
      },
    });

    return res.json({
      message: 'Perfil reivindicado com sucesso! Aguarde a verificação.',
      slug: updated.slug,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Submit verification request
router.post('/:slug/verify', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const lead = await (prisma as any).barberLead.findUnique({
      where: { slug: req.params.slug as string },
    });
    if (!lead) return res.status(404).json({ error: 'Perfil não encontrado' });
    if (lead.claimedById && lead.claimedById !== user.id) {
      return res.status(403).json({ error: 'Este perfil foi reivindicado por outro usuário' });
    }

    const { barberShop, specialties, instagram, whatsapp, bio, proofPhoto } = req.body;

    // Store verification data (in a real app, create a VerificationRequest model)
    await (prisma as any).barberLead.update({
      where: { slug: req.params.slug as string },
      data: {
        claimed: true,
        claimedById: user.id,
        claimedAt: lead.claimedAt || new Date(),
      },
    });

    return res.json({
      message: 'Solicitação de verificação enviada! Analisaremos em até 48h.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// List all leads (public, with pagination + search)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { city, claimed, search, page, limit: limitStr, offset: offsetStr } = req.query;
    const where: any = {};
    if (city) where.citySlug = city;
    if (claimed === 'true') where.claimed = true;
    else if (claimed === 'false') where.claimed = false;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const total = await (prisma as any).barberLead.count({ where });

    let skip = 0;
    let take = parseInt(limitStr as string) || 50;
    if (offsetStr) {
      skip = parseInt(offsetStr as string);
    } else if (page) {
      skip = (parseInt(page as string) - 1) * take;
    }

    const leads = await (prisma as any).barberLead.findMany({
      where,
      orderBy: { rating: 'desc' },
      skip,
      take,
      select: {
        name: true,
        slug: true,
        city: true,
        neighborhood: true,
        rating: true,
        reviewCount: true,
        claimed: true,
        verified: true,
      },
    });

    return res.json({ leads, total });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

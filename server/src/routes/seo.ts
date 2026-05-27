import { Router, Request, Response } from 'express';
import path from 'path';
import { prisma } from '../lib/prisma';
import { getStates, findStateBySlug, findCity, getCitiesByState, BrazilCity } from '../data/brazil';

const router = Router();

router.get('/cities', async (req: Request, res: Response) => {
  try {
    const minBarbers = parseInt(req.query.min_barbers as string) || 0;
    const cities = await (prisma as any).city.findMany({
      where: minBarbers > 0 ? { barbers_count: { gte: minBarbers } } : {},
      include: { state: true, neighborhoods: true },
      orderBy: { barbers_count: 'desc' },
    });

    return res.json(cities.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      state: { sigla: c.state.sigla, nome: c.state.nome, slug: c.state.slug },
      barbers_count: c.barbers_count,
      avg_price: c.avg_price,
      top_services: c.top_services,
      seo_enabled: c.seo_enabled,
      neighborhoods_count: c.neighborhoods?.length || 0,
    })));
  } catch (error: any) {
    console.error('[SEO] Erro ao listar cidades:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/city/:stateSlug/:citySlug', async (req: Request, res: Response) => {
  try {
    const stateSlug = req.params.stateSlug as string;
    const citySlug = req.params.citySlug as string;

    const ibgeState = findStateBySlug(stateSlug);
    const ibgeCity = ibgeState ? await findCity(citySlug, ibgeState.id) : null;

    const city = await (prisma as any).city.findFirst({
      where: { slug: citySlug, state: { slug: stateSlug } },
      include: {
        state: true,
        neighborhoods: {
          where: { barbers_count: { gte: 1 } },
          orderBy: { barbers_count: 'desc' },
        },
      },
    });

    const barbers = city ? await (prisma as any).barber.findMany({
      where: { cityId: city.id, isOnline: true },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: [{ rating: 'desc' }, { followersCount: 'desc' }],
      take: 20,
    }) : [];

    const championships = city ? await (prisma as any).championship.findMany({
      where: {
        participants: { some: { cityId: city.id } },
        status: { in: ['OPEN', 'ONGOING'] },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }) : [];

    const highlightedBarbers = barbers.filter((b: any) => b.isPremium || b.rating >= 4.8).slice(0, 6);

    const nearbyCities = ibgeState ? (await getCitiesByState(ibgeState.id))
      .filter((c: BrazilCity) => c.slug !== citySlug)
      .slice(0, 12)
      .map((c: BrazilCity) => ({ nome: c.nome, slug: c.slug })) : [];

    return res.json({
      city: {
        id: city?.id || ibgeCity?.id || 0,
        name: city?.name || ibgeCity?.nome || citySlug,
        slug: citySlug,
        barbers_count: city?.barbers_count || 0,
        avg_price: city?.avg_price || null,
        top_services: city?.top_services || [],
        seo_enabled: true,
      },
      state: {
        sigla: city?.state?.sigla || ibgeState?.sigla || stateSlug,
        nome: city?.state?.nome || ibgeState?.nome || stateSlug,
        slug: stateSlug,
      },
      neighborhoods: city ? city.neighborhoods.map((n: any) => ({
        name: n.name,
        slug: n.slug,
        barbers_count: n.barbers_count,
      })) : [],
      barbers: barbers.map((b: any) => ({
        id: b.id,
        name: b.user.name,
        avatar: b.user.avatar,
        shop: b.barberShop,
        slug: b.slug,
        rating: b.rating,
        reviewsCount: b.reviewsCount,
        specialties: b.specialties,
        isPremium: b.isPremium,
        isOnline: b.isOnline,
      })),
      highlighted: highlightedBarbers.map((b: any) => ({
        id: b.id,
        name: b.user.name,
        avatar: b.user.avatar,
        slug: b.slug,
        rating: b.rating,
        shop: b.barberShop,
      })),
      championships: championships.map((c: any) => ({
        id: c.id,
        name: c.name,
        status: c.status,
      })),
      nearbyCities,
    });
  } catch (error: any) {
    console.error('[SEO] Erro ao buscar cidade:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/states', async (_req: Request, res: Response) => {
  try {
    return res.json(getStates());
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/state/:stateSlug', async (req: Request, res: Response) => {
  try {
    const brState = findStateBySlug(req.params.stateSlug as string);
    if (!brState) return res.status(404).json({ error: 'Estado não encontrado' });
    const cities = await getCitiesByState(brState.id);
    return res.json({ state: brState, cities: cities.map((c: any) => ({ nome: c.nome, slug: c.slug, id: c.id })) });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/nearby/:stateSlug/:citySlug', async (req: Request, res: Response) => {
  try {
    const brState = findStateBySlug(req.params.stateSlug as string);
    if (!brState) return res.json([]);
    const cities = await getCitiesByState(brState.id);
    return res.json(cities.filter((c: any) => c.slug !== (req.params.citySlug as string)).slice(0, 12).map((c: any) => ({ nome: c.nome, slug: c.slug })));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/neighborhoods/:cityId', async (req: Request, res: Response) => {
  try {
    const neighborhoods = await (prisma as any).neighborhood.findMany({
      where: { cityId: parseInt(String(req.params.cityId)), barbers_count: { gte: 1 } },
      orderBy: { barbers_count: 'desc' },
    });
    return res.json(neighborhoods);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/barber/:slug', async (req: Request, res: Response) => {
  try {
    const barber = await (prisma as any).barber.findUnique({
      where: { slug: req.params.slug as string },
      include: {
        user: { select: { name: true, avatar: true, bio: true } },
        city: { include: { state: true } },
        neighborhood: true,
      },
    });

    if (!barber) {
      return res.status(404).json({ error: 'Barbeiro não encontrado' });
    }

    return res.json({
      id: barber.id,
      name: barber.user.name,
      avatar: barber.user.avatar,
      bio: barber.user.bio || barber.bio,
      shop: barber.barberShop,
      slug: barber.slug,
      rating: barber.rating,
      reviewsCount: barber.reviewsCount,
      specialties: barber.specialties,
      isPremium: barber.isPremium,
      isOnline: barber.isOnline,
      city: barber.city ? { name: barber.city.name, slug: barber.city.slug } : null,
      state: barber.city?.state ? { sigla: barber.city.state.sigla, slug: barber.city.state.slug } : null,
      neighborhood: barber.neighborhood ? { name: barber.neighborhood.name, slug: barber.neighborhood.slug } : null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://battlebarber.com.br';
  res.redirect(301, `${baseUrl}/sitemap.xml`);
});

export default router;

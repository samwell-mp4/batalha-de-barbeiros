import { Router, Request, Response } from 'express';
import path from 'path';
import { prisma } from '../lib/prisma';

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
    const { stateSlug, citySlug } = req.params;

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

    if (!city) {
      return res.status(404).json({ error: 'Cidade não encontrada' });
    }

    const barbers = await (prisma as any).barber.findMany({
      where: { cityId: city.id, isOnline: true },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: [{ rating: 'desc' }, { followersCount: 'desc' }],
      take: 20,
    });

    const championships = await (prisma as any).championship.findMany({
      where: {
        participants: { some: { cityId: city.id } },
        status: { in: ['OPEN', 'ONGOING'] },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const highlightedBarbers = barbers.filter((b: any) => b.isPremium || b.rating >= 4.8).slice(0, 6);

    return res.json({
      city: {
        id: city.id,
        name: city.name,
        slug: city.slug,
        barbers_count: city.barbers_count,
        avg_price: city.avg_price,
        top_services: city.top_services,
        seo_enabled: city.seo_enabled,
      },
      state: { sigla: city.state.sigla, nome: city.state.nome, slug: city.state.slug },
      neighborhoods: city.neighborhoods.map((n: any) => ({
        name: n.name,
        slug: n.slug,
        barbers_count: n.barbers_count,
      })),
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
    });
  } catch (error: any) {
    console.error('[SEO] Erro ao buscar cidade:', error);
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
      where: { slug: req.params.slug },
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
  try {
    const baseUrl = process.env.APP_URL || 'https://battlebarber.com.br';

    const cities = await (prisma as any).city.findMany({
      where: { seo_enabled: true },
      include: { state: true, neighborhoods: { where: { barbers_count: { gte: 3 } } } },
      orderBy: { barbers_count: 'desc' },
    });

    const barbers = await (prisma as any).barber.findMany({
      where: { slug: { not: null }, isOnline: true },
      select: { slug: true, updatedAt: true },
      take: 500,
    });

    const today = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Home
    xml += `  <url><loc>${baseUrl}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;

    // City pages
    for (const city of cities) {
      const stateSlug = city.state.slug;
      const citySlug = city.slug;
      const prio = city.barbers_count >= 50 ? '0.9' : city.barbers_count >= 20 ? '0.8' : '0.7';
      xml += `  <url><loc>${baseUrl}/barbearias/${stateSlug}/${citySlug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${prio}</priority></url>\n`;

      // Neighborhood pages (if has enough barbers)
      for (const hood of city.neighborhoods) {
        xml += `  <url><loc>${baseUrl}/barbearias/${stateSlug}/${citySlug}/${hood.slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
      }
    }

    // Service + city pages
    const services = ['corte-degrade', 'barba', 'corte-infantil', 'corte-masculino', 'hot-towel'];
    for (const city of cities.slice(0, 100)) {
      for (const svc of services) {
        xml += `  <url><loc>${baseUrl}/servicos/${svc}/${city.state.slug}/${city.slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;
      }
    }

    // Barber pages
    for (const barber of barbers) {
      const lastmod = barber.updatedAt ? new Date(barber.updatedAt).toISOString().split('T')[0] : today;
      xml += `  <url><loc>${baseUrl}/barbeiro/${barber.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error: any) {
    console.error('[SEO] Erro ao gerar sitemap:', error);
    res.status(500).send('Erro ao gerar sitemap');
  }
});

export default router;

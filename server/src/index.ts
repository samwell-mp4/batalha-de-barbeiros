import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

import { PrismaClient } from '@prisma/client';
import championshipRoutes from './routes/championships';
import barberRoutes from './routes/barbers';
import postRoutes from './routes/posts';
import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointments';
import messageRoutes from './routes/messages';
import paymentRoutes from './routes/payments';
import seoRoutes from './routes/seo';
import cityRoutes from './routes/cities';
import deployRoutes from './routes/deploy';
import { renderCityPage } from './ssr/cityPage';
import { renderBarberPage } from './ssr/barberPage';
import { renderServiceCityPage } from './ssr/servicePage';

const app = express();
import { prisma } from './lib/prisma';
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const publicPath = path.join(__dirname, '..', '..', 'dist');
console.log(`[SERVER] public path: ${publicPath}`);

app.use(express.static(publicPath, {
  maxAge: '1d',
  immutable: true,
}));

const CRAWLER_REGEX = /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|whatsapp|facebot|telegrambot|slackbot|discordbot/i;

function isCrawler(ua: string | undefined): boolean {
  return !!ua && CRAWLER_REGEX.test(ua);
}

// --- SEO ROUTES ---

app.get('/robots.txt', (_req, res) => {
  const baseUrl = process.env.APP_URL || 'https://battlebarber.com.br';
  res.type('text/plain').send(`User-agent: *
Allow: /
Sitemap: ${baseUrl}/api/seo/sitemap.xml
`);
});

app.get('/api/seo/cities', async (req, res) => {
  try {
    const minBarbers = parseInt(req.query.min_barbers as string) || 0;
    const cities = await (prisma as any).city.findMany({
      where: minBarbers > 0 ? { barbers_count: { gte: minBarbers } } : {},
      include: { state: true },
      orderBy: { barbers_count: 'desc' },
    });
    return res.json(cities.map((c: any) => ({
      id: c.id, name: c.name, slug: c.slug,
      state: { sigla: c.state.sigla, nome: c.state.nome, slug: c.state.slug },
      barbers_count: c.barbers_count, avg_price: c.avg_price,
      top_services: c.top_services, seo_enabled: c.seo_enabled,
    })));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

async function fetchCityData(stateSlug: string, citySlug: string) {
  const city = await (prisma as any).city.findFirst({
    where: { slug: citySlug, state: { slug: stateSlug } },
    include: {
      state: true,
      neighborhoods: { where: { barbers_count: { gte: 1 } }, orderBy: { barbers_count: 'desc' }, take: 30 },
    },
  });
  if (!city) return null;

  const barbers = await (prisma as any).barber.findMany({
    where: { cityId: city.id, isOnline: true },
    include: { user: { select: { name: true, avatar: true } } },
    orderBy: [{ rating: 'desc' }, { followersCount: 'desc' }],
    take: 50,
  });

  const highlighted = barbers.filter((b: any) => b.isPremium || b.rating >= 4.8).slice(0, 6);

  return {
    city: {
      id: city.id, name: city.name, slug: city.slug,
      barbers_count: city.barbers_count, avg_price: city.avg_price,
      top_services: city.top_services, seo_enabled: city.seo_enabled,
    },
    state: { sigla: city.state.sigla, nome: city.state.nome, slug: city.state.slug },
    neighborhoods: city.neighborhoods.map((n: any) => ({
      name: n.name, slug: n.slug, barbers_count: n.barbers_count,
    })),
    barbers: barbers.map((b: any) => ({
      id: b.id, name: b.user.name, avatar: b.user.avatar,
      shop: b.barberShop, slug: b.slug, rating: b.rating,
      reviewsCount: b.reviewsCount, specialties: b.specialties,
      isPremium: b.isPremium, isOnline: b.isOnline,
    })),
    highlighted: highlighted.map((b: any) => ({
      id: b.id, name: b.user.name, avatar: b.user.avatar,
      slug: b.slug, rating: b.rating, shop: b.barberShop,
    })),
  };
}

async function fetchBarberData(slug: string) {
  const barber = await (prisma as any).barber.findFirst({
    where: { slug },
    include: {
      user: { select: { name: true, avatar: true, bio: true } },
      city: { include: { state: true } },
      neighborhood: true,
    },
  });
  if (!barber) return null;
  return {
    name: barber.user.name, avatar: barber.user.avatar,
    bio: barber.user.bio || barber.bio, shop: barber.barberShop,
    slug: barber.slug, rating: barber.rating, reviewsCount: barber.reviewsCount,
    specialties: barber.specialties,
    city: barber.city ? { name: barber.city.name, slug: barber.city.slug } : null,
    state: barber.city?.state ? { sigla: barber.city.state.sigla, slug: barber.city.state.slug, nome: barber.city.state.nome } : null,
    neighborhood: barber.neighborhood ? { name: barber.neighborhood.name, slug: barber.neighborhood.slug } : null,
  };
}

// SSR: City page
app.get('/barbearias/:stateSlug/:citySlug', async (req, res) => {
  try {
    if (!isCrawler(req.headers['user-agent'])) {
      return res.sendFile(path.join(publicPath, 'index.html'));
    }

    const data = await fetchCityData(req.params.stateSlug, req.params.citySlug);
    if (!data) {
      return res.sendFile(path.join(publicPath, 'index.html'));
    }

    if (!data.city.seo_enabled) {
      return res.sendFile(path.join(publicPath, 'index.html'));
    }

    const html = renderCityPage(data);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

// SSR: Neighborhood page
app.get('/barbearias/:stateSlug/:citySlug/:neighborhoodSlug', async (req, res) => {
  try {
    if (!isCrawler(req.headers['user-agent'])) {
      return res.sendFile(path.join(publicPath, 'index.html'));
    }

    const { stateSlug, citySlug, neighborhoodSlug } = req.params;
    const city = await (prisma as any).city.findFirst({
      where: { slug: citySlug, state: { slug: stateSlug } },
      include: { state: true },
    });
    if (!city || !city.seo_enabled) return res.sendFile(path.join(publicPath, 'index.html'));

    const hood = await (prisma as any).neighborhood.findFirst({
      where: { slug: neighborhoodSlug, cityId: city.id },
    });
    if (!hood) return res.sendFile(path.join(publicPath, 'index.html'));

    const barbers = await (prisma as any).barber.findMany({
      where: { neighborhoodId: hood.id, isOnline: true },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: [{ rating: 'desc' }],
      take: 50,
    });

    const data = {
      city: { name: city.name, slug: city.slug, barbers_count: city.barbers_count, avg_price: city.avg_price },
      state: { sigla: city.state.sigla, nome: city.state.nome, slug: city.state.slug },
      neighborhoods: [],
      barbers: barbers.map((b: any) => ({
        id: b.id, name: b.user.name, avatar: b.user.avatar,
        shop: b.barberShop, slug: b.slug, rating: b.rating,
        reviewsCount: b.reviewsCount, specialties: b.specialties,
        isPremium: b.isPremium, isOnline: b.isOnline,
      })),
      highlighted: [],
    };

    const html = renderCityPage(data);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

// SSR: Barber page
app.get('/barbeiro/:slug', async (req, res) => {
  try {
    if (!isCrawler(req.headers['user-agent'])) {
      return res.sendFile(path.join(publicPath, 'index.html'));
    }

    const data = await fetchBarberData(req.params.slug);
    if (!data) {
      return res.sendFile(path.join(publicPath, 'index.html'));
    }

    const html = renderBarberPage(data);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

// SSR: Service + City page
app.get('/servicos/:service/:stateSlug/:citySlug', async (req, res) => {
  try {
    if (!isCrawler(req.headers['user-agent'])) {
      return res.sendFile(path.join(publicPath, 'index.html'));
    }

    const { service, stateSlug, citySlug } = req.params;
    const serviceLabels: Record<string, string> = {
      'corte-degrade': 'Corte Degradê',
      'barba': 'Barba',
      'corte-infantil': 'Corte Infantil',
      'corte-masculino': 'Corte Masculino',
      'hot-towel': 'Hot Towel',
    };

    const city = await (prisma as any).city.findFirst({
      where: { slug: citySlug, state: { slug: stateSlug } },
      include: { state: true },
    });
    if (!city || !city.seo_enabled) return res.sendFile(path.join(publicPath, 'index.html'));

    const barbers = await (prisma as any).barber.findMany({
      where: {
        cityId: city.id,
        isOnline: true,
        specialties: { has: serviceLabels[service] || service },
      },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: [{ rating: 'desc' }],
      take: 50,
    });

    const data = {
      service,
      serviceLabel: serviceLabels[service] || service,
      city: { name: city.name, slug: city.slug, barbers_count: city.barbers_count },
      state: { sigla: city.state.sigla, slug: city.state.slug },
      barbers: barbers.map((b: any) => ({
        id: b.id, name: b.user.name, avatar: b.user.avatar,
        shop: b.barberShop, slug: b.slug, rating: b.rating,
        reviewsCount: b.reviewsCount,
      })),
    };

    const html = renderServiceCityPage(data);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

// --- API ROUTES ---

app.use('/api/championships', championshipRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api', deployRoutes);

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'Battle Barber API is LIVE' });
});

// Catch-all: SPA
app.get(/.*/, (req, res) => {
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return res.status(404).send('File not found');
  }
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`[SERVER] Battle Barber API running on port ${port}`);
});

export { prisma };

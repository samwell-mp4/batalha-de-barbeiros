import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
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
import { renderStatePage } from './ssr/statePage';
import { renderBarberPage } from './ssr/barberPage';
import { renderServiceCityPage } from './ssr/servicePage';
import { renderLeadPage } from './ssr/leadPage';
import leadRoutes from './routes/leads';
import { getStates, findStateBySlug, getCitiesByState, loadAllCities, findCity, BrazilState, BrazilCity } from './data/brazil';

const app = express();
import { prisma } from './lib/prisma';
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Resolve paths relative to built server (server/dist)
const rootPath = path.join(__dirname, '..', '..');
const distPath = path.join(rootPath, 'dist');

// Auto-build frontend if dist is missing (useful on cPanel where only server is installed)
const rootPackageJson = path.join(rootPath, 'package.json');
if (!fs.existsSync(path.join(distPath, 'index.html')) && fs.existsSync(rootPackageJson)) {
  try {
    console.warn('[SERVER] dist/index.html not found. Building frontend...');
    execSync('npm run build', { cwd: rootPath, stdio: 'inherit' });
  } catch (e) {
    console.error('[SERVER] Frontend build failed on first attempt. Installing deps and retrying...', e);
    try {
      execSync('npm install', { cwd: rootPath, stdio: 'inherit' });
      execSync('npm run build', { cwd: rootPath, stdio: 'inherit' });
    } catch (e2) {
      console.error('[SERVER] Frontend build failed after install:', e2);
    }
  }
}

const assetsPath = fs.existsSync(path.join(distPath, 'index.html'))
  ? distPath
  : path.join(rootPath, 'public');

console.log(`[SERVER] static assets path: ${assetsPath}`);

// Serve built assets (dist) with fallback to public/
for (const p of [assetsPath, path.join(rootPath, 'public')]) {
  if (fs.existsSync(p)) {
    app.use(express.static(p, { maxAge: '1d', immutable: true }));
  }
}

const indexFile = fs.existsSync(path.join(distPath, 'index.html'))
  ? path.join(distPath, 'index.html')
  : path.join(rootPath, 'public', 'index.html');

const CRAWLER_REGEX = /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|whatsapp|facebot|telegrambot|slackbot|discordbot/i;

function isCrawler(ua: string | undefined): boolean {
  return !!ua && CRAWLER_REGEX.test(ua);
}

// --- SEO ROUTES ---

app.get('/robots.txt', (_req, res) => {
  const baseUrl = process.env.APP_URL || 'https://battlebarber.com.br';
  res.type('text/plain').send(`User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`);
});

// --- SITEMAPS (Programmatic, segmented) ---

function xmlHeaderUrlset(): string {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
    'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ' +
    'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
  );
}

function xmlHeaderIndex(): string {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  );
}

function getBaseUrl(req: express.Request): string {
  return process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
}

app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  let xml = xmlHeaderIndex();
  const parts = [
    'sitemap-estados.xml',
    'sitemap-cidades.xml',
    'sitemap-servicos.xml',
    'sitemap-barbeiros.xml',
    'sitemap-perfis.xml',
    'sitemap-campeonatos.xml',
    'sitemap-ranking.xml',
    'sitemap-blog.xml',
    'sitemap-images.xml',
  ];
  const today = new Date().toISOString().split('T')[0];
  for (const p of parts) {
    xml += `  <sitemap><loc>${baseUrl}/${p}</loc><lastmod>${today}</lastmod></sitemap>\n`;
  }
  xml += '</sitemapindex>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/sitemap-estados.xml', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const today = new Date().toISOString().split('T')[0];
  const states = getStates();
  let xml = xmlHeaderUrlset();
  // Estado pages use our current pattern /barbearias/:stateSlug
  for (const st of states) {
    xml += `  <url><loc>${baseUrl}/barbearias/${st.slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
  }
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/sitemap-cidades.xml', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const today = new Date().toISOString().split('T')[0];
  await loadAllCities();
  let xml = xmlHeaderUrlset();
  for (const st of getStates()) {
    const cities = await getCitiesByState(st.id);
    for (const c of cities) {
      xml += `  <url><loc>${baseUrl}/barbearias/${st.slug}/${c.slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    }
  }
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/sitemap-servicos.xml', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const today = new Date().toISOString().split('T')[0];
  const services = ['corte-degrade', 'barba', 'corte-infantil', 'corte-masculino', 'hot-towel'];
  await loadAllCities();
  let xml = xmlHeaderUrlset();
  for (const st of getStates()) {
    const cities = await getCitiesByState(st.id);
    for (const c of cities) {
      for (const svc of services) {
        xml += `  <url><loc>${baseUrl}/servicos/${svc}/${st.slug}/${c.slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
      }
    }
  }
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/sitemap-barbeiros.xml', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const today = new Date().toISOString().split('T')[0];
  let xml = xmlHeaderUrlset();
  try {
    const barbers = await (prisma as any).barber.findMany({
      where: { slug: { not: null } },
      include: { user: { select: { name: true, avatar: true } } },
      take: 50000,
    });
    for (const b of barbers) {
      const img = b.user?.avatar;
      xml += `  <url><loc>${baseUrl}/barbeiro/${b.slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority>`;
      if (img) {
        const title = (b.user?.name || 'Barbeiro').replace(/&/g, '&amp;');
        xml += `<image:image><image:loc>${img}</image:loc><image:title>${title}</image:title></image:image>`;
      }
      xml += `</url>\n`;
    }
  } catch (e) {
    console.error('[SITEMAP] Erro ao listar barbeiros', e);
  }
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/sitemap-perfis.xml', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const today = new Date().toISOString().split('T')[0];
  let xml = xmlHeaderUrlset();
  try {
    const leads = await (prisma as any).barberLead.findMany({
      select: { slug: true },
      take: 50000,
    });
    for (const l of leads) {
      xml += `  <url><loc>${baseUrl}/perfil/${l.slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
    }
  } catch (e) {
    console.error('[SITEMAP] Erro perfis', e);
  }
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/sitemap-campeonatos.xml', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const today = new Date().toISOString().split('T')[0];
  let xml = xmlHeaderUrlset();
  try {
    const champs = await (prisma as any).championship.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50000,
    });
    for (const c of champs) {
      xml += `  <url><loc>${baseUrl}/campeonato/${c.id}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
    }
  } catch {}
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/sitemap-ranking.xml', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const today = new Date().toISOString().split('T')[0];
  let xml = xmlHeaderUrlset();
  xml += `  <url><loc>${baseUrl}/ranking/brasil</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
  for (const st of getStates()) {
    xml += `  <url><loc>${baseUrl}/ranking/${st.slug}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
  }
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/sitemap-blog.xml', async (req, res) => {
  // Placeholder: no blog posts model with slug yet
  let xml = xmlHeaderUrlset();
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/sitemap-images.xml', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const today = new Date().toISOString().split('T')[0];
  let xml = xmlHeaderUrlset();
  try {
    const barbers = await (prisma as any).barber.findMany({
      where: { slug: { not: null } },
      include: { user: { select: { name: true, avatar: true } } },
      take: 20000,
    });
    for (const b of barbers) {
      const loc = `${baseUrl}/barbeiro/${b.slug}`;
      const img = b.user?.avatar;
      xml += `  <url><loc>${loc}</loc><lastmod>${today}</lastmod>`;
      if (img) {
        const title = (b.user?.name || 'Barbeiro').replace(/&/g, '&amp;');
        xml += `<image:image><image:loc>${img}</image:loc><image:title>${title}</image:title></image:image>`;
      }
      xml += `</url>\n`;
    }
  } catch {}
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
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
  const ibgeState = findStateBySlug(stateSlug);
  const ibgeCity = ibgeState ? await findCity(citySlug, ibgeState.id) : null;

  const city = await (prisma as any).city.findFirst({
    where: { slug: citySlug, state: { slug: stateSlug } },
    include: {
      state: true,
      neighborhoods: { where: { barbers_count: { gte: 1 } }, orderBy: { barbers_count: 'desc' }, take: 30 },
    },
  });

  const barbers = city ? await (prisma as any).barber.findMany({
    where: { cityId: city.id, isOnline: true },
    include: { user: { select: { name: true, avatar: true } } },
    orderBy: [{ rating: 'desc' }, { followersCount: 'desc' }],
    take: 50,
  }) : [];

  const highlighted = barbers.filter((b: any) => b.isPremium || b.rating >= 4.8).slice(0, 6);

  const leads = citySlug ? await (prisma as any).barberLead.findMany({
    where: { citySlug: citySlug, claimed: false },
    orderBy: { rating: 'desc' },
    take: 20,
  }) : [];

  return {
    leads: leads.map((l: any) => ({
      id: l.id, name: l.name, slug: l.slug,
      rating: l.rating, reviewCount: l.reviewCount,
      address: l.address, neighborhood: l.neighborhood,
      city: l.city, state: l.state,
    })),
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
      name: n.name, slug: n.slug, barbers_count: n.barbers_count,
    })) : [],
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
    nearbyCities: ibgeState ? (await getCitiesByState(ibgeState.id))
      .filter((c: BrazilCity) => c.slug !== citySlug)
      .slice(0, 12)
      .map((c: BrazilCity) => ({ nome: c.nome, slug: c.slug })) : [],
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
    const data = await fetchCityData(req.params.stateSlug, req.params.citySlug);
    if (!data) {
      return res.sendFile(indexFile);
    }

    const html = renderCityPage(data);
    res.set('Cache-Control', 'public, max-age=3600');

    if (isCrawler(req.headers['user-agent'])) {
      res.send(html);
    } else {
      res.sendFile(indexFile);
    }
  } catch {
    res.sendFile(indexFile);
  }
});

// SSR: State page
app.get('/barbearias/:stateSlug', async (req, res) => {
  try {
    const brState = findStateBySlug(req.params.stateSlug);
    if (!brState) return res.sendFile(indexFile);

    const cities = await getCitiesByState(brState.id);
    const data = { state: brState, cities };
    const html = renderStatePage(data);
    res.set('Cache-Control', 'public, max-age=3600');

    if (isCrawler(req.headers['user-agent'])) {
      res.send(html);
    } else {
      res.sendFile(indexFile);
    }
  } catch {
    res.sendFile(indexFile);
  }
});

// SSR: Neighborhood page
app.get('/barbearias/:stateSlug/:citySlug/:neighborhoodSlug', async (req, res) => {
  try {
    if (!isCrawler(req.headers['user-agent'])) {
      return res.sendFile(indexFile);
    }

    const { stateSlug, citySlug, neighborhoodSlug } = req.params;
    const city = await (prisma as any).city.findFirst({
      where: { slug: citySlug, state: { slug: stateSlug } },
      include: { state: true },
    });
    if (!city || !city.seo_enabled) return res.sendFile(indexFile);

    const hood = await (prisma as any).neighborhood.findFirst({
      where: { slug: neighborhoodSlug, cityId: city.id },
    });
    if (!hood) return res.sendFile(indexFile);

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
    res.sendFile(indexFile);
  }
});

// SSR: Barber page
app.get('/barbeiro/:slug', async (req, res) => {
  try {
    if (!isCrawler(req.headers['user-agent'])) {
      return res.sendFile(indexFile);
    }

    const data = await fetchBarberData(req.params.slug);
    if (!data) {
      return res.sendFile(indexFile);
    }

    const html = renderBarberPage(data);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch {
    res.sendFile(indexFile);
  }
});

// SSR: Lead page
app.get('/perfil/:slug', async (req, res) => {
  try {
    if (!isCrawler(req.headers['user-agent'])) {
      return res.sendFile(indexFile);
    }

    const lead = await (prisma as any).barberLead.findUnique({
      where: { slug: req.params.slug },
    });
    if (!lead) return res.sendFile(indexFile);

    const data = {
      name: lead.name,
      address: lead.address,
      rating: lead.rating,
      reviewCount: lead.reviewCount,
      slug: lead.slug,
      city: lead.city,
      state: lead.state,
      neighborhood: lead.neighborhood,
      claimed: lead.claimed,
      verified: lead.verified,
    };

    const html = renderLeadPage(data);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch {
    res.sendFile(indexFile);
  }
});

// SSR: Service + City page
app.get('/servicos/:service/:stateSlug/:citySlug', async (req, res) => {
  try {
    if (!isCrawler(req.headers['user-agent'])) {
      return res.sendFile(indexFile);
    }

    const { service, stateSlug, citySlug } = req.params;
    const serviceLabels: Record<string, string> = {
      'corte-degrade': 'Corte Degradê',
      'barba': 'Barba',
      'corte-infantil': 'Corte Infantil',
      'corte-masculino': 'Corte Masculino',
      'hot-towel': 'Hot Towel',
    };

    const ibgeState = findStateBySlug(stateSlug);
    const ibgeCity = ibgeState ? await findCity(citySlug, ibgeState.id) : null;

    const city = await (prisma as any).city.findFirst({
      where: { slug: citySlug, state: { slug: stateSlug } },
      include: { state: true },
    });

    const barbers = city ? await (prisma as any).barber.findMany({
      where: {
        cityId: city.id,
        isOnline: true,
        specialties: { has: serviceLabels[service] || service },
      },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: [{ rating: 'desc' }],
      take: 50,
    }) : [];

    const data = {
      service,
      serviceLabel: serviceLabels[service] || service,
      city: {
        name: city?.name || ibgeCity?.nome || citySlug,
        slug: citySlug,
        barbers_count: city?.barbers_count || 0,
      },
      state: {
        sigla: city?.state?.sigla || ibgeState?.sigla || stateSlug,
        slug: stateSlug,
      },
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
    res.sendFile(indexFile);
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
app.use('/api/leads', leadRoutes);
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
  if (!fs.existsSync(indexFile)) {
    return res.status(200).type('html').send('<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Battle Barber</title></head><body><div id="root"></div></body></html>');
  }
  res.sendFile(indexFile);
});

app.listen(port, () => {
  console.log(`[SERVER] Battle Barber API running on port ${port}`);
});

export { prisma };

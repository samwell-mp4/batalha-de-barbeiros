const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-+/g, '-');
}

function parseAddress(raw) {
  const parts = { street: '', neighborhood: '', city: '', state: 'MG' };
  if (!raw) return parts;

  // Normalize: remove leading emoji/icon chars
  let addr = raw.replace(/^[^\w\s]{1,3}/, '').trim();

  // Split by " - " (space dash space)
  const segments = addr.split(' - ').map(s => s.trim()).filter(Boolean);

  if (segments.length >= 3) {
    // Last segment: "MG, 35670-000" or "MG"
    const last = segments[segments.length - 1];
    const stateMatch = last.match(/^([A-Z]{2})/);
    if (stateMatch) parts.state = stateMatch[1];

    // Second to last: "Central, Mateus Leme" or just "Mateus Leme"
    const citySeg = segments[segments.length - 2];
    const cityParts = citySeg.split(',').map(s => s.trim());
    if (cityParts.length >= 2) {
      parts.neighborhood = cityParts[0];
      parts.city = cityParts.slice(1).join(', ').trim();
    } else {
      parts.city = citySeg;
    }

    // First segment: street + number
    parts.street = segments[0];
  } else if (segments.length === 2) {
    const last = segments[1];
    const stateMatch = last.match(/^([A-Z]{2})/);
    if (stateMatch) parts.state = stateMatch[1];
    parts.street = segments[0];
  } else {
    parts.street = addr;
  }

  return parts;
}

const COMMON_SERVICES = [
  'Corte Masculino', 'Corte Degradê', 'Barba', 'Corte Infantil',
  'Hot Towel', 'Barboterapia', 'Design Capilar', 'Hidratação',
  'Corte Navalhado', 'Pigmentação Capilar', 'Sobrancelha', 'Depilação',
];

async function importLeads() {
  console.log('[SEED-LEADS] Iniciando importação...');

  const possiblePaths = [
    path.join(__dirname, '..', '..', 'md', 'leads_barbearia_filtrado.csv'),
    path.join('/app', 'md', 'leads_barbearia_filtrado.csv'),
  ];
  const csvPath = possiblePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    console.error('[SEED-LEADS] CSV não encontrado:', possiblePaths);
    process.exit(1);
  }
  console.log('[SEED-LEADS] Lendo:', csvPath);

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const allLines = raw.split('\n').filter(l => l.trim());
  const headers = allLines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < allLines.length; i++) {
    try {
      const line = allLines[i].trim();
      let vals = [];
      let current = '';
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; continue; }
        if (ch === ',' && !inQuotes) { vals.push(current.trim()); current = ''; continue; }
        current += ch;
      }
      vals.push(current.trim());

      const name = vals[0]?.replace(/^"|"$/g, '')?.trim() || '';
      const phone = vals[1]?.replace(/^"|"$/g, '')?.trim() || '';
      const address = vals[2]?.replace(/^"|"$/g, '')?.trim() || '';
      const rating = parseFloat(vals[3]?.replace(/^"|"$/g, '')?.trim()) || 0;
      const reviewCount = parseInt(vals[4]?.replace(/^"|"$/g, '')?.trim()) || 0;
      const website = vals[5]?.replace(/^"|"$/g, '')?.trim() || null;
      const category = vals[6]?.replace(/^"|"$/g, '')?.trim() || null;
      const campaign = vals[7]?.replace(/^"|"$/g, '')?.trim() || null;

      if (!name || !address) { skipped++; continue; }

      const parsed = parseAddress(address);
      const citySlug = slugify(parsed.city || 'sem-cidade');
      let baseSlug = slugify(name);
      let slug = baseSlug;

      let exists = await prisma.barberLead.findUnique({ where: { slug } });
      let counter = 1;
      while (exists) {
        slug = `${baseSlug}-${counter}`;
        exists = await prisma.barberLead.findUnique({ where: { slug } });
        counter++;
      }

      try {
        await prisma.barberLead.create({
          data: {
            name,
            phone,
            address,
            rating: isNaN(rating) ? 0 : rating,
            reviewCount: isNaN(reviewCount) ? 0 : reviewCount,
            website,
            category,
            city: parsed.city || '',
            citySlug,
            state: parsed.state || 'MG',
            neighborhood: parsed.neighborhood || null,
            street: parsed.street || null,
            slug,
            source: 'google_maps',
            campaign,
          },
        });
        imported++;
      } catch (e) {
        if (e.code === 'P2002') { skipped++; continue; }
        skipped++;
      }

      if (imported % 500 === 0) {
        console.log(`[SEED-LEADS] ${imported} importados...`);
      }
    } catch (e) {
      skipped++;
    }
  }

  console.log(`[SEED-LEADS] Concluído! ${imported} importados, ${skipped} ignorados.`);
}

importLeads()
  .catch(e => console.error('[SEED-LEADS] Erro:', e))
  .finally(() => prisma.$disconnect());

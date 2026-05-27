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

function parseAddress(address) {
  const parts = { street: '', neighborhood: '', city: '', state: 'MG' };
  if (!address) return parts;

  // Extract " - City - MG, CEP"
  const cityMatch = address.match(/- ([A-Za-zÀ-ÿ\s]+) - ([A-Z]{2}),/);
  if (cityMatch) {
    parts.city = cityMatch[1].trim();
    parts.state = cityMatch[2].trim();
  }

  // Extract neighborhood before city
  const hoodMatch = address.match(/- ([A-Za-zÀ-ÿ\s]+) - [A-Za-zÀ-ÿ\s]+ - [A-Z]{2}/);
  if (hoodMatch) {
    parts.neighborhood = hoodMatch[1].trim();
  }

  // Street is the first part before first " - "
  const streetMatch = address.match(/^(.*?)(?: - |$)/);
  if (streetMatch) {
    parts.street = streetMatch[1].trim();
  }

  return parts;
}

async function importLeads() {
  console.log('[SEED-LEADS] Iniciando importação...');

  const possiblePaths = [
    path.join(__dirname, '..', '..', 'md', 'leads_barbearia_filtrado.csv'),
    path.join('/app', 'md', 'leads_barbearia_filtrado.csv'),
    path.join('/app', 'server', '..', 'md', 'leads_barbearia_filtrado.csv'),
  ];
  const csvPath = possiblePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    console.error('[SEED-LEADS] Arquivo CSV não encontrado. Caminhos tentados:', possiblePaths);
    process.exit(1);
  }
  const raw = fs.readFileSync(csvPath, 'utf-8');

  const lines = raw.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    try {
      const line = lines[i].trim();
      // Handle multi-line fields: find first unquoted comma
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
      const citySlug = slugify(parsed.city);
      let baseSlug = slugify(name);
      let slug = baseSlug;

      // Ensure unique slug
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
            rating,
            reviewCount,
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
        console.error(`[SEED-LEADS] Erro ao importar ${name}:`, e.message);
        skipped++;
      }

      if (imported % 100 === 0) {
        console.log(`[SEED-LEADS] ${imported} importados...`);
      }
    } catch (e) {
      skipped++;
    }
  }

  console.log(`[SEED-LEADS] Importação concluída! ${imported} leads importados, ${skipped} ignorados.`);
}

importLeads()
  .catch(e => console.error('[SEED-LEADS] Erro:', e))
  .finally(() => prisma.$disconnect());

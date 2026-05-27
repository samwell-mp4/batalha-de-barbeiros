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

  // Remove leading emoji/icon chars (like , )
  let addr = raw.replace(/^[^\w\s]{1,5}/, '').trim();
  // Remove trailing commas/spaces
  addr = addr.replace(/^[,\s]+|[,\s]+$/g, '');

  const segments = addr.split(' - ').map(s => s.trim()).filter(Boolean);

  if (segments.length >= 3) {
    // Last: "MG, 35670-000"
    const last = segments[segments.length - 1];
    const stateMatch = last.match(/^([A-Z]{2})/);
    if (stateMatch) parts.state = stateMatch[1];

    // Second-to-last: "Bairro, Cidade"
    const citySeg = segments[segments.length - 2];
    const commaIdx = citySeg.lastIndexOf(',');
    if (commaIdx !== -1) {
      parts.neighborhood = citySeg.substring(0, commaIdx).trim();
      parts.city = citySeg.substring(commaIdx + 1).trim();
    } else {
      parts.city = citySeg;
    }

    parts.street = segments[0];
  } else if (segments.length === 2) {
    parts.street = segments[0];
    const last = segments[1];
    const stateMatch = last.match(/^([A-Z]{2})/);
    if (stateMatch) parts.state = stateMatch[1];
  } else {
    parts.street = addr;
  }

  return parts;
}

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
  const lines = raw.split('\n');

  // CSV structure: each record spans exactly 3 lines
  // Line 1: Nome,"emoji
  // Line 2:  telefone","emoji
  // Line 3:  endereço",rating,reviews,site,categoria,campanha

  let imported = 0;
  let skipped = 0;

  // Start from line 1 (skip header)
  for (let i = 1; i < lines.length - 2; i += 3) {
    try {
      const line1 = lines[i] || '';
      const line2 = lines[i + 1] || '';
      const line3 = lines[i + 2] || '';

      // Parse: line1 = Nome,"emoji
      const nameMatch = line1.match(/^"?(.*?)","?.*/);
      const name = nameMatch ? nameMatch[1].trim() : '';

      // Parse: line2 = telefone","emoji
      const phoneMatch = line2.match(/^"?\s*(.*?)"?\s*","?/);
      const phone = phoneMatch ? phoneMatch[1].trim() : '';

      // Parse: line3 = endereço",rating,reviews,site,categoria,campanha
      // The address ends at the first ", followed by comma-separated values
      const addrEnd = line3.indexOf('",');
      let address = '';
      let restFields = '';
      if (addrEnd !== -1) {
        address = line3.substring(0, addrEnd).replace(/^"/, '').replace(/^[^\w\s]{1,5}/, '').trim();
        restFields = line3.substring(addrEnd + 2);
      } else {
        restFields = line3;
      }

      const fields = restFields.split(',').map(f => f.trim());
      const rating = parseFloat(fields[0]) || 0;
      const reviewCount = parseInt(fields[1]) || 0;
      const website = fields[2] || null;
      const category = fields[3] || null;
      const campaign = fields[4] || null;

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
            website: website || null,
            category: category || null,
            city: parsed.city || '',
            citySlug,
            state: parsed.state || 'MG',
            neighborhood: parsed.neighborhood || null,
            street: parsed.street || null,
            slug,
            source: 'google_maps',
            campaign: campaign || null,
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

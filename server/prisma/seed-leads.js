const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SHOULD_CLEAR = process.argv.includes('--clear');

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-+/g, '-');
}

function parseCsvRows(text) {
  const rows = [];
  const lines = text.split('\n');
  let currentLines = [];
  let inQuotes = false;

  for (const line of lines) {
    const trimmed = line.replace(/\r$/, '');
    currentLines.push(trimmed);

    let quoteCount = 0;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '"') {
        if (i + 1 < trimmed.length && trimmed[i + 1] === '"') { i++; continue; }
        quoteCount++;
      }
    }

    if (quoteCount % 2 === 1) inQuotes = !inQuotes;

    if (!inQuotes && currentLines.length > 0) {
      rows.push(currentLines.join('\n'));
      currentLines = [];
    }
  }

  if (currentLines.length > 0) rows.push(currentLines.join('\n'));
  return rows;
}

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());

  return fields;
}

function cleanField(str) {
  if (!str) return '';
  return str
    .replace(/[®‚°ƒˆ]/g, '')
    .replace(/[\u2500-\u257F\u2580-\u259F\u0E00-\u0E7F]/g, '')
    .replace(/[^ -~À-ÿªº]/g, '')
    .trim();
}

function cleanPhone(str) {
  if (!str) return '';
  return str.replace(/\D/g, '');
}

function extractCityState(str) {
  const result = { city: '', state: '' };
  // Match: "Cidade, STATE, zip" or "Cidade, STATE"
  const m = str.match(/^([^,]+),\s*([A-Z]{2})(?:,\s*\d{5}-?\d{3})?\s*$/);
  if (m) { result.city = m[1].trim(); result.state = m[2]; }
  // Match: "Cidade - STATE, zip"
  const m2 = str.match(/^([^,]+?)\s*-\s*([A-Z]{2})(?:,\s*\d{5}-?\d{3})?\s*$/);
  if (m2) { result.city = m2[1].trim(); result.state = m2[2]; }
  return result;
}

function parseAddress(raw) {
  const parts = { street: '', neighborhood: '', city: '', state: 'MG' };
  if (!raw) return parts;

  let addr = cleanField(raw);
  addr = addr.replace(/^[,\s\.]+|[,\s\.]+$/g, '');
  if (!addr) return parts;

  const segments = addr.split(' - ').map(s => s.trim()).filter(Boolean);

  if (segments.length >= 3) {
    const last = segments[segments.length - 1];
    const stateMatch = last.match(/^([A-Z]{2})/);
    if (stateMatch) parts.state = stateMatch[1];

    const citySeg = segments[segments.length - 2];
    const commaIdx = citySeg.lastIndexOf(',');
    if (commaIdx !== -1) {
      parts.neighborhood = citySeg.substring(0, commaIdx).trim();
      parts.city = citySeg.substring(commaIdx + 1).trim();
    } else {
      parts.city = citySeg;
    }

    parts.street = segments.slice(0, segments.length - 2).join(' - ');
  } else if (segments.length === 2) {
    parts.street = segments[0];
    const cs = extractCityState(segments[1]);
    if (cs.state) parts.state = cs.state;
    if (cs.city) {
      parts.city = cs.city;
    } else if (/^[A-Z]{2}/.test(segments[1])) {
      // seg[1] is just state (+zip) → seg[0] is the city
      parts.city = parts.street;
      parts.street = '';
    } else {
      // Check end of street for embedded city
      const lastComma = parts.street.lastIndexOf(',');
      if (lastComma !== -1) {
        const possible = parts.street.substring(lastComma + 1).trim();
        if (possible && !/^\d/.test(possible) && possible.length > 2) {
          parts.city = possible;
          parts.street = parts.street.substring(0, lastComma).trim();
        }
      }
    }
  } else {
    parts.street = addr;
    // Try single-segment: "Cidade, STATE, zip"
    const cs = extractCityState(addr);
    if (cs.city) {
      parts.city = cs.city;
      if (cs.state) parts.state = cs.state;
    }
  }

  return parts;
}

async function importLeads() {
  console.log('[SEED-LEADS] Iniciando importação...');

  if (SHOULD_CLEAR) {
    console.log('[SEED-LEADS] Removendo registros existentes...');
    const { count } = await prisma.barberLead.deleteMany({});
    console.log(`[SEED-LEADS] ${count} registros removidos`);
  }

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
  const rows = parseCsvRows(raw);
  console.log(`[SEED-LEADS] Total de linhas (header + dados): ${rows.length}`);

  const dataRows = rows.slice(1);

  let imported = 0;
  let skipped = 0;
  let noAddress = 0;
  let noName = 0;

  for (const row of dataRows) {
    try {
      const fields = parseCsvLine(row);

      const name = cleanField(fields[0]) || '';
      const phone = cleanPhone(fields[1] || '');
      const rawAddress = cleanField(fields[2] || '');
      const rating = parseFloat(fields[3]) || 0;
      const reviewCount = parseInt(fields[4]) || 0;
      const website = fields[5] || null;
      const category = fields[6] || null;
      const campaign = fields[7] || null;

      if (!name) { noName++; skipped++; continue; }
      if (!rawAddress) { noAddress++; skipped++; continue; }

      const parsed = parseAddress(rawAddress);
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
            phone: phone || null,
            address: rawAddress,
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

  console.log(`[SEED-LEADS] Concluído! ${imported} importados, ${skipped} ignorados (sem nome: ${noName}, sem endereço: ${noAddress})`);
}

importLeads()
  .catch(e => console.error('[SEED-LEADS] Erro:', e))
  .finally(() => prisma.$disconnect());

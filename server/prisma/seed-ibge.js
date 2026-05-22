const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function importIBGE() {
  console.log('[IBGE] Importando estados...');
  const statesRes = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
  const states = await statesRes.json();

  for (const state of states) {
    const sigla = state.sigla;
    await prisma.state.upsert({
      where: { id: state.id },
      update: { nome: state.nome, sigla, slug: slugify(state.nome) },
      create: { id: state.id, nome: state.nome, sigla, slug: slugify(state.nome) },
    });
    console.log(`  ✅ ${sigla} - ${state.nome}`);
  }

  console.log('[IBGE] Importando municípios...');
  const citiesRes = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
  const cities = await citiesRes.json();
  let count = 0;

  for (const city of cities) {
    const stateId = city.microrregiao?.mesorregiao?.UF?.id;
    if (!stateId) continue;

    await prisma.city.upsert({
      where: { id: city.id },
      update: {
        name: city.nome,
        slug: slugify(city.nome),
        stateId,
      },
      create: {
        id: city.id,
        name: city.nome,
        slug: slugify(city.nome),
        stateId,
        top_services: [],
      },
    });
    count++;
    if (count % 500 === 0) console.log(`  ${count}/${cities.length} municípios...`);
  }

  console.log(`[IBGE] ${count} municípios importados com sucesso!`);
  console.log('[IBGE] Atualizando barbers_count e seo_enabled...');

  const allCities = await prisma.city.findMany();
  for (const city of allCities) {
    const barberCount = await prisma.barber.count({ where: { cityId: city.id } });
    const appointments = await prisma.appointment.findMany({
      where: {
        barber: { cityId: city.id },
        status: 'COMPLETED',
      },
      select: { price: true, services: true },
    });

    const avgPrice = appointments.length > 0
      ? appointments.reduce((s, a) => s + a.price, 0) / appointments.length
      : null;

    const serviceCount = {};
    appointments.forEach((a) => {
      a.services?.forEach((s) => {
        serviceCount[s] = (serviceCount[s] || 0) + 1;
      });
    });
    const topServices = Object.entries(serviceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([s]) => s);

    // Calculate average lat/lng from barbers in this city
    // In current schema latitude/longitude are non-nullable on Barber,
    // so filtering with `{ not: null }` throws in Prisma. Just filter by cityId.
    const barbers = await prisma.barber.findMany({
      where: { cityId: city.id },
      select: { latitude: true, longitude: true },
    });
    const lat = barbers.length > 0
      ? barbers.reduce((s, b) => s + b.latitude, 0) / barbers.length
      : null;
    const lng = barbers.length > 0
      ? barbers.reduce((s, b) => s + b.longitude, 0) / barbers.length
      : null;

    await prisma.city.update({
      where: { id: city.id },
      data: {
        barbers_count: barberCount,
        avg_price: avgPrice ? Math.round(avgPrice * 100) / 100 : null,
        top_services: topServices,
        seo_enabled: barberCount >= 5,
        latitude: lat ? Math.round(lat * 10000) / 10000 : null,
        longitude: lng ? Math.round(lng * 10000) / 10000 : null,
      },
    });
  }

  console.log('[IBGE] Importação concluída!');
}

importIBGE()
  .catch((e) => {
    console.error('[IBGE] Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateBarbers() {
  console.log('[MIGRATE] Iniciando migração de barbeiros para City/Neighborhood...');

  const barbers = await prisma.barber.findMany({
    where: { cityId: null },
    include: { user: { select: { city: true, state: true, neighborhood: true } } }
  });

  if (barbers.length === 0) {
    console.log('[MIGRATE] Nenhum barbeiro pendente de migração.');
    return;
  }

  console.log(`[MIGRATE] ${barbers.length} barbeiros para migrar...`);

  let matched = 0;
  let unmatched = 0;

  for (const barber of barbers) {
    const userCity = barber.user?.city?.trim();
    const userState = barber.user?.state?.trim();
    const userNeighborhood = barber.user?.neighborhood?.trim();

    if (!userCity || !userState) {
      console.log(`  ⏭️  Barbeiro ${barber.id} (${barber.barberShop}): sem cidade/estado no User`);
      unmatched++;
      continue;
    }

    const city = await prisma.city.findFirst({
      where: {
        name: { contains: userCity, mode: 'insensitive' },
        state: { sigla: userState }
      },
      include: { state: true }
    });

    if (!city) {
      console.log(`  ⚠️  Barbeiro ${barber.barberShop}: cidade "${userCity}/${userState}" não encontrada no IBGE`);
      unmatched++;
      continue;
    }

    let neighborhoodId = null;
    if (userNeighborhood) {
      let hood = await prisma.neighborhood.findFirst({
        where: {
          name: { contains: userNeighborhood, mode: 'insensitive' },
          cityId: city.id
        }
      });
      if (!hood) {
        hood = await prisma.neighborhood.create({
          data: {
            name: userNeighborhood,
            slug: userNeighborhood.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            cityId: city.id,
            barbers_count: 0
          }
        });
        console.log(`  🏘️  Bairro criado: ${userNeighborhood} em ${city.name}`);
      }
      neighborhoodId = hood.id;
    }

    await prisma.barber.update({
      where: { id: barber.id },
      data: { cityId: city.id, neighborhoodId }
    });

    matched++;
    console.log(`  ✅ ${barber.barberShop} → ${city.name}/${city.state.sigla}${neighborhoodId ? `, bairro ${userNeighborhood}` : ''}`);
  }

  // Recalcular barbers_count e seo_enabled nas cidades
  console.log('[MIGRATE] Recalculando barbers_count e seo_enabled...');
  const allCities = await prisma.city.findMany();
  for (const city of allCities) {
    const count = await prisma.barber.count({ where: { cityId: city.id } });
    await prisma.city.update({
      where: { id: city.id },
      data: {
        barbers_count: count,
        seo_enabled: count >= 5,
      }
    });
  }

  console.log(`[MIGRATE] Concluído! ${matched} matchs, ${unmatched} não encontrados, ${allCities.length} cidades atualizadas.`);
}

migrateBarbers()
  .catch((e) => {
    console.error('[MIGRATE] Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

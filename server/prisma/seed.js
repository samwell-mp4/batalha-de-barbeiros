const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create some users/barbers
  const barbers = [
    { name: 'Henrique Barber', email: 'henrique@elite.com', location: 'Tatuapé, SP', lat: -23.525, lng: -46.522 },
    { name: 'Vitor do Corte', email: 'vitor@elite.com', location: 'Mooca, SP', lat: -23.535, lng: -46.532 },
    { name: 'Gustavo Fade', email: 'gustavo@elite.com', location: 'Anália Franco, SP', lat: -23.545, lng: -46.542 },
  ];

  for (const b of barbers) {
    const user = await prisma.user.upsert({
      where: { email: b.email },
      update: {},
      create: {
        name: b.name,
        email: b.email,
        role: 'BARBER',
        location: b.location,
        barberProfile: {
          create: {
            rating: 4.9,
            specialties: ['Fade', 'Pigmentação', 'Navalhado'],
            isOnline: true,
            latitude: b.lat,
            longitude: b.lng,
          }
        }
      }
    });
    console.log(`Created barber: ${user.name}`);
  }

  // Create initial championships
  await prisma.championship.create({
    data: {
      name: 'Batalha do Tatuapé',
      ligaId: 2,
      modality: 'x1',
      theme: 'Degradê Perfeito',
      prize: 'R$ 1.000 + Kit Premium',
      status: 'ONGOING',
    }
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

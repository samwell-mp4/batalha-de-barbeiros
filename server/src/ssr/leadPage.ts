export function renderLeadPage(data: any): string {
  const { name, address, rating, reviewCount, slug, city, state, neighborhood, street, claimed, verified } = data;

  const citySlug = (city || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
  const stateSlug = (state || 'mg').toLowerCase();

  const title = `${name} - Barbearia em ${city || ''}${state ? `, ${state}` : ''} | Battle Barber`;
  const description = `${name} em ${city || ''}${state ? ` - ${state}` : ''}. Avaliação ${(rating || 0).toFixed(1)} de 5 (${reviewCount || 0} avaliações). Verifique seu perfil gratuito no Battle Barber.`;
  const canonical = `https://battlebarber.com.br/perfil/${slug}`;

  const breadcrumbItems = [
    { name: 'Início', url: '/' },
    ...(city ? [{ name: `Barbearias em ${city}`, url: `/barbearias/${stateSlug}/${citySlug}` }] : []),
    { name, url: canonical },
  ];

  const breadcrumbJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://battlebarber.com.br${item.url}`,
    })),
  });

  const localBusinessJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description: `${name} é uma barbearia em ${city || ''}${state ? `, ${state}` : ''} com avaliação ${(rating || 0).toFixed(1)} de 5.`,
    url: canonical,
    address: {
      '@type': 'PostalAddress',
      streetAddress: street || address?.split(',')[0] || '',
      addressLocality: city || '',
      addressRegion: state || '',
      addressCountry: 'BR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (rating || 0).toFixed(1),
      reviewCount: reviewCount || 0,
      bestRating: 5,
    },
    priceRange: '$$',
  });

  const stars = '★'.repeat(Math.round(rating || 0)) + '☆'.repeat(5 - Math.round(rating || 0));
  const services = ['Corte Masculino', 'Corte Degradê', 'Barba', 'Corte Infantil', 'Hot Towel', 'Barboterapia', 'Design Capilar', 'Hidratação'];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description.replace(/<[^>]*>/g, '').substring(0, 200)}" />
  <meta name="keywords" content="barbearia ${city || ''}, ${name}, barbeiro ${city || ''}, corte de cabelo ${city || ''}, barbearia em ${city || ''}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description.replace(/<[^>]*>/g, '').substring(0, 200)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:type" content="business.business" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description.replace(/<[^>]*>/g, '').substring(0, 200)}" />
  <meta name="robots" content="index, follow" />
  <script type="application/ld+json">${breadcrumbJson}</script>
  <script type="application/ld+json">${localBusinessJson}</script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; padding: 50px 0 36px; text-align: center; }
    .header h1 { font-size: 2rem; margin-bottom: 6px; }
    .header .sub { font-size: 1rem; opacity: .85; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 16px; border-radius: 20px; font-size: .85rem; margin-top: 10px; }
    .stars { font-size: 1.5rem; color: #f59e0b; margin: 8px 0; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; margin: 20px 0; }
    .card h2 { font-size: 1.3rem; color: #1e293b; margin-bottom: 12px; }
    .card h3 { font-size: 1.1rem; color: #334155; margin: 16px 0 8px; }
    .card p { color: #64748b; margin-bottom: 6px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 1.1rem; margin: 16px 0 8px; }
    .services { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 12px; }
    .service-tag { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 12px; font-size: .9rem; color: #1d4ed8; }
    footer { text-align: center; padding: 40px 0; color: #94a3b8; font-size: .9rem; margin-top: 40px; border-top: 1px solid #e2e8f0; }
    .seo-text { margin: 24px 0; }
    .seo-text h2 { font-size: 1.3rem; margin-bottom: 8px; }
    .seo-text h3 { font-size: 1.1rem; margin: 16px 0 6px; color: #334155; }
    .seo-text p { color: #64748b; font-size: .95rem; }
    .status-available { color: #166534; background: #dcfce7; padding: 4px 14px; border-radius: 20px; font-size: .85rem; display: inline-block; }
    .status-claimed { color: #92400e; background: #fef3c7; padding: 4px 14px; border-radius: 20px; font-size: .85rem; display: inline-block; }
    @media (max-width: 640px) {
      .header h1 { font-size: 1.5rem; }
      .services { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="container">
      <h1>${name}</h1>
      <p class="sub">${city || ''}${state ? `, ${state}` : ''}</p>
      ${verified ? '<span class="badge" style="background:#059669">✓ Verificado</span>' : claimed ? '<span class="badge" style="background:#d97706">⏳ Pendente</span>' : '<span class="badge">Perfil Gratuito</span>'}
      <div class="stars">${stars}</div>
      <p class="sub">${(rating || 0).toFixed(1)} de 5 (${reviewCount || 0} avaliações)</p>
    </div>
  </div>

  <main class="container">
    <!-- Address card -->
    <div class="card">
      <h2>📍 Endereço</h2>
      <p>${address || ''}</p>
      <p style="color:#94a3b8;font-size:.9rem">${neighborhood ? `${neighborhood} - ` : ''}${city || ''}${state ? `, ${state}` : ''}</p>

      <h3>Localização no mapa</h3>
      <p>Mapa interativo disponível após verificação do perfil.</p>
    </div>

    <!-- Services -->
    <div class="card">
      <h2>✂️ Serviços oferecidos</h2>
      <p>Corte masculino, degradê, barba, hot towel e muito mais.</p>
      <div class="services">
        ${services.map(s => `<div class="service-tag">${s}</div>`).join('')}
      </div>
    </div>

    <!-- Ratings breakdown -->
    <div class="card">
      <h2>⭐ Avaliações</h2>
      <p>${(rating || 0).toFixed(1)} de 5 estrelas com base em ${reviewCount || 0} avaliações de clientes.</p>
      <div style="margin-top:12px">
        ${[5,4,3,2,1].map(n => {
          const pct = n === 5 ? 60 : n === 4 ? 25 : n === 3 ? 10 : n === 2 ? 3 : 2;
          return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0;font-size:.85rem">
            <span style="width:20px">${n}★</span>
            <div style="flex:1;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:#f59e0b;border-radius:3px"></div>
            </div>
            <span style="width:36px;text-align:right;color:#94a3b8">${pct}%</span>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- SEO Content -->
    <div class="card seo-text">
      <h2>${name} — Barbearia em ${city || ''}</h2>
      <p>${name} está localizada em ${address || ''} em ${city || ''}${state ? `, ${state}` : ''}. Com ${(rating || 0).toFixed(1)} estrelas de avaliação${reviewCount > 0 ? ` (${reviewCount} avaliações)` : ''}, é uma das barbearias em destaque na região. Agende seu horário pelo Battle Barber.</p>
      
      <h3>Serviços disponíveis</h3>
      <p>Corte masculino, degradê, barba, hot towel, barboterapia, design capilar e mais.</p>
      
      ${neighborhood ? `<h3>Bairro ${neighborhood}</h3><p>Localizada no bairro ${neighborhood} em ${city || ''}${state ? `, ${state}` : ''}.</p>` : ''}
      
      <h3>Agende online</h3>
      <p>O Battle Barber conecta você aos melhores barbeiros. Agende seu horário online, veja avaliações reais e encontre o profissional ideal perto de você.</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:32px 0">
      <a href="${canonical}" class="btn">Verificar meu Perfil</a>
      <p style="color:#94a3b8;font-size:.85rem;margin-top:8px">Gratuito • 2 minutos • Sem compromisso</p>
    </div>
  </main>

  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} Battle Barber — Conectando barbeiros e clientes em todo o Brasil</p>
    </div>
  </footer>
</body>
</html>`;
}

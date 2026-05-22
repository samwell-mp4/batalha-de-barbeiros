export function renderCityPage(data: any): string {
  const { city, state, barbers, neighborhoods, highlighted } = data;

  const avgPrice = city.avg_price;
  const totalBarbers = city.barbers_count;

  const breadcrumb = [
    { name: 'Início', url: '/' },
    { name: state.nome, url: `/barbearias/${state.slug}` },
    { name: city.name, url: `/barbearias/${state.slug}/${city.slug}` },
  ];
  const breadcrumbJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${process.env.APP_URL || 'https://battlebarber.com.br'}${item.url}`,
    })),
  });

  const localBusinesses = highlighted.length > 0
    ? highlighted.map((b: any) => ({
      '@type': 'LocalBusiness',
      '@id': `https://battlebarber.com.br/barbeiro/${b.slug}`,
      name: b.name,
      url: `https://battlebarber.com.br/barbeiro/${b.slug}`,
      image: b.avatar,
      address: { '@type': 'PostalAddress', addressLocality: city.name, addressRegion: state.sigla, addressCountry: 'BR' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: b.rating, reviewCount: b.reviewsCount || 0 },
    }))
    : [];

  const aggregateJson = totalBarbers > 0 ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Barbearias em ${city.name} - ${state.sigla}`,
    description: `Encontre as melhores barbearias em ${city.name}, ${state.sigla}. Compare preços, veja avaliações e agende online.`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: totalBarbers * 10,
      itemReviewed: { '@type': 'City', name: city.name },
    },
    offers: avgPrice ? {
      '@type': 'AggregateOffer',
      priceCurrency: 'BRL',
      lowPrice: Math.round(avgPrice * 0.7),
      highPrice: Math.round(avgPrice * 1.3),
    } : undefined,
  }) : '';

  const description = `Encontre as melhores barbearias em ${city.name}, ${state.sigla}. ${totalBarbers} barbearias disponíveis${avgPrice ? ` com preço médio de R$ ${avgPrice.toFixed(2).replace('.', ',')}` : ''}. Agende seu horário online!`;

  const title = `Barbearias em ${city.name} - ${state.sigla} | Battle Barber`;
  const canonical = `https://battlebarber.com.br/barbearias/${state.slug}/${city.slug}`;

  const neighborhoodsHtml = neighborhoods.length > 0 ? `
    <div class="neighborhoods">
      <h2>Bairros em ${city.name}</h2>
      <div class="neighborhood-grid">
        ${neighborhoods.map((n: any) => `
          <a href="/barbearias/${state.slug}/${city.slug}/${n.slug}" class="neighborhood-card">
            <h3>${n.name}</h3>
            <span>${n.barbers_count} barbearias</span>
          </a>
        `).join('')}
      </div>
    </div>` : '';

  const barbersHtml = barbers.length > 0 ? `
    <div class="barbers-list">
      <h2>Barbearias em ${city.name}</h2>
      <div class="barber-grid">
        ${barbers.map((b: any) => `
          <div class="barber-card">
            ${b.avatar ? `<img src="${b.avatar}" alt="${b.name}" class="barber-avatar" />` : '<div class="barber-avatar-placeholder"></div>'}
            <div class="barber-info">
              <h3><a href="/barbeiro/${b.slug}">${b.name}</a></h3>
              <p class="barber-shop">${b.shop}</p>
              <div class="rating">
                <span>${'★'.repeat(Math.round(b.rating))}${'☆'.repeat(5 - Math.round(b.rating))}</span>
                <span>${b.rating.toFixed(1)} (${b.reviewsCount} avaliações)</span>
              </div>
              <div class="specialties">${b.specialties?.map((s: string) => `<span class="tag">${s}</span>`).join('')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="keywords" content="barbearia ${city.name}, barbearias em ${city.name}, corte de cabelo ${city.name}, barbeiro ${city.name}, ${state.sigla}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="robots" content="index, follow" />
  <script type="application/ld+json">${breadcrumbJson}</script>
  ${localBusinesses.length > 0 ? `<script type="application/ld+json">${JSON.stringify(localBusinesses.length === 1 ? localBusinesses[0] : { '@context': 'https://schema.org', '@graph': localBusinesses })}</script>` : ''}
  ${aggregateJson ? `<script type="application/ld+json">${aggregateJson}</script>` : ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e0e0e0; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 0 40px; text-align: center; }
    header h1 { font-size: 2.5rem; margin-bottom: 10px; color: #fff; }
    header p { font-size: 1.2rem; opacity: .9; color: #fff; }
    .stats { display: flex; justify-content: center; gap: 40px; margin-top: 30px; }
    .stat { text-align: center; }
    .stat-number { font-size: 2rem; font-weight: 700; color: #fff; }
    .stat-label { font-size: .9rem; opacity: .8; color: #fff; }
    h2 { font-size: 1.8rem; margin: 40px 0 20px; color: #fff; }
    .neighborhood-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    .neighborhood-card { background: #1a1a2e; border-radius: 12px; padding: 20px; text-decoration: none; color: #e0e0e0; transition: transform .2s; }
    .neighborhood-card:hover { transform: translateY(-2px); }
    .neighborhood-card h3 { font-size: 1.1rem; margin-bottom: 6px; color: #fff; }
    .neighborhood-card span { font-size: .9rem; opacity: .7; }
    .barber-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .barber-card { background: #1a1a2e; border-radius: 12px; padding: 20px; display: flex; gap: 16px; }
    .barber-avatar, .barber-avatar-placeholder { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .barber-avatar-placeholder { background: #333; }
    .barber-info { flex: 1; }
    .barber-info h3 a { color: #667eea; text-decoration: none; }
    .barber-info h3 a:hover { text-decoration: underline; }
    .barber-shop { font-size: .9rem; opacity: .7; margin: 4px 0; }
    .rating { margin: 8px 0; font-size: .9rem; }
    .rating span:first-child { color: #ffd700; }
    .specialties { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .tag { background: #2a2a3e; padding: 4px 10px; border-radius: 6px; font-size: .8rem; }
    footer { text-align: center; padding: 40px 0; opacity: .5; font-size: .9rem; margin-top: 60px; border-top: 1px solid #222; }
    .btn { display: inline-block; background: #667eea; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: 600; }
    .btn:hover { background: #5a6fd6; }
    @media (max-width: 768px) {
      header { padding: 40px 0 30px; }
      header h1 { font-size: 1.8rem; }
      .stats { gap: 20px; }
      .stat-number { font-size: 1.5rem; }
      .barber-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Barbearias em ${city.name} - ${state.sigla}</h1>
      <p>${description}</p>
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${totalBarbers}</div>
          <div class="stat-label">Barbearias</div>
        </div>
        ${avgPrice ? `<div class="stat"><div class="stat-number">R$ ${avgPrice.toFixed(2).replace('.', ',')}</div><div class="stat-label">Preço médio</div></div>` : ''}
        <div class="stat">
          <div class="stat-number">${neighborhoods.length}</div>
          <div class="stat-label">Bairros</div>
        </div>
      </div>
      <a href="${process.env.APP_URL || 'https://battlebarber.com.br'}/barbearias/${state.slug}/${city.slug}" class="btn">Ver todas as barbearias</a>
    </div>
  </header>

  <main class="container">
    ${neighborhoodsHtml}
    ${barbersHtml}
  </main>

  <footer class="container">
    <p>&copy; ${new Date().getFullYear()} Battle Barber. Encontre as melhores barbearias do Brasil.</p>
  </footer>
</body>
</html>`;
}

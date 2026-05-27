export function renderBarberPage(data: any): string {
  const { name, avatar, bio, shop, slug, rating, reviewsCount, specialties, city, state, neighborhood } = data;

  const title = `${name} - Barbeiro em ${city?.name || ''} | Battle Barber`;
  const description = bio || `Agende seu horário com ${name} na ${shop} em ${city?.name || ''}${state ? ` - ${state.sigla}` : ''}.`;
  const canonical = `https://battlebarber.com.br/barbeiro/${slug}`;

  const breadcrumb = [
    { name: 'Início', url: '/' },
    ...(city && state ? [{ name: `${city.name} - ${state.sigla}`, url: `/barbearias/${state.slug}/${city.slug}` }] : []),
    { name, url: canonical },
  ];

  const breadcrumbJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://battlebarber.com.br${item.url}`,
    })),
  });

  const localBusinessJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: shop || name,
    image: avatar,
    url: canonical,
    telephone: '',
    address: city ? {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: state?.sigla || '',
      addressCountry: 'BR',
    } : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewsCount || 0,
      bestRating: 5,
    },
    priceRange: '$$',
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description.replace(/<[^>]*>/g, '').substring(0, 160)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description.replace(/<[^>]*>/g, '').substring(0, 160)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:type" content="profile" />
  ${avatar ? `<meta property="og:image" content="${avatar}" />` : ''}
  <meta name="robots" content="index, follow" />
  <script type="application/ld+json">${breadcrumbJson}</script>
  <script type="application/ld+json">${localBusinessJson}</script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
    .profile { text-align: center; padding: 60px 0 40px; }
    .avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #2563eb; }
    h1 { font-size: 2rem; margin: 16px 0 4px; color: #1e293b; }
    .shop { font-size: 1.1rem; color: #2563eb; margin-bottom: 8px; }
    .rating { font-size: 1.2rem; color: #64748b; }
    .rating .stars { color: #f59e0b; }
    .info { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 30px 0; }
    .info h2 { font-size: 1.3rem; color: #1e293b; margin-bottom: 12px; }
    .info p { color: #64748b; }
    .specialties { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
    .tag { background: #eff6ff; color: #1d4ed8; padding: 6px 14px; border-radius: 8px; font-size: .9rem; }
    .btn { display: inline-block; background: #2563eb; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1rem; margin-top: 20px; }
    .btn:hover { background: #1d4ed8; }
    footer { text-align: center; padding: 40px 0; color: #94a3b8; font-size: .9rem; margin-top: 60px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile">
      ${avatar ? `<img src="${avatar}" alt="${name}" class="avatar" />` : ''}
      <h1>${name}</h1>
      <p class="shop">${shop}</p>
      <div class="rating">
        <span class="stars">${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}</span>
        <span>${rating.toFixed(1)} (${reviewsCount} avaliações)</span>
      </div>
      <a href="${canonical}" class="btn">Agendar horário</a>
    </div>

    <div class="info">
      <h2>Sobre</h2>
      <p>${bio || `${name} é barbeiro profissional na ${shop} em ${city?.name || ''}${state ? `, ${state.sigla}` : ''}.`}</p>
      ${specialties?.length ? `<div class="specialties">${specialties.map((s: string) => `<span class="tag">${s}</span>`).join('')}</div>` : ''}
    </div>

    ${city ? `<div class="info"><h2>Localização</h2><p>${neighborhood ? `${neighborhood.name} - ` : ''}${city.name}${state ? `, ${state.sigla}` : ''}</p></div>` : ''}
  </div>

  <footer>
    <p>&copy; ${new Date().getFullYear()} Battle Barber - Agende seu horário online</p>
  </footer>
</body>
</html>`;
}

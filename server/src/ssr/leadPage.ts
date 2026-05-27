export function renderLeadPage(data: any): string {
  const { name, address, rating, reviewCount, slug, city, state, neighborhood, claimed, verified } = data;

  const title = `${name} - ${city} | Battle Barber`;
  const description = `${name} em ${city}${state ? ` - ${state}` : ''}. Avaliação ${rating.toFixed(1)}. Verifique seu perfil gratuito no Battle Barber.`;
  const canonical = `https://battlebarber.com.br/perfil/${slug}`;

  const breadcrumb = [
    { name: 'Início', url: '/' },
    { name: `${city}`, url: `/barbearias/mg/${city?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}` },
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

  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

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
  <meta name="robots" content="index, follow" />
  <script type="application/ld+json">${breadcrumbJson}</script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; padding: 60px 0 40px; text-align: center; }
    .header h1 { font-size: 2rem; margin-bottom: 8px; }
    .header .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 16px; border-radius: 20px; font-size: .85rem; margin-top: 12px; }
    .profile { background: #fff; border-radius: 16px; padding: 40px; margin-top: -20px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); text-align: center; }
    .stars { font-size: 1.5rem; color: #f59e0b; margin: 12px 0; }
    .rating-text { font-size: 1.1rem; color: #64748b; }
    .info { background: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: left; }
    .info h2 { font-size: 1.1rem; color: #2563eb; margin-bottom: 8px; }
    .info p { color: #475569; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 1.1rem; margin-top: 16px; transition: transform .2s; }
    .btn:hover { transform: scale(1.02); }
    .btn:active { transform: scale(.98); }
    .status { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: .85rem; font-weight: 600; }
    .status-available { background: #dcfce7; color: #166534; }
    .status-claimed { background: #fef3c7; color: #92400e; }
    .status-verified { background: #dbeafe; color: #1e40af; }
    footer { text-align: center; padding: 40px 0; color: #94a3b8; font-size: .9rem; margin-top: 40px; border-top: 1px solid #e2e8f0; }
    .address { display: flex; align-items: center; gap: 8px; justify-content: center; color: #64748b; margin: 16px 0; }
    .address svg { width: 18px; height: 18px; flex-shrink: 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="container">
      <h1>${name}</h1>
      ${claimed ? (verified ? '<span class="status status-verified">✓ Verificado</span>' : '<span class="status status-claimed">⏳ Pendente</span>') : '<span class="badge">Perfil Gratuito</span>'}
      <div class="stars">${stars}</div>
      <div class="rating-text">${rating.toFixed(1)} (${reviewCount} avaliações)</div>
    </div>
  </div>

  <div class="container">
    <div class="profile">
      <div class="address">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        <span>${address}</span>
      </div>

      <div class="info">
        <h2>📍 Localização</h2>
        <p>${neighborhood ? `${neighborhood} - ` : ''}${city}${state ? `, ${state}` : ''}</p>
      </div>

      <a href="${canonical}" class="btn">Verificar meu Perfil</a>
      <p style="margin-top:12px;color:#94a3b8;font-size:.85rem;">Gratuito • 2 minutos • Sem compromisso</p>
    </div>
  </div>

  <footer>
    <p>&copy; ${new Date().getFullYear()} Battle Barber - Conectando barbeiros e clientes</p>
  </footer>
</body>
</html>`;
}

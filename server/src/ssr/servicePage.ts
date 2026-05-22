export function renderServiceCityPage(data: any): string {
  const { service, serviceLabel, city, state, barbers } = data;

  const title = `${serviceLabel} em ${city.name} - ${state.sigla} | Battle Barber`;
  const description = `Encontre os melhores profissionais de ${serviceLabel.toLowerCase()} em ${city.name}, ${state.sigla}. ${barbers.length} barbeiros disponíveis. Agende online!`;
  const canonical = `https://battlebarber.com.br/servicos/${service}/${state.slug}/${city.slug}`;

  const breadcrumbJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://battlebarber.com.br/' },
      { '@type': 'ListItem', position: 2, name: serviceLabel, item: `https://battlebarber.com.br/servicos/${service}` },
      { '@type': 'ListItem', position: 3, name: `${serviceLabel} em ${city.name}`, item: canonical },
    ],
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="index, follow" />
  <script type="application/ld+json">${breadcrumbJson}</script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e0e0e0; line-height: 1.6; }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 0 40px; text-align: center; }
    header h1 { font-size: 2rem; margin-bottom: 10px; color: #fff; }
    header p { color: rgba(255,255,255,.9); }
    .barber-list { display: flex; flex-direction: column; gap: 16px; margin: 40px 0; }
    .barber-card { background: #1a1a2e; border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: center; }
    .barber-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }
    .barber-card h3 a { color: #667eea; text-decoration: none; }
    h2 { color: #fff; margin: 40px 0 20px; }
    .btn { display: inline-block; background: #667eea; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: 600; }
    footer { text-align: center; padding: 40px 0; opacity: .5; margin-top: 60px; border-top: 1px solid #222; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${serviceLabel} em ${city.name} - ${state.sigla}</h1>
      <p>${description}</p>
      <a href="${canonical}" class="btn">Agendar ${serviceLabel.toLowerCase()}</a>
    </div>
  </header>

  <main class="container">
    <h2>Profissionais disponíveis (${barbers.length})</h2>
    <div class="barber-list">
      ${barbers.length > 0 ? barbers.map((b: any) => `
        <div class="barber-card">
          ${b.avatar ? `<img src="${b.avatar}" alt="${b.name}" class="barber-avatar" />` : ''}
          <div>
            <h3><a href="/barbeiro/${b.slug}">${b.name}</a></h3>
            <p>${b.shop}</p>
            <p>${'★'.repeat(Math.round(b.rating))}${'☆'.repeat(5 - Math.round(b.rating))} ${b.rating.toFixed(1)}</p>
          </div>
        </div>
      `).join('') : '<p>Nenhum profissional encontrado para este serviço nesta cidade.</p>'}
    </div>
  </main>

  <footer class="container">
    <p>&copy; ${new Date().getFullYear()} Battle Barber</p>
  </footer>
</body>
</html>`;
}

export function renderStatePage(data: any): string {
  const { state, cities } = data;
  const title = `Barbearias em ${state.nome} | Battle Barber`;
  const description = `Encontre barbearias e barbeiros em ${state.nome}. Explore cidades e serviços e agende online.`;
  const canonical = `https://battlebarber.com.br/barbearias/${state.slug}`;

  const breadcrumbJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://battlebarber.com.br/' },
      { '@type': 'ListItem', position: 2, name: state.nome, item: canonical },
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
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="robots" content="index, follow" />
  <script type="application/ld+json">${breadcrumbJson}</script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; }
    header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 56px 0 36px; text-align: center; }
    header h1 { color: #fff; font-size: 2rem; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin: 28px 0 40px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; }
    .card a { color: #2563eb; text-decoration: none; font-weight: 600; }
    .card a:hover { text-decoration: underline; }
    footer { text-align: center; padding: 36px 0; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
  </head>
  <body>
    <header>
      <div class="container">
        <h1>Barbearias em ${state.nome}</h1>
      </div>
    </header>
    <main class="container">
      <div class="grid">
        ${cities.map((c: any) => `<div class=\"card\"><a href=\"/barbearias/${state.slug}/${c.slug}\">${c.nome}</a></div>`).join('')}
      </div>
    </main>
    <footer class="container">© ${new Date().getFullYear()} Battle Barber</footer>
  </body>
 </html>`;
}

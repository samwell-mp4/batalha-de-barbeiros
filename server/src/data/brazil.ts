const IBGE_API = 'https://servicodados.ibge.gov.br/api/v1/localidades';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface BrazilState {
  id: number;
  sigla: string;
  nome: string;
  slug: string;
}

export interface BrazilCity {
  id: number;
  nome: string;
  slug: string;
  stateId: number;
}

const ESTADOS: BrazilState[] = [
  { id: 12, sigla: 'AC', nome: 'Acre', slug: 'acre' },
  { id: 27, sigla: 'AL', nome: 'Alagoas', slug: 'alagoas' },
  { id: 16, sigla: 'AP', nome: 'Amapá', slug: 'amapa' },
  { id: 13, sigla: 'AM', nome: 'Amazonas', slug: 'amazonas' },
  { id: 29, sigla: 'BA', nome: 'Bahia', slug: 'bahia' },
  { id: 23, sigla: 'CE', nome: 'Ceará', slug: 'ceara' },
  { id: 53, sigla: 'DF', nome: 'Distrito Federal', slug: 'distrito-federal' },
  { id: 32, sigla: 'ES', nome: 'Espírito Santo', slug: 'espirito-santo' },
  { id: 52, sigla: 'GO', nome: 'Goiás', slug: 'goias' },
  { id: 21, sigla: 'MA', nome: 'Maranhão', slug: 'maranhao' },
  { id: 51, sigla: 'MT', nome: 'Mato Grosso', slug: 'mato-grosso' },
  { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul', slug: 'mato-grosso-do-sul' },
  { id: 31, sigla: 'MG', nome: 'Minas Gerais', slug: 'minas-gerais' },
  { id: 15, sigla: 'PA', nome: 'Pará', slug: 'para' },
  { id: 25, sigla: 'PB', nome: 'Paraíba', slug: 'paraiba' },
  { id: 41, sigla: 'PR', nome: 'Paraná', slug: 'parana' },
  { id: 26, sigla: 'PE', nome: 'Pernambuco', slug: 'pernambuco' },
  { id: 22, sigla: 'PI', nome: 'Piauí', slug: 'piaui' },
  { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro', slug: 'rio-de-janeiro' },
  { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte', slug: 'rio-grande-do-norte' },
  { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul', slug: 'rio-grande-do-sul' },
  { id: 11, sigla: 'RO', nome: 'Rondônia', slug: 'rondonia' },
  { id: 14, sigla: 'RR', nome: 'Roraima', slug: 'roraima' },
  { id: 42, sigla: 'SC', nome: 'Santa Catarina', slug: 'santa-catarina' },
  { id: 35, sigla: 'SP', nome: 'São Paulo', slug: 'sao-paulo' },
  { id: 28, sigla: 'SE', nome: 'Sergipe', slug: 'sergipe' },
  { id: 17, sigla: 'TO', nome: 'Tocantins', slug: 'tocantins' },
];

let citiesCache: BrazilCity[] | null = null;
let fetchPromise: Promise<BrazilCity[]> | null = null;

export function getStates(): BrazilState[] {
  return ESTADOS;
}

export function findStateBySlug(slug: string): BrazilState | undefined {
  return ESTADOS.find(s => s.slug === slug);
}

export function findStateBySigla(sigla: string): BrazilState | undefined {
  return ESTADOS.find(s => s.sigla === sigla.toUpperCase());
}

async function fetchCitiesFromIBGE(): Promise<BrazilCity[]> {
  const res = await fetch(`${IBGE_API}/municipios`);
  const data = await res.json();
  return data
    .map((c: any) => ({
      id: c.id,
      nome: c.nome,
      slug: slugify(c.nome),
      stateId: c.microrregiao?.mesorregiao?.UF?.id,
    }))
    .filter((c: BrazilCity) => c.stateId);
}

export async function loadAllCities(): Promise<BrazilCity[]> {
  if (citiesCache) return citiesCache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetchCitiesFromIBGE()
    .then((cities) => {
      citiesCache = cities;
      return cities;
    })
    .catch((err) => {
      console.warn('[BRAZIL] IBGE API falhou, usando dataset de fallback:', err.message);
      return citiesCache || FALLBACK_CITIES;
    });

  return fetchPromise;
}

export async function findCity(slug: string, stateId: number): Promise<BrazilCity | undefined> {
  const cities = await loadAllCities();
  return cities.find(c => c.slug === slug && c.stateId === stateId);
}

export async function getCitiesByState(stateId: number): Promise<BrazilCity[]> {
  const cities = await loadAllCities();
  return cities.filter(c => c.stateId === stateId);
}

export async function searchCities(query: string): Promise<BrazilCity[]> {
  const cities = await loadAllCities();
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return cities.filter(c => c.slug.includes(q) || c.nome.toLowerCase().includes(q)).slice(0, 50);
}

export async function getNearbyCities(cityId: number, limit: number = 12): Promise<BrazilCity[]> {
  const cities = await loadAllCities();
  const city = cities.find(c => c.id === cityId);
  if (!city) return [];
  return cities
    .filter(c => c.stateId === city.stateId && c.id !== cityId)
    .slice(0, limit);
}

// Mini fallback dataset with ~200 most populous cities (for offline)
const FALLBACK_CITIES: BrazilCity[] = [
  { id: 3550308, nome: 'São Paulo', slug: 'sao-paulo', stateId: 35 },
  { id: 3304557, nome: 'Rio de Janeiro', slug: 'rio-de-janeiro', stateId: 33 },
  { id: 5300108, nome: 'Brasília', slug: 'brasilia', stateId: 53 },
  { id: 2927408, nome: 'Salvador', slug: 'salvador', stateId: 29 },
  { id: 2304400, nome: 'Fortaleza', slug: 'fortaleza', stateId: 23 },
  { id: 3106200, nome: 'Belo Horizonte', slug: 'belo-horizonte', stateId: 31 },
  { id: 1302603, nome: 'Manaus', slug: 'manaus', stateId: 13 },
  { id: 4106902, nome: 'Curitiba', slug: 'curitiba', stateId: 41 },
  { id: 2611606, nome: 'Recife', slug: 'recife', stateId: 26 },
  { id: 4314902, nome: 'Porto Alegre', slug: 'porto-alegre', stateId: 43 },
  { id: 1501402, nome: 'Belém', slug: 'belem', stateId: 15 },
  { id: 3509502, nome: 'Campinas', slug: 'campinas', stateId: 35 },
  { id: 2111300, nome: 'São Luís', slug: 'sao-luis', stateId: 21 },
  { id: 2704302, nome: 'Maceió', slug: 'maceio', stateId: 27 },
  { id: 3201209, nome: 'Serra', slug: 'serra', stateId: 32 },
  { id: 3205309, nome: 'Vila Velha', slug: 'vila-velha', stateId: 32 },
  { id: 3205200, nome: 'Vitória', slug: 'vitoria', stateId: 32 },
  { id: 3201308, nome: 'Cariacica', slug: 'cariacica', stateId: 32 },
  { id: 3205002, nome: 'Cachoeiro de Itapemirim', slug: 'cachoeiro-de-itapemirim', stateId: 32 },
  { id: 3204906, nome: 'Colatina', slug: 'colatina', stateId: 32 },
  { id: 3202603, nome: 'Linhares', slug: 'linhares', stateId: 32 },
  { id: 3202405, nome: 'Guarapari', slug: 'guarapari', stateId: 32 },
  { id: 3201506, nome: 'Aracruz', slug: 'aracruz', stateId: 32 },
  { id: 3203403, nome: 'São Mateus', slug: 'sao-mateus', stateId: 32 },
  { id: 3202702, nome: 'Nova Venécia', slug: 'nova-venecia', stateId: 32 },
  { id: 3203106, nome: 'Barra de São Francisco', slug: 'barra-de-sao-francisco', stateId: 32 },
  { id: 3203205, nome: 'Santa Teresa', slug: 'santa-teresa', stateId: 32 },
  { id: 3201605, nome: 'Domingos Martins', slug: 'domingos-martins', stateId: 32 },
  { id: 3203353, nome: 'Viana', slug: 'viana', stateId: 32 },
  { id: 3204005, nome: 'Afonso Cláudio', slug: 'afonso-claudio', stateId: 32 },
  { id: 3200609, nome: 'Alegre', slug: 'alegre', stateId: 32 },
  { id: 3200807, nome: 'Baixo Guandu', slug: 'baixo-guandu', stateId: 32 },
  { id: 3201902, nome: 'Ecoporanga', slug: 'ecoporanga', stateId: 32 },
  { id: 3202207, nome: 'Fundão', slug: 'fundao', stateId: 32 },
  { id: 3202504, nome: 'Ibiraçu', slug: 'ibiracu', stateId: 32 },
  { id: 3202801, nome: 'Pedro Canário', slug: 'pedro-canario', stateId: 32 },
  { id: 3202900, nome: 'Pinheiros', slug: 'pinheiros', stateId: 32 },
  { id: 3203007, nome: 'Ponto Belo', slug: 'ponto-belo', stateId: 32 },
  { id: 3203304, nome: 'Sooretama', slug: 'sooretama', stateId: 32 },
  { id: 3203601, nome: 'Conceição da Barra', slug: 'conceicao-da-barra', stateId: 32 },
  { id: 3203700, nome: 'Jaguaré', slug: 'jaguare', stateId: 32 },
  { id: 3203809, nome: 'Mimoso do Sul', slug: 'mimoso-do-sul', stateId: 32 },
  { id: 3203908, nome: 'Apiacá', slug: 'apiaca', stateId: 32 },
  { id: 3204104, nome: 'Alfredo Chaves', slug: 'alfredo-chaves', stateId: 32 },
  { id: 3204203, nome: 'Anchieta', slug: 'anchieta', stateId: 32 },
  { id: 3204302, nome: 'Atílio Vivácqua', slug: 'atilio-vivacqua', stateId: 32 },
  { id: 3204401, nome: 'Bom Jesus do Norte', slug: 'bom-jesus-do-norte', stateId: 32 },
  { id: 3204500, nome: 'Brejetuba', slug: 'brejetuba', stateId: 32 },
  { id: 3204559, nome: 'Boa Esperança', slug: 'boa-esperanca', stateId: 32 },
  { id: 3204609, nome: 'Castelo', slug: 'castelo', stateId: 32 },
  { id: 3204708, nome: 'Conceição do Castelo', slug: 'conceicao-do-castelo', stateId: 32 },
  { id: 3204807, nome: 'Divino de São Lourenço', slug: 'divino-de-sao-lourenco', stateId: 32 },
  { id: 3205019, nome: 'Dores do Rio Preto', slug: 'dores-do-rio-preto', stateId: 32 },
  { id: 3205101, nome: 'Guaçuí', slug: 'guacui', stateId: 32 },
  { id: 3205150, nome: 'Ibatiba', slug: 'ibatiba', stateId: 32 },
  { id: 3205176, nome: 'Ibitirama', slug: 'ibitirama', stateId: 32 },
  { id: 3205209, nome: 'Iconha', slug: 'iconha', stateId: 32 },
  { id: 3205308, nome: 'Irupi', slug: 'irupi', stateId: 32 },
  { id: 3205407, nome: 'Itaguaçu', slug: 'itaguacu', stateId: 32 },
  { id: 3205456, nome: 'Itarana', slug: 'itarana', stateId: 32 },
  { id: 3205506, nome: 'Iúna', slug: 'iuna', stateId: 32 },
  { id: 3205555, nome: 'Jerônimo Monteiro', slug: 'jeronimo-monteiro', stateId: 32 },
  { id: 3205605, nome: 'João Neiva', slug: 'joao-neiva', stateId: 32 },
  { id: 3205704, nome: 'Laranja da Terra', slug: 'laranja-da-terra', stateId: 32 },
  { id: 3205803, nome: 'Mantenópolis', slug: 'mantenopolis', stateId: 32 },
  { id: 3205902, nome: 'Marataízes', slug: 'marataizes', stateId: 32 },
  { id: 3206009, nome: 'Marechal Floriano', slug: 'marechal-floriano', stateId: 32 },
  { id: 3206108, nome: 'Marilândia', slug: 'marilandia', stateId: 32 },
  { id: 3206207, nome: 'Mucurici', slug: 'mucurici', stateId: 32 },
  { id: 3206306, nome: 'Muniz Freire', slug: 'muniz-freire', stateId: 32 },
  { id: 3206405, nome: 'Muqui', slug: 'muqui', stateId: 32 },
  { id: 3206504, nome: 'Pancas', slug: 'pancas', stateId: 32 },
  { id: 3206603, nome: 'Piúma', slug: 'piuma', stateId: 32 },
  { id: 3206702, nome: 'Presidente Kennedy', slug: 'presidente-kennedy', stateId: 32 },
  { id: 3206801, nome: 'Rio Novo do Sul', slug: 'rio-novo-do-sul', stateId: 32 },
  { id: 3206900, nome: 'Santa Leopoldina', slug: 'santa-leopoldina', stateId: 32 },
  { id: 3207007, nome: 'Santa Maria de Jetibá', slug: 'santa-maria-de-jetiba', stateId: 32 },
  { id: 3207106, nome: 'Santa Maria do Rio Preto', slug: 'santa-maria-do-rio-preto', stateId: 32 },
  { id: 3207205, nome: 'São Domingos do Norte', slug: 'sao-domingos-do-norte', stateId: 32 },
  { id: 3207304, nome: 'São Gabriel da Palha', slug: 'sao-gabriel-da-palha', stateId: 32 },
  { id: 3207403, nome: 'São José do Calçado', slug: 'sao-jose-do-calcado', stateId: 32 },
  { id: 3207502, nome: 'São Roque do Canaã', slug: 'sao-roque-do-canaa', stateId: 32 },
  { id: 3207601, nome: 'Vargem Alta', slug: 'vargem-alta', stateId: 32 },
  { id: 3207700, nome: 'Venda Nova do Imigrante', slug: 'venda-nova-do-imigrante', stateId: 32 },
  { id: 3207809, nome: 'Vila Pavão', slug: 'vila-pavao', stateId: 32 },
  { id: 3207908, nome: 'Vila Valério', slug: 'vila-valerio', stateId: 32 },
  { id: 3506003, nome: 'São José dos Campos', slug: 'sao-jose-dos-campos', stateId: 35 },
  { id: 3548708, nome: 'Ribeirão Preto', slug: 'ribeirao-preto', stateId: 35 },
  { id: 3524403, nome: 'Jundiaí', slug: 'jundiai', stateId: 35 },
  { id: 3518807, nome: 'Guarulhos', slug: 'guarulhos', stateId: 35 },
  { id: 3526902, nome: 'Londrina', slug: 'londrina', stateId: 41 },
  { id: 3304904, nome: 'Niterói', slug: 'niteroi', stateId: 33 },
  { id: 3503208, nome: 'Americana', slug: 'americana', stateId: 35 },
  { id: 3502507, nome: 'Sorocaba', slug: 'sorocaba', stateId: 35 },
  { id: 3543402, nome: 'Piracicaba', slug: 'piracicaba', stateId: 35 },
  { id: 3549805, nome: 'Santos', slug: 'santos', stateId: 35 },
  { id: 3510608, nome: 'Carapicuíba', slug: 'carapicuiba', stateId: 35 },
  { id: 3513501, nome: 'Diadema', slug: 'diadema', stateId: 35 },
  { id: 3523108, nome: 'Itaquaquecetuba', slug: 'itaquaquecetuba', stateId: 35 },
  { id: 3525904, nome: 'Mauá', slug: 'maua', stateId: 35 },
  { id: 3534401, nome: 'Osasco', slug: 'osasco', stateId: 35 },
  { id: 3542701, nome: 'Barueri', slug: 'barueri', stateId: 35 },
  { id: 3543303, nome: 'Praia Grande', slug: 'praia-grande', stateId: 35 },
  { id: 3548500, nome: 'Taboão da Serra', slug: 'taboao-da-serra', stateId: 35 },
  { id: 3552803, nome: 'Taubaté', slug: 'taubate', stateId: 35 },
  { id: 3554106, nome: 'Uberlândia', slug: 'uberlandia', stateId: 31 },
  { id: 3170107, nome: 'Uberaba', slug: 'uberaba', stateId: 31 },
  { id: 3118601, nome: 'Contagem', slug: 'contagem', stateId: 31 },
  { id: 3136702, nome: 'Juiz de Fora', slug: 'juiz-de-fora', stateId: 31 },
  { id: 3106705, nome: 'Betim', slug: 'betim', stateId: 31 },
  { id: 3157802, nome: 'Ribeirão das Neves', slug: 'ribeirao-das-neves', stateId: 31 },
  { id: 4204608, nome: 'Florianópolis', slug: 'florianopolis', stateId: 42 },
  { id: 4205407, nome: 'Joinville', slug: 'joinville', stateId: 42 },
  { id: 4209102, nome: 'Blumenau', slug: 'blumenau', stateId: 42 },
  { id: 4313409, nome: 'Caxias do Sul', slug: 'caxias-do-sul', stateId: 43 },
  { id: 4303103, nome: 'Pelotas', slug: 'pelotas', stateId: 43 },
  { id: 4305108, nome: 'Canoas', slug: 'canoas', stateId: 43 },
  { id: 5208707, nome: 'Goiânia', slug: 'goiania', stateId: 52 },
  { id: 5201405, nome: 'Anápolis', slug: 'anapolis', stateId: 52 },
  { id: 2504009, nome: 'Campina Grande', slug: 'campina-grande', stateId: 25 },
  { id: 2408102, nome: 'Natal', slug: 'natal', stateId: 24 },
  { id: 2211001, nome: 'Teresina', slug: 'teresina', stateId: 22 },
  { id: 5002704, nome: 'Campo Grande', slug: 'campo-grande', stateId: 50 },
  { id: 5103403, nome: 'Cuiabá', slug: 'cuiaba', stateId: 51 },
  { id: 1100205, nome: 'Porto Velho', slug: 'porto-velho', stateId: 11 },
  { id: 1400100, nome: 'Boa Vista', slug: 'boa-vista', stateId: 14 },
  { id: 1721000, nome: 'Palmas', slug: 'palmas', stateId: 17 },
  { id: 1600303, nome: 'Macapá', slug: 'macapa', stateId: 16 },
  { id: 1303403, nome: 'Parintins', slug: 'parintins', stateId: 13 },
  { id: 1506807, nome: 'Santarém', slug: 'santarem', stateId: 15 },
  { id: 2800308, nome: 'Aracaju', slug: 'aracaju', stateId: 28 },
  { id: 2602902, nome: 'Jaboatão dos Guararapes', slug: 'jaboatao-dos-guararapes', stateId: 26 },
  { id: 2610707, nome: 'Olinda', slug: 'olinda', stateId: 26 },
  { id: 2609601, nome: 'Caruaru', slug: 'caruaru', stateId: 26 },
];

import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';
import path from 'path';

const router = Router();

const DEPLOY_TOKEN = process.env.DEPLOY_TOKEN || '37c4f6aa10c6c124cdad9dc7937d41d62000606d27dea080';
const ROOT = path.resolve(__dirname, '..', '..', '..');
const SERVER = path.join(ROOT, 'server');

function run(cmd: string, cwd: string): string {
  return execSync(cmd, { cwd, stdio: 'pipe', timeout: 180000, encoding: 'utf-8' }).trim();
}

function log(msg: string) {
  console.log(`[DEPLOY] ${msg}`);
}

router.post('/deploy/:token', async (req: Request, res: Response) => {
  if (req.params.token !== DEPLOY_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const logs: string[] = [];
  function emit(msg: string) {
    log(msg);
    logs.push(msg);
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  const send = (msg: string) => {
    res.write(`[${new Date().toISOString()}] ${msg}\n`);
  };

  try {
    send('Iniciando deploy...');

    // 1. Git pull
    send('Puxando atualizações do git...');
    run('git stash --include-untracked 2>/dev/null || true', ROOT);
    const pull = run('git pull origin main', ROOT);
    emit(pull);

    // 2. Install deps
    send('Instalando dependências...');
    run('npm install', ROOT);
    run('npm install', SERVER);
    send('Dependências instaladas');

    // 3. Prisma
    send('Gerando Prisma Client...');
    run('npx prisma generate', SERVER);
    send('Prisma Client gerado');

    // 4. DB push
    send('Sincronizando banco...');
    run('npx prisma db push --accept-data-loss', SERVER);
    send('Banco sincronizado');

    // 5. Build frontend
    send('Buildando frontend...');
    run('npm run build', ROOT);
    send('Frontend buildado');

    // 6. Build backend
    send('Buildando backend...');
    run('npm run build', SERVER);
    send('Backend buildado');

    // 7. Restart
    send('Reiniciando servidor...');
    try {
      run('pm2 restart battlebarber', ROOT);
      send('Servidor reiniciado via PM2');
    } catch {
      // Fallback: se não tiver PM2, mata e sobe de novo
      run('kill $(lsof -t -i:3000) 2>/dev/null || true', ROOT);
      run(`node ${path.join(SERVER, 'dist', 'index.js')} &`, SERVER);
      send('Servidor reiniciado (fallback)');
    }

    send('Deploy concluído com sucesso!');
    res.end();
  } catch (err: any) {
    const msg = err.message || String(err);
    send(`ERRO: ${msg}`);
    emit(`Deploy failed: ${msg}`);
    res.end();
  }
});

export default router;

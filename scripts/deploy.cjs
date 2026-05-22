const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SERVER = path.join(ROOT, 'server');

function run(cmd, opts = {}) {
  const cwd = opts.cwd || ROOT;
  console.log(`\n> [${path.relative(ROOT, cwd)}] ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', ...opts });
}

console.log('=== Battle Barber Deploy ===\n');

const phases = {
  install() {
    console.log('--- 1/6 Instalando dependências ---');
    run('npm install');
    run('npm install', { cwd: SERVER });
  },
  prisma() {
    console.log('--- 2/6 Gerando Prisma Client ---');
    run('npx prisma generate', { cwd: SERVER });
  },
  db() {
    console.log('--- 3/6 Sincronizando banco ---');
    run('npx prisma db push --accept-data-loss', { cwd: SERVER });
  },
  frontend() {
    console.log('--- 4/6 Build Frontend ---');
    run('npm run build');
  },
  backend() {
    console.log('--- 5/6 Build Backend ---');
    run('npm run build', { cwd: SERVER });
  },
  restart() {
    console.log('--- 6/6 Reiniciando servidor ---');
    const pm2Name = 'battlebarber';
    try {
      execSync(`pm2 show ${pm2Name}`, { stdio: 'ignore' });
      run(`pm2 restart ${pm2Name}`);
      console.log(`PM2 process "${pm2Name}" reiniciado`);
    } catch {
      run(`pm2 start "${path.join(SERVER, 'dist', 'index.js')}" --name ${pm2Name} --cwd "${SERVER}"`, { cwd: SERVER });
      console.log(`PM2 process "${pm2Name}" criado e iniciado`);
    }
  },
};

const steps = process.argv.includes('--skip-install')
  ? ['prisma', 'db', 'frontend', 'backend', 'restart']
  : ['install', 'prisma', 'db', 'frontend', 'backend', 'restart'];

for (const step of steps) {
  phases[step]();
}

console.log('\n=== Deploy concluído ===');

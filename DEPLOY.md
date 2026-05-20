# Deploy Automático - Battle Barber

## Como usar

Sempre que quiser fazer deploy, rode apenas:

```powershell
.\deploy.ps1
```

O script vai executar automaticamente:

1. `npm run build` — compila o frontend
2. `git add .` — adiciona todos os arquivos
3. `git commit -m "Colocar a versao"` — cria o commit
4. `git push origin main` — envia para o GitHub
5. `http://72.62.138.244:3000/api/deploy/37c4f6aa10c6c124cdad9dc7937d41d62000606d27dea080` — aciona o deploy no servidor

## Requisitos

- PowerShell (Windows)
- Node.js / npm
- Git configurado com acesso ao GitHub

## Troubleshooting

Se o push falhar por arquivo grande, rode manualmente e me chame.

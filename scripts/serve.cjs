/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node launcher, intentionally CommonJS. */
// Serves only the compiled app on loopback. No npm packages required.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..', 'out');
const port = Number(process.env.PAUTA_PORT || 4317);
const url = `http://localhost:${port}`;
const health = 'Pauta-local-0.2.0';
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2','.svg':'image/svg+xml','.ico':'image/x-icon','.png':'image/png' };
function open() { if (process.argv.includes('--open') && process.platform === 'win32') spawn('cmd.exe', ['/c','start','',url], { windowsHide: true, stdio: 'ignore' }); }
if (!fs.existsSync(path.join(root, 'index.html'))) { console.error('Pasta out nao encontrada. Extraia o ZIP completo ou execute npm run build.'); process.exit(1); }
const server = http.createServer((req,res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); } catch { res.writeHead(400); res.end(); return; }
  if (pathname === '/pauta-health') { res.end(health); return; }
  if (pathname.includes('\0')) { res.writeHead(400); res.end(); return; }
  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
    const data = fs.readFileSync(file);
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-cache'});
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); res.end('Arquivo não encontrado.'); }
});
server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    http.get(url + '/pauta-health', r => { let body=''; r.on('data', c => body += c); r.on('end', () => { if (body === health) { console.log('Pauta ja esta aberto: '+url); open(); } else { console.error('A porta 4317 esta ocupada por outro programa. Feche a versao anterior do Pauta e tente novamente.'); process.exitCode=1; } }); }).on('error', () => { console.error(err.message); process.exitCode=1; });
  } else { console.error(err.message); process.exitCode=1; }
});
server.listen(port,'127.0.0.1', () => { console.log('\nPAUTA pronto: '+url+'\nMantenha esta janela aberta. Para encerrar: Ctrl+C.\n'); open(); });

const http = require('http');
const httpProxy = require('http-proxy');

// Cria proxy que encaminha /linhas, /pontos para a API real
const proxy = httpProxy.createProxyServer({
  target: 'http://192.168.2.115:8000',
  changeOrigin: true,
  logLevel: 'debug',
});

const server = http.createServer((req, res) => {
  // Adiciona CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  proxy.web(req, res);
});

const PORT = 8090;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy CORS rodando em http://0.0.0.0:${PORT} -> http://192.168.2.115:8000`);
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Proxy error', detail: err.message }));
});

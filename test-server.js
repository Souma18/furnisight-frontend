const http = require('http');
http.createServer((req, res) => {
  console.log(req.url);
  res.end('OK');
}).listen(8081);

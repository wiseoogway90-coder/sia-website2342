const http = require('http');
http.get('http://localhost:3000', (res) => {
  console.log('STATUS', res.statusCode);
  let s = '';
  res.on('data', (c) => s += c.toString());
  res.on('end', () => {
    console.log('---BEGIN---');
    console.log(s.slice(0, 5000));
    console.log('---END---');
  });
}).on('error', (e) => {
  console.error('ERR', e.message);
  process.exit(1);
});

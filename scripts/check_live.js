const http = require('http');
http.get('http://localhost:3000', (res) => {
  console.log('STATUS', res.statusCode);
  let s = '';
  res.on('data', (c) => s += c.toString());
  res.on('end', () => {
    const m = s.match(/href=\"\/_next\/static\/css\/[^\"]+\"/);
    console.log(m ? m[0] : 'CSS_NOT_FOUND');
  });
}).on('error', (e) => {
  console.error('ERR', e.message);
  process.exit(1);
});

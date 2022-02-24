import Http from 'http';

Http.createServer((req, res) => {
    console.log('server receive');
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Test', 'test');
    res.writeHead(200);
    res.end('request success');
}).listen(8088);

console.log('run server');

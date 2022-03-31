import Http from 'http';
import fs from 'fs';

const text = fs.readFileSync(`${__dirname}/test.html`);

const server = Http.createServer((_, res) => {
    console.log('server receive');
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Test', 'test');
    res.writeHead(200);
    res.end(text);
});

server.listen(8088);

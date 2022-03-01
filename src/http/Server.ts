import Http from 'http';

const CUSTOM_HTML = `<html ma=a>
<head>
    <style>
body div #myid{
    width:100px;
    background-color: #ff5000;
}
body div img{
    width:30px;
    background-color: #ff1111;
}
    </style>
</head>
<body>
    <div>
        <img id="myid"/>
        <img />
    </div>
</body>
</html>`;

Http.createServer((_, res) => {
    console.log('server receive');
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Test', 'test');
    res.writeHead(200);
    res.end(CUSTOM_HTML);
}).listen(8088);

console.log('run server');

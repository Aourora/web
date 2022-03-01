import { parserHTML } from '../parser/ParserHTML';
import { Request } from './Request';

const requeset = new Request({
    method: 'GET',
    host: '127.0.0.1',
    port: 8088,
    path: '/',
});

async function test() {
    const response = await requeset.send();
    const dom = parserHTML(response.body);
    console.log(JSON.stringify(dom, null, '   '));
}
test();

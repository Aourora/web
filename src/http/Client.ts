import { Request } from './Request';

const requeset = new Request({ host: '127.0.0.1', port: 8088, method: 'GET' });

async function test() {
    const response = await requeset.send();
    console.log(response);
}
test();

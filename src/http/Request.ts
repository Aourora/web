import Net from 'net';
import { ResponseData, ResponseParser } from './Response';

interface Options {
    method?: 'GET' | 'POST' | 'OPTIONS' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH';
    host: string;
    port?: number;
    path?: string;
    body?: { [key: string]: any };
    headers?: { [key: string]: any };
}

export class Request {
    protected method: string;
    protected host: string;
    protected port: number;
    protected path: string;
    protected body: { [key: string]: any };
    protected headers: { [key: string]: any };
    protected bodyText!: string;

    constructor(options: Options) {
        this.method = options.method || 'GET';
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {};
        this.headers = options.headers || {};
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        } else if (
            this.headers['Content-Type'] === 'application/x-www-form-urlencoded'
        ) {
            this.bodyText = Object.keys(this.body)
                .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
                .join('$$');
        }

        this.headers['Content-Length'] = this.bodyText.length;
    }

    public toString(): string {
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers)
    .map((key) => `${key}: ${this.headers[key]}`)
    .join('\r\n')}
\r
${this.bodyText}`;
    }

    public send(connection?: Net.Socket): Promise<ResponseData> {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser();
            if (connection) {
                connection.write(this.toString());
            } else {
                connection = Net.createConnection(
                    {
                        host: this.host,
                        port: this.port,
                    },
                    () => {
                        connection!.write(this.toString());
                    }
                );
            }

            connection.on('data', (data) => {
                // resolve(data.toString());
                parser.receive(data.toString());
                if (parser.isFinished) {
                    resolve(parser.response);
                    connection!.end();
                }
            });

            connection.on('error', (err) => {
                reject(err);
                connection!.end();
            });
        });
    }
}

const PARSE_STATUS = {
    WAITING_STATUS_LINE: 0,
    WAITING_STATUS_LINE_END: 1,
    WAITING_HEADER_NAME: 2,
    WAITING_HEADER_SPACE: 3,
    WAITING_HEADER_VALUE: 4,
    // WAITING_HEADER_LINE_END: 5,
    WAITING_HEADER_BLOCK_END: 6,
    WAITING_BODY: 7,
    WAITING_LENGTH: 8,
    WAITING_LENGTH_LINE_END: 9,
    READING_TRUNK: 10,
    WAITING_NEW_LINE: 11,
    WAITING_NEW_LINE_END: 12,
    READING_TRUNK_END: 13,
};

export interface ResponseData {
    statusCode: string;
    statusText: string;
    headers: Object;
    body: string;
}

export class ResponseParser {
    protected currenetStatus: number = PARSE_STATUS.WAITING_STATUS_LINE;
    public statusLine = '';
    public headers: { [key: string]: string } = {};
    protected headerName = '';
    protected headerValue = '';
    protected bodyParser: ChunkedBodyParser | null = null;

    get isFinished(): boolean {
        return !!this.bodyParser && this.bodyParser.isFinished;
    }

    get response(): ResponseData {
        const status = this.statusLine.match(/HTTP\/1.1\s([0-9]+)\s(\S+)/);
        return {
            statusCode: status ? status[1] : '',
            statusText: status ? status[2] : '',
            headers: this.headers,
            body: this.bodyParser!.content.join(''),
        };
    }

    public receive(data: string) {
        for (let i = 0, { length } = data; i < length; ++i) {
            this.receiveChar(data.charAt(i));
        }
    }

    public receiveChar(char: string) {
        if (this.currenetStatus === PARSE_STATUS.WAITING_STATUS_LINE) {
            if (char !== '\r') {
                this.statusLine += char;
            } else {
                this.currenetStatus = PARSE_STATUS.WAITING_STATUS_LINE_END;
            }
        } else if (
            this.currenetStatus === PARSE_STATUS.WAITING_STATUS_LINE_END
        ) {
            if (char === '\n') {
                this.currenetStatus = PARSE_STATUS.WAITING_HEADER_NAME;
            }
        } else if (this.currenetStatus === PARSE_STATUS.WAITING_HEADER_NAME) {
            if (char === '\r') {
                this.currenetStatus = PARSE_STATUS.WAITING_HEADER_BLOCK_END;
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new ChunkedBodyParser();
                }
            } else if (char === ':') {
                this.currenetStatus = PARSE_STATUS.WAITING_HEADER_SPACE;
            } else {
                this.headerName += char;
            }
        } else if (this.currenetStatus === PARSE_STATUS.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.currenetStatus = PARSE_STATUS.WAITING_HEADER_VALUE;
            }
        } else if (this.currenetStatus === PARSE_STATUS.WAITING_HEADER_VALUE) {
            if (char !== '\r') {
                this.headerValue += char;
            } else {
                this.currenetStatus = PARSE_STATUS.WAITING_STATUS_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            }
        } else if (
            this.currenetStatus === PARSE_STATUS.WAITING_HEADER_BLOCK_END
        ) {
            if (char === '\n') {
                this.currenetStatus = PARSE_STATUS.WAITING_BODY;
            }
        } else if (this.currenetStatus === PARSE_STATUS.WAITING_BODY) {
            this.bodyParser?.receiveChar(char);
        }
    }
}

class ChunkedBodyParser {
    protected length: number = 0;
    public content: string[] = [];
    protected currentState: number = PARSE_STATUS.WAITING_LENGTH;
    public isFinished: boolean = false;
    public receiveChar(char: string) {
        if (this.currentState === PARSE_STATUS.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true;
                } else {
                    this.currentState = PARSE_STATUS.WAITING_LENGTH_LINE_END;
                }
            } else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if (this.currentState === PARSE_STATUS.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.currentState = PARSE_STATUS.READING_TRUNK;
            }
        } else if (this.currentState === PARSE_STATUS.READING_TRUNK) {
            this.content.push(char);
            --this.length;
            if (this.length === 0) {
                this.currentState = PARSE_STATUS.WAITING_NEW_LINE;
            }
        } else if (this.currentState === PARSE_STATUS.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.currentState = PARSE_STATUS.WAITING_NEW_LINE_END;
            }
        } else if (this.currentState === PARSE_STATUS.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.currentState = PARSE_STATUS.WAITING_LENGTH;
            }
        }
    }
}

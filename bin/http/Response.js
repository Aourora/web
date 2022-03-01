"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseParser = void 0;
const PARSE_STATUS = {
    WAITING_STATUS_LINE: 0,
    WAITING_STATUS_LINE_END: 1,
    WAITING_HEADER_NAME: 2,
    WAITING_HEADER_SPACE: 3,
    WAITING_HEADER_VALUE: 4,
    WAITING_HEADER_BLOCK_END: 6,
    WAITING_BODY: 7,
    WAITING_LENGTH: 8,
    WAITING_LENGTH_LINE_END: 9,
    READING_TRUNK: 10,
    WAITING_NEW_LINE: 11,
    WAITING_NEW_LINE_END: 12,
    READING_TRUNK_END: 13,
};
class ResponseParser {
    constructor() {
        this.currenetStatus = PARSE_STATUS.WAITING_STATUS_LINE;
        this.statusLine = '';
        this.headers = {};
        this.headerName = '';
        this.headerValue = '';
        this.bodyParser = null;
    }
    get isFinished() {
        return !!this.bodyParser && this.bodyParser.isFinished;
    }
    get response() {
        const status = this.statusLine.match(/HTTP\/1.1\s([0-9]+)\s(\S+)/);
        return {
            statusCode: status ? status[1] : '',
            statusText: status ? status[2] : '',
            headers: this.headers,
            body: this.bodyParser.content.join(''),
        };
    }
    receive(data) {
        for (let i = 0, { length } = data; i < length; ++i) {
            this.receiveChar(data.charAt(i));
        }
    }
    receiveChar(char) {
        var _a;
        if (this.currenetStatus === PARSE_STATUS.WAITING_STATUS_LINE) {
            if (char !== '\r') {
                this.statusLine += char;
            }
            else {
                this.currenetStatus = PARSE_STATUS.WAITING_STATUS_LINE_END;
            }
        }
        else if (this.currenetStatus === PARSE_STATUS.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.currenetStatus = PARSE_STATUS.WAITING_HEADER_NAME;
            }
        }
        else if (this.currenetStatus === PARSE_STATUS.WAITING_HEADER_NAME) {
            if (char === '\r') {
                this.currenetStatus = PARSE_STATUS.WAITING_HEADER_BLOCK_END;
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new ChunkedBodyParser();
                }
            }
            else if (char === ':') {
                this.currenetStatus = PARSE_STATUS.WAITING_HEADER_SPACE;
            }
            else {
                this.headerName += char;
            }
        }
        else if (this.currenetStatus === PARSE_STATUS.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.currenetStatus = PARSE_STATUS.WAITING_HEADER_VALUE;
            }
        }
        else if (this.currenetStatus === PARSE_STATUS.WAITING_HEADER_VALUE) {
            if (char !== '\r') {
                this.headerValue += char;
            }
            else {
                this.currenetStatus = PARSE_STATUS.WAITING_STATUS_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            }
        }
        else if (this.currenetStatus === PARSE_STATUS.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.currenetStatus = PARSE_STATUS.WAITING_BODY;
            }
        }
        else if (this.currenetStatus === PARSE_STATUS.WAITING_BODY) {
            (_a = this.bodyParser) === null || _a === void 0 ? void 0 : _a.receiveChar(char);
        }
    }
}
exports.ResponseParser = ResponseParser;
class ChunkedBodyParser {
    constructor() {
        this.length = 0;
        this.content = [];
        this.currentState = PARSE_STATUS.WAITING_LENGTH;
        this.isFinished = false;
    }
    receiveChar(char) {
        if (this.currentState === PARSE_STATUS.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true;
                }
                else {
                    this.currentState = PARSE_STATUS.WAITING_LENGTH_LINE_END;
                }
            }
            else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        }
        else if (this.currentState === PARSE_STATUS.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.currentState = PARSE_STATUS.READING_TRUNK;
            }
        }
        else if (this.currentState === PARSE_STATUS.READING_TRUNK) {
            this.content.push(char);
            --this.length;
            if (this.length === 0) {
                this.currentState = PARSE_STATUS.WAITING_NEW_LINE;
            }
        }
        else if (this.currentState === PARSE_STATUS.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.currentState = PARSE_STATUS.WAITING_NEW_LINE_END;
            }
        }
        else if (this.currentState === PARSE_STATUS.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.currentState = PARSE_STATUS.WAITING_LENGTH;
            }
        }
    }
}
//# sourceMappingURL=Response.js.map
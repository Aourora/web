"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
http_1.default.createServer((req, res) => {
    console.log("server receive");
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Test", "test");
    res.writeHead(200);
    res.end("request success");
}).listen(8088);
console.log("run server");
//# sourceMappingURL=Server.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.match = void 0;
function match(s, p) {
    const { length: M } = s;
    const { length: N } = p;
    let status = 0;
    const obj = {};
    for (const char of p) {
        if (!obj[char])
            obj[char] = 0;
    }
    const dfa = KMP(p, obj);
    for (let i = 0; i < M && status < N; ++i) {
        status = obj[s.charAt(i)] !== void 0 ? dfa[status][s.charAt(i)] : 0;
    }
    return status === N;
}
exports.match = match;
function KMP(p, obj) {
    const { length } = p;
    const dfa = new Array(length).fill(0).map(() => {
        return Object.assign({}, obj);
    });
    let x = 0;
    dfa[0][p[0]] = 1;
    for (let i = 1; i < length; ++i) {
        for (const key in obj) {
            dfa[i][key] = dfa[x][key];
        }
        dfa[i][p.charAt(i)] = i + 1;
        x = dfa[x][p[i]];
    }
    return dfa;
}
console.log(match('asdfasdfsafababaaaaaaaabsaaaaaaaaabasadacbsaaaaaaaaabasadacaabababababacafababaabacasdf', 'aaaaaaabsaaaaaaaaabasadac'));
//# sourceMappingURL=DFM.js.map
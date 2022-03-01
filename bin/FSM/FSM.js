"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.match = void 0;
function match(str) {
    let state = start;
    for (const char of str) {
        state = state(char);
    }
    return state === end;
}
exports.match = match;
function start(char) {
    if (char === 'a') {
        return findA;
    }
    return start;
}
function findA(char) {
    if (char === 'b') {
        return findB;
    }
    return start(char);
}
function findB(char) {
    if (char === 'c') {
        return end;
    }
    return start(char);
}
function end(char) {
    return end;
}
console.log(match('I am abc'));
//# sourceMappingURL=FSM.js.map
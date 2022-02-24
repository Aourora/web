type STATE = (char: string) => STATE;

//pattern
export function match(str: string): boolean {
    let state: STATE = start;
    for (const char of str) {
        state = state(char);
    }
    return state === end;
}

function start(char: string): STATE {
    if (char === 'a') {
        return findA;
    }
    return start;
}

function findA(char: string): STATE {
    if (char === 'b') {
        return findB;
    }
    return start(char);
}

function findB(char: string): STATE {
    if (char === 'c') {
        return end;
    }
    return start(char);
}

function end(char: string): STATE {
    return end;
}

console.log(match('I am abc'));

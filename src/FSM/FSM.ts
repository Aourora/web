type State = (char: string) => State;

//pattern
export function match(str: string): boolean {
    let state: State = start;
    for (const char of str) {
        state = state(char);
    }
    return state === end;
}

function start(char: string): State {
    if (char === 'a') {
        return findA;
    }
    return start;
}

function findA(char: string): State {
    if (char === 'b') {
        return findB;
    }
    return start(char);
}

function findB(char: string): State {
    if (char === 'c') {
        return end;
    }
    return start(char);
}

function end(): State {
    return end;
}

console.log(match('I am abc'));

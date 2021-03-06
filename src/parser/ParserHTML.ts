import { Attribute, Node } from '../common/Common';
import { layout } from '../layout/Layout';
import { addCSSRules, computeCSS } from './ParserCSS';

type State =
    | ((char: string | symbol) => State)
    | ((char: string) => State | undefined);
type Token = {
    type: string;
    tagName?: string;
    content?: string;
    [key: string]: string | boolean;
};

const EOF: symbol = Symbol('EOF'); //EOF: End Of File
const BLANK = /^[\t\n\f\s]$/;

const U_S = '\u0000';

let currentToken: Token;
let currentAttribute: Attribute;
const stack: Node[] = [
    { type: 'document', children: [], attributes: [], parent: null },
];

export function parserHTML(html: string): Node {
    let state: any = data;
    for (const char of html) {
        state = state(char);
    }
    state = state(EOF);
    return stack[0];
}

function emit(token: Token): void {
    const top = stack[stack.length - 1];
    if (token.type === 'startTag') {
        const element: Node = {
            type: 'element',
            tagName: token.tagName,
            children: [],
            attributes: [],
            parent: top,
        };
        top.children.push(element);
        for (const p in token) {
            if (p !== 'type' && p !== 'tagName') {
                element.attributes.push({ name: p, value: token[p] });
            }
        }
        //-*********计算CSS*********-//
        computeCSS(element);

        if (!token.isSelfClosing) {
            stack.push(element);
        }
    } else if (token.type === 'endTag') {
        if (top.tagName !== token.tagName) {
            throw new Error("Tag start end doesn't match!");
        } else {
            if (top.tagName === 'style') {
                //-*********添加CSSRules*********-//
                addCSSRules(top.content);
            }
            //-*********计算layout*********-//
            layout(top);
            stack.pop();
        }
    } else if (token.type === 'text') {
        if (top.content === void 0) {
            top.content = '';
        }
        top.content += token.content;
    }
}

function data(char: string | symbol): State {
    if (char === '<') {
        return tagOpen;
    } else if (char === EOF) {
        emit({
            type: 'EOF',
        });
    } else {
        emit({
            type: 'text',
            content: char as string,
        });
        return data;
    }
}

function tagOpen(char: string): State {
    if (char === '/') {
        return endTagOpen;
    } else if (char.match(/^[a-zA-Z]$/)) {
        currentToken = { type: 'startTag', tagName: '' };
        return tagName(char);
    } else {
        emit({
            type: 'text',
            content: char,
        });
        return;
    }
}

function endTagOpen(char: string | symbol): State {
    if (typeof char === 'string' && char.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: '',
        };
        return tagName(char as string);
    } else if (char === '>') {
        //
    } else if (char === EOF) {
        //
    } else {
        //
    }
}

function tagName(char: string): State {
    if (char.match(BLANK)) {
        return beforeAttributeName;
    } else if (char === '/') {
        return selfClosingStartTag;
    } else if (char.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += char.toLowerCase();
        return tagName;
    } else if (char === '>') {
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

function beforeAttributeName(char: string | symbol): State {
    if (typeof char === 'string' && char.match(BLANK)) {
        return beforeAttributeName;
    } else if (char === '/' || char === '>' || char === EOF) {
        return afterAttributeName(char);
    } else if (char === '=') {
        // return beforeAttributeName;
    } else {
        currentAttribute = { name: '', value: '' };
        return attributeName(char);
    }
}

function beforeAttributeValue(char: string | symbol): State {
    if (
        char === EOF ||
        (char as string).match(BLANK) ||
        char === '/' ||
        char === '>'
    ) {
        return beforeAttributeValue;
    } else if (char === '"') {
        return doubleQuotedAttributeValue;
    } else if (char === "'") {
        return singleQuotedAttributeValue;
    } else {
        return UnquotedAttributeValue(char);
    }
}

function attributeName(char: string | symbol): State {
    if (
        char === EOF ||
        (char as string).match(BLANK) ||
        char === '/' ||
        char === '>'
    ) {
        return afterAttributeName(char);
    } else if (char === '=') {
        return beforeAttributeValue;
    } else if (char === U_S) {
        //
    } else if (char === '"' || char === "'" || char === '<') {
        //
    } else {
        currentAttribute.name += char as string;
        return attributeName;
    }
}

function afterAttributeName(char: string | symbol): State {
    if (typeof char === 'string' && char.match(BLANK)) {
        return afterAttributeName;
    } else if (char === '/') {
        return selfClosingStartTag;
    } else if (char === '=') {
        return beforeAttributeValue;
    } else if (char === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (char === EOF) {
        //
    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = { name: '', value: '' };
        return attributeName(char);
    }
}

function selfClosingStartTag(char: string): State {
    if (char === '>') {
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if (char === 'EOF') {
        //
    } else {
        //
    }
}

function doubleQuotedAttributeValue(char: string | symbol): State {
    if (char === '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (char === U_S) {
        //
    } else if (char === EOF) {
        //
    } else {
        currentAttribute.value += char as string;
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(char: string | symbol): State {
    if (char === "'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (char === U_S) {
        //
    } else if (char === EOF) {
        //
    } else {
        currentAttribute.value += char as string;
        return singleQuotedAttributeValue;
    }
}

function afterQuotedAttributeValue(char: string | symbol): State {
    if (typeof char === 'string' && char.match(BLANK)) {
        return beforeAttributeName;
    } else if (char === '/') {
        return selfClosingStartTag;
    } else if (char === '>') {
        emit(currentToken);
        return data;
    } else if (char === EOF) {
        //
    } else {
        //
    }
}

function UnquotedAttributeValue(char: string | symbol): State {
    if (char === EOF) {
        //
    } else if ((char as string).match(BLANK)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (char === '/') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if (char === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (char === U_S) {
        //
    } else if (char === '"' || char === '<' || char === '=' || char === '`') {
        //
    } else {
        currentAttribute.value += char as string;
        return UnquotedAttributeValue;
    }
}

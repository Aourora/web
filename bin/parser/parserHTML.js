"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parserHTML = void 0;
const ParserCSS_1 = require("./ParserCSS");
const EOF = Symbol('EOF');
const BLANK = /^[\t\n\f\s]$/;
const U_S = '\u0000';
let currentToken;
let currentAttribute;
const stack = [
    { type: 'document', children: [], attributes: [], parent: null },
];
function parserHTML(html) {
    let state = data;
    for (const char of html) {
        state = state(char);
    }
    state = state(EOF);
    return stack[0];
}
exports.parserHTML = parserHTML;
function emit(token) {
    const top = stack[stack.length - 1];
    if (token.type === 'startTag') {
        const element = {
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
        (0, ParserCSS_1.computeCSS)(element);
        if (!token.isSelfClosing) {
            stack.push(element);
        }
    }
    else if (token.type === 'endTag') {
        if (top.tagName !== token.tagName) {
            throw new Error("Tag start end doesn't match!");
        }
        else {
            if (top.tagName === 'style') {
                (0, ParserCSS_1.addCSSRules)(top.content);
            }
            stack.pop();
        }
    }
    else if (token.type === 'text') {
        if (top.content === void 0) {
            top.content = '';
        }
        top.content += token.content;
    }
}
function data(char) {
    if (char === '<') {
        return tagOpen;
    }
    else if (char === EOF) {
        emit({
            type: 'EOF',
        });
    }
    else {
        emit({
            type: 'text',
            content: char,
        });
        return data;
    }
}
function tagOpen(char) {
    if (char === '/') {
        return endTagOpen;
    }
    else if (char.match(/^[a-zA-Z]$/)) {
        currentToken = { type: 'startTag', tagName: '' };
        return tagName(char);
    }
    else {
        emit({
            type: 'text',
            content: char,
        });
        return;
    }
}
function endTagOpen(char) {
    if (typeof char === 'string' && char.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: '',
        };
        return tagName(char);
    }
    else if (char === '>') {
    }
    else if (char === EOF) {
    }
    else {
    }
}
function tagName(char) {
    if (char.match(BLANK)) {
        return beforeAttributeName;
    }
    else if (char === '/') {
        return selfClosingStartTag;
    }
    else if (char.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += char.toLowerCase();
        return tagName;
    }
    else if (char === '>') {
        emit(currentToken);
        return data;
    }
    else {
        return tagName;
    }
}
function beforeAttributeName(char) {
    if (typeof char === 'string' && char.match(BLANK)) {
        return beforeAttributeName;
    }
    else if (char === '/' || char === '>' || char === EOF) {
        return afterAttributeName(char);
    }
    else if (char === '=') {
    }
    else {
        currentAttribute = { name: '', value: '' };
        return attributeName(char);
    }
}
function beforeAttributeValue(char) {
    if (char instanceof Symbol ||
        char.match(BLANK) ||
        char === '/' ||
        char === '>') {
        return beforeAttributeValue;
    }
    else if (char === '"') {
        return doubleQuotedAttributeValue;
    }
    else if (char === "'") {
        return singleQuotedAttributeValue;
    }
    else if (char === '>') {
    }
    else {
        return UnquotedAttributeValue(char);
    }
}
function attributeName(char) {
    if (char instanceof Symbol ||
        char.match(BLANK) ||
        char === '/' ||
        char === '>') {
        return afterAttributeName(char);
    }
    else if (char === '=') {
        return beforeAttributeValue;
    }
    else if (char === U_S) {
    }
    else if (char === '"' || char === "'" || char === '<') {
    }
    else {
        currentAttribute.name += char;
        return attributeName;
    }
}
function afterAttributeName(char) {
    if (typeof char === 'string' && char.match(BLANK)) {
        return afterAttributeName;
    }
    else if (char === '/') {
        return selfClosingStartTag;
    }
    else if (char === '=') {
        return beforeAttributeValue;
    }
    else if (char === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }
    else if (char === EOF) {
    }
    else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = { name: '', value: '' };
        return attributeName(char);
    }
}
function selfClosingStartTag(char) {
    if (char === '>') {
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    }
    else if (char === 'EOF') {
    }
    else {
    }
}
function doubleQuotedAttributeValue(char) {
    if (char === '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }
    else if (char === U_S) {
    }
    else if (char === EOF) {
    }
    else {
        currentAttribute.value += char;
        return doubleQuotedAttributeValue;
    }
}
function singleQuotedAttributeValue(char) {
    if (char === "'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }
    else if (char === U_S) {
    }
    else if (char === EOF) {
    }
    else {
        currentAttribute.value += char;
        return singleQuotedAttributeValue;
    }
}
function afterQuotedAttributeValue(char) {
    if (typeof char === 'string' && char.match(BLANK)) {
        return beforeAttributeName;
    }
    else if (char === '/') {
        return selfClosingStartTag;
    }
    else if (char === '>') {
        emit(currentToken);
        return data;
    }
    else if (char === EOF) {
    }
    else {
    }
}
function UnquotedAttributeValue(char) {
    if (char instanceof Symbol) {
    }
    else if (char.match(BLANK)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    }
    else if (char === '/') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    }
    else if (char === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }
    else if (char === U_S) {
    }
    else if (char === '"' || char === '<' || char === '=' || char === '`') {
    }
    else {
        currentAttribute.value += char;
        return UnquotedAttributeValue;
    }
}
//# sourceMappingURL=ParserHTML.js.map
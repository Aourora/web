"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeCSS = exports.addCSSRules = void 0;
const css_1 = __importDefault(require("css"));
const rules = [];
function specificity(selector) {
    const result = [0, 0, 0, 0];
    const parts = selector.split(' ');
    for (const part of parts) {
        if (part.charAt(0) === '#') {
            ++result[1];
        }
        else if (part.charAt(0) === '.') {
            ++result[2];
        }
        else {
            ++result[3];
        }
    }
    return result;
}
function compare(sp1, sp2) {
    for (let i = 0; i < 4; ++i) {
        if (sp1[i] - sp2[i]) {
            return sp1[i] - sp2[i] > 0;
        }
    }
}
function addCSSRules(content) {
    const ast = css_1.default.parse(content);
    rules.push(...ast.stylesheet.rules);
}
exports.addCSSRules = addCSSRules;
function computeCSS(element) {
    if (!element.computedStyle) {
        element.computedStyle = {};
    }
    for (const rule of rules) {
        const selectorsParts = rule.selectors[0].split(' ').reverse();
        if (!match(element, selectorsParts[0])) {
            continue;
        }
        let { parent } = element;
        let i = 1;
        while (parent && i < selectorsParts.length) {
            if (match(parent, selectorsParts[i])) {
                ++i;
            }
            parent = parent.parent;
        }
        if (i >= selectorsParts.length) {
            const { computedStyle } = element;
            const sp = specificity(rule.selectors[0]);
            for (const declaration of rule.declarations) {
                const { property, value } = declaration;
                if (!computedStyle[property]) {
                    computedStyle[property] = { value, specificity: sp };
                }
                else if (compare(sp, computedStyle[property].specificity)) {
                    computedStyle[property].value = value;
                }
            }
        }
    }
}
exports.computeCSS = computeCSS;
function match(element, selector) {
    if (selector.charAt(0) === '#') {
        return !!element.attributes.find((attr) => attr.name === 'id' && attr.value === selector.replace('#', ''));
    }
    else if (selector.charAt(0) === '.') {
        return !!element.attributes.find((attr) => attr.name === 'class' &&
            attr.value === selector.replace('.', ''));
    }
    else if (element.tagName === selector) {
        return true;
    }
    return false;
}
//# sourceMappingURL=ParserCSS.js.map
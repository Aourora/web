import css, { Declaration, Rule } from 'css';

import { Node, Quad } from './ParserHTML';

const rules: Rule[] = [];

function specificity(selector: string): Quad {
    const result: Quad = [0, 0, 0, 0];
    const parts = selector.split(' ');
    for (const part of parts) {
        if (part.charAt(0) === '#') {
            ++result[1];
        } else if (part.charAt(0) === '.') {
            ++result[2];
        } else {
            ++result[3];
        }
    }
    return result;
}

function compare(sp1: Quad, sp2: Quad): boolean {
    for (let i = 0; i < 4; ++i) {
        if (sp1[i] - sp2[i]) {
            return sp1[i] - sp2[i] > 0;
        }
    }
}

export function addCSSRules(content: string): void {
    const ast = css.parse(content);
    rules.push(...ast.stylesheet.rules);
}

export function computeCSS(element: Node): void {
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
            for (const declaration of rule.declarations as Declaration[]) {
                const { property, value } = declaration;
                if (!computedStyle[property]) {
                    computedStyle[property] = { value, specificity: sp };
                } else if (compare(sp, computedStyle[property].specificity)) {
                    computedStyle[property].value = value;
                }
            }
        }
    }
}

function match(element: Node, selector: string): boolean {
    if (selector.charAt(0) === '#') {
        return !!element.attributes.find(
            (attr) =>
                attr.name === 'id' && attr.value === selector.replace('#', '')
        );
    } else if (selector.charAt(0) === '.') {
        return !!element.attributes.find(
            (attr) =>
                attr.name === 'class' &&
                attr.value === selector.replace('.', '')
        );
    } else if (element.tagName === selector) {
        return true;
    }
    return false;
}

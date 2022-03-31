import css, { Declaration, Rule } from 'css';
import { Quad, Node } from '../common/Common';

const rules: Rule[] = [];

/**
 * 计算选择器优先级
 * @param selector
 * @returns
 */
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

/**
 * 比较选择器优先级大小
 * @param sp1
 * @param sp2
 * @returns
 */
function compare(sp1: Quad, sp2: Quad): boolean {
    for (let i = 0; i < 4; ++i) {
        if (sp1[i] - sp2[i]) {
            return sp1[i] - sp2[i] > 0;
        }
    }
}

/**
 * 添加CSS规则
 * @param content
 */
export function addCSSRules(content: string): void {
    const ast = css.parse(content);
    rules.push(...ast.stylesheet.rules);
}

/**
 * 计算元素CSS
 * @param element 元素
 */
export function computeCSS(element: Node): void {
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
            if (!element.computedStyle) {
                element.computedStyle = {};
            }

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

/**
 * 检测元素是否包含当前selectorPart
 * @param element
 * @param selectorPart
 * @returns
 */
function match(element: Node, selectorPart: string): boolean {
    if (selectorPart.charAt(0) === '#') {
        return !!element.attributes.find(
            (attr) =>
                attr.name === 'id' &&
                attr.value === selectorPart.replace('#', '')
        );
    } else if (selectorPart.charAt(0) === '.') {
        return !!element.attributes.find(
            (attr) =>
                attr.name === 'class' &&
                attr.value === selectorPart.replace('.', '')
        );
    } else if (element.tagName === selectorPart) {
        return true;
    }
    return false;
}

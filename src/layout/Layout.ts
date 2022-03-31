import { Node, Style } from '../common/Common';

type size = 'width' | 'height';
type dir = 'left' | 'right' | 'top' | 'bottom';
type sign = -1 | 1;

export function layout(element: Node): void {
    if (!element.computedStyle) return;
    //数据预处理
    const style = logicStyle(element);

    if (style.display !== 'flex') {
        return;
    }

    const items = element.children.filter((node) => node.type === 'element');

    items.sort((a, b) => {
        return (a.order || 0) - (b.order || 0);
    });

    if (style.width === 'auto') {
        style.width = null;
    }

    if (style.height === 'auto') {
        style.height = null;
    }

    if (!style['flex-direction'] || style['flex-direction'] === 'auto') {
        style['flex-direction'] = 'row';
    }
    if (!style['justify-content'] || style['justify-content'] === 'auto') {
        style['justify-content'] = 'flex-start';
    }
    if (!style['flex-wrap'] || style['flex-wrap'] === 'auto') {
        style['flex-wrap'] = 'nowrap';
    }
    if (!style['align-items'] || style['align-items'] === 'auto') {
        style['align-items'] = 'stretch';
    }
    if (!style['align-content'] || style['align-content'] === 'auto') {
        style['align-content'] = 'stretch';
    }

    let mainSize: size,
        mainStart: dir,
        mainEnd: dir,
        mainSign: sign,
        mainBase: number,
        crossSize: size,
        crossStart: dir,
        crossEnd: dir,
        crossSign: sign,
        crossBase: number;

    if (style['flex-direction'] === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = 1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    } else if (style['flex-direction'] === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width as number;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    } else if (style['flex-direction'] === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = 1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    } else {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height as number;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    if (style['flex-wrap'] === 'wrap-reverse') {
        const temp = crossStart;
        crossStart = crossEnd;
        crossEnd = temp;
        crossSign = -1;
    } else {
        crossSign = 1;
        crossBase = 0;
    }

    let isAutoMainSize = false;
    if (!style[mainSize]) {
        let size = 0;
        for (const node of items) {
            if (node.style && node.style[mainSize]) {
                size += node.style[mainSize] as number;
            }
        }
        style[mainSize] = size;
        isAutoMainSize = true;
    }

    //主轴分行
    let flexLine: { elements: Node[]; mainSpace: number; crossSpace: number } =
        { elements: [], mainSpace: 0, crossSpace: 0 };
    const flexLines = [flexLine];
    let mainSpace = style[mainSize] as number;
    let crossSpace = 0;
    for (const item of items) {
        const { style: itemStyle } = item;
        if (!itemStyle[mainSize]) {
            itemStyle[mainSize] = 0;
        }

        if (itemStyle.flex) {
            flexLine.elements.push(item);
        } else if (style['flex-wrap'] === 'nowrap' && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize] as number;
            if (itemStyle[crossSize]) {
                crossSpace += itemStyle[crossSize] as number;
            }
            flexLine.elements.push(item);
        } else {
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize];
            }
            if (mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                flexLine = { elements: [item], mainSpace: 0, crossSpace: 0 };
                flexLines.push(flexLine);
                mainSpace = style[mainSize] as number;
                crossSpace = 0;
            } else {
                flexLine.elements.push(item);
            }
            if (itemStyle[crossSize]) {
                crossSpace = Math.max(
                    crossSpace,
                    itemStyle[crossSize] as number
                );
            }
            mainSpace -= itemStyle[mainSize] as number;
        }
    }
    flexLine.mainSpace = mainSpace;
    flexLine.crossSpace = crossSpace;
}

function logicStyle(element: Node): Style {
    if (!element.style) {
        element.style = {};
    }
    const { computedStyle, style } = element;
    for (const prop in computedStyle) {
        style[prop] = computedStyle[prop].value;

        if (
            style[prop].toString().match(/px$/) ||
            style[prop].toString().match(/^[0-9.]+$/)
        ) {
            style[prop] = parseInt(style[prop].toString());
        }
    }
    return style;
}

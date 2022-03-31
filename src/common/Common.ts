export interface ResponseData {
    statusCode: string;
    statusText: string;
    headers: Record<string, unknown>;
    body: string;
}

export type Quad = [number, number, number, number];

export type Attribute = { name: string; value: any };

type StyleValue = { value: string; specificity: Quad };

export interface Node {
    type: 'element' | 'document';
    tagName?: string;
    content?: string;
    computedStyle?: { [key: string]: StyleValue };
    style?: Style;
    order?: number;
    parent: Node;
    children: Node[];
    attributes: Attribute[];
}

export interface Style {
    [key: string]: string | number;
    display?: 'flex';
    width?: number | 'auto';
    height?: number | 'auto';
    flex?: string;
    ['flex-direction']?:
        | 'auto'
        | 'row'
        | 'row-reverse'
        | 'column'
        | 'column-reverse';
    ['justify-content']?: 'auto' | 'flex-start' | 'flex-end';
    ['flex-wrap']?: 'auto' | 'nowrap' | 'wrap' | 'wrap-reverse';
    ['align-items']?: 'auto' | 'stretch';
    ['align-content']?: 'auto' | 'stretch';
}

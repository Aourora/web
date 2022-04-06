function myInstanceof(source: any, target: any): boolean {
    const baseType = ['number', 'boolean', 'string', 'undefined', 'symbol'];
    //判断是否是基本数据类型
    if (baseType.includes(typeof source)) return false;

    let S = source.__proto__;
    const T = target.prototype;

    while (S) {
        if (S === T) return true;
        S = S.__proto__;
    }

    return false;
}

export default myInstanceof;

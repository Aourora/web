type STATE = { [key: string]: number };

export function match(s: string, p: string): boolean {
    const { length: M } = s;
    const { length: N } = p;
    let status = 0;

    const obj: { [key: string]: number } = {};

    for (const char of p) {
        if (!obj[char]) obj[char] = 0;
    }
    const dfa = KMP(p, obj);

    for (let i = 0; i < M && status < N; ++i) {
        status = obj[s.charAt(i)] !== void 0 ? dfa[status][s.charAt(i)] : 0;
    }

    return status === N;
}

/**
 * 计算pattern状态机
 * @param p pattern
 * @param obj pattern中不重复的对象
 * @returns pattern状态机
 */
function KMP(p: string, obj: { [key: string]: number }): STATE[] {
    const { length } = p;
    const dfa: STATE[] = new Array(length).fill(0).map(() => {
        return { ...obj };
    });
    //第一次重启状态为0
    let x = 0;
    //匹配第一位进入状态1
    dfa[0][p[0]] = 1;
    for (let i = 1; i < length; ++i) {
        //设置状态i匹配失败项
        for (const key in obj) {
            dfa[i][key] = dfa[x][key];
        }
        //设置状态i匹配成功项进入状态i + 1
        dfa[i][p.charAt(i)] = i + 1;
        //将当前字符作为当前重启状态输入得到下一重启状态
        x = dfa[x][p[i]];
    }
    return dfa;
}
console.log(
    match(
        'asdfasdfsafababaaaaaaaabsaaaaaaaaabasadacbsaaaaaaaaabasadacaabababababacafababaabacasdf',
        'aaaaaaabsaaaaaaaaabasadac'
    )
);

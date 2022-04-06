import 'mocha';
import { expect } from 'chai';
import { spy } from 'sinon';
import myInstanceof from './instanceof';

/**
 * 测试函数
 * 接受一个函数，并在返回函数每次调用时给其传入类型
 */
const testFunc = function (
    callback: (bool: boolean) => any
): (source: any, target: any) => void {
    return (source, target) => callback(myInstanceof(source, target));
};

describe('instanceof函数测试', function () {
    it('可以正常判断', function () {
        const mockCallback = spy();

        const work = testFunc(mockCallback);
        work(1, Object);
        work(1, Function);
        work({}, Object);
        work({}, Function);
        work(() => {}, Object);
        work(() => {}, Function);

        expect(mockCallback.callCount).to.be.equal(6);
        expect(mockCallback.args).to.be.deep.equal([
            [false],
            [false],
            [true],
            [false],
            [true],
            [true],
        ]);
    });
});

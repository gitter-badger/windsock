import Observer from '../../src/observer';
import assert from 'assert';

describe('Observer', ()=>{
    it('should be loaded successfully', function () {
        assert.notStrictEqual(typeof Observer, 'undefined');
    });
    describe('instance', ()=>{
        it('should instantiate', ()=>{
            let observer = new Observer(()=>{});
            assert.strictEqual(observer instanceof  Observer, true);
        });
        it('should throw an error if argument[0] missing', ()=>{
            assert.throws(()=>{
                return new Observer();
            }, Error, 'Failed to instantiate missing callback');
        });
        it('should throw an error if argument[0] is not a function', ()=>{
            assert.throws(()=>{
                return new Observer(1);
            }, Error, 'Invalid callback specified');
        });
    });
    describe('observe', ()=>{});
    describe('disconnect', ()=>{});
    describe('observableObject literal set', ()=>{});
    describe('observableObject.add', ()=>{});
    describe('observableObject.delete', ()=>{});
    describe('observableArray literal set', ()=>{});
    describe('observableArray.fill', ()=>{});
    describe('observableArray.pop', ()=>{});
    describe('observableArray.push', ()=>{});
    describe('observableArray.shift', ()=>{});
    describe('observableArray.splice', ()=>{});
    describe('observableArray.unshift', ()=>{});
});

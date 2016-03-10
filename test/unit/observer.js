var assert = require('assert'),
    Observer = require('../../dist/windsock.common').Observer;

describe('Observer', function(){
    it('should be loaded successfully', function () {
        assert.notStrictEqual(typeof Observer, 'undefined');
    });
    describe('instance', function(){
        it('should instantiate', function(){
            var observer = new Observer(function(){});
            assert.strictEqual(observer instanceof  Observer, true);
        });
        it('should throw an error if argument[0] missing', function(){
            var factory = function(){
                return new Observer();
            };
            assert.throws(factory, Error, 'Failed to instantiate missing callback');
        });
        it('should throw an error if argument[0] is not a function', function(){
            var factory = function(){
                return new Observer(1);
            };
            assert.throws(factory, Error, 'Invalid callback specified');
        });
    });
    describe('observe()', function(){

    });
    describe('disconnect()', function(){

    });
    describe('observableObject literal set', function(){});
    describe('observableObject.add()', function(){});
    describe('observableObject.delete()', function(){});
    describe('observableArray literal set', function(){});
    describe('observableArray.fill()', function(){

    });
    describe('observableArray.pop()', function(){

    });
    describe('observableArray.push()', function(){

    });
    describe('observableArray.shift()', function(){

    });
    describe('observableArray.splice()', function(){

    });
    describe('observableArray.unshift()', function(){

    });
});

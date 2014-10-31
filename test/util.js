var Util = require('../src/util');
var assert = require('assert');

describe('Util', function () {

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof Util, 'undefined');

    });

    describe('nextTick(fn)', function(){

        it('should invoke callback on the next stack', function(done){

            var called = false,
                callback = function(){
                    called = true;
                    assert.strictEqual(called, true);
                    done();
                };

            Util.nextTick(callback);

            assert.strictEqual(called, false);

        });

    });

    describe('each(list, fn)', function(){

        var array = Array.apply(undefined, new Array(100)),
            count = 0;

        it('should iterate over a dense array for array.length', function(){

            count = 0;

            Util.each(array, function(){
                count++;
            });

            assert.equal(count, 100);

        });

        it('should iterate over only an objects enumerable and non inherited properties', function(){

            var object = Object.create(Object.prototype);
            object.propA = 'A';
            object.propB = 'B';
            count = 0;

            Util.each(object, function(){
                count++;
            });

            assert.equal(count, 2);

        });

        it('should break if exit object is returned from iterator', function(){

            count = 0;

            Util.each(array, function(){
                count++;
                if(count === 50){
                    return arguments[3];
                }
            });

            assert.equal(count, 50);

        });

    });

    describe('traverse(list, fn)', function(){

        var array = [[[[]]]],
            object = {
                object: {
                    object: {
                        object: {}
                    }
                }
            },
            count = {
                total:0,
                maxDepth:0
            };

        it('should deeply iterate over nested arrays', function(){

            count.total = 0;
            count.maxDepth = 0;

            Util.traverse(array, function(){
                count.total++;
                count.maxDepth++;
            });

            assert.equal(count.total, 3);
            assert.equal(count.maxDepth, 3);

        });

        it('should deeply iterate over object keys', function(){

            count.total = 0;
            count.maxDepth = 0;

            Util.traverse(object, function(){
                count.total++;
                count.maxDepth++;
            });

            assert.equal(count.total, 3);
            assert.equal(count.maxDepth, 3);

        });

    });

    describe('extend(obj, source)', function(){

        it('should add the enumerable properties from source to target object', function(){

            var targetObj = {};

            var sourceObj = Object.create(Object.prototype);
            sourceObj.propA = 'a';
            sourceObj.propB = {};

            Util.extend(targetObj, sourceObj);

            assert.strictEqual(targetObj.propA, 'a');
            assert.strictEqual(targetObj.propB, sourceObj.propB);

        });

    });

    describe('inherit(construct, superConstruct)', function(){

        var classAConstCalled = false;

        var classA = function(){
            classAConstCalled = true;
        },
            classB = function(){};
        classA.prototype = {
            propA: 'a',
            propB: function(){}
        };
        classB.prototype = {
            propC: 'c',
            propD: function(){}
        };

        it('should inherit the superConstructor prototype', function(){

            Util.inherit(classA, classB);
            var inherited = new classA();

            assert.strictEqual(classA.prototype.propC, 'c');
            assert.strictEqual(typeof classB.prototype.propA, 'undefined');
            assert.strictEqual(classAConstCalled, true);

        });

    });

});

var Observer = require('../src/observer');
var assert = require('assert');

describe('Observer', function () {

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof Observer, 'undefined');

    });

    describe('Observer.observe', function(){

        it('should be an instance of Observer', function(){

            var observer = new Observer.observe();
            assert.strictEqual(observer instanceof Observer, true);

        });

    });

    describe('observe(target, true)', function(){

        var observer = new Observer(),
            targetObject = {
                deeply:{
                    nested: 'yes'
                }
            },
            count = 0;

        it('should recursively observe objects', function(){

            observer.observe(targetObject, true);
            assert.strictEqual(targetObject._recursive, true);
            assert.strictEqual(targetObject.deeply._recursive, true);

        });

        it('should add each nested object to observer', function(){

            assert.strictEqual(observer._observed.length, 2);
            assert.strictEqual(targetObject._observers[0], observer);
            assert.strictEqual(targetObject.deeply._observers[0], observer);

        });

        it('should call observer signal for both objects', function(){

            observer.observers.add(function(){
                count++;
            });

            targetObject.deeply.add('another', 'value');
            targetObject.add('another', 'value');

            assert.strictEqual(count, 2);

        });

    });

    describe('observe(target, recursive, callback)', function(){

        var observer = new Observer(),
            targetObject = {
                deeply:{
                    nested: 'yes'
                }
            },
            targetArray = [['nested'], false],
            signal;

        it('should add targetObject to observer._observed list', function(){

            observer.observe(targetObject);
            assert.strictEqual(observer._observed.length, 1);
            assert.strictEqual(observer._observed[0], targetObject);

        });

        it('should add observer to targetObject._observers list', function(){

            assert.strictEqual(targetObject._observers.length, 1);
            assert.strictEqual(targetObject._observers[0], observer);

        });

        it('should mutate targetObject to be an observable object', function(){

            assert.notStrictEqual(typeof targetObject.add, 'undefined');
            assert.notStrictEqual(typeof targetObject.delete, 'undefined');
            assert.notStrictEqual(typeof targetObject._observers, 'undefined');
            assert.notStrictEqual(typeof targetObject._recursive, 'undefined');

        });

        it('should default to false for recursively observing', function(){

            assert.strictEqual(targetObject._recursive, false);

        });

        it('should return a signal if callback was provided', function(){

            signal = observer.observe(targetObject, undefined, function(){});
            assert.notStrictEqual(typeof signal, 'undefined');

        });

        it('should not add duplicate observed or observers', function(){

            assert.strictEqual(observer._observed.length, 1);
            assert.strictEqual(targetObject._observers.length, 1);

        });

        it('should add a limited callback to observer.observers', function(){

            assert.strictEqual(observer.observers.count, 1);
            assert.strictEqual(observer.observers.index(signal), 0);

        });

    });

});

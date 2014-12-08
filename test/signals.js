var Signals = require('../src/signals');
var assert = require('assert');

describe('Signals', function () {

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof Signals, 'undefined');

    });

    describe('Signals.signal', function(){

        it('should be an instance of Signal', function(){

            var signal = new Signals.signal();
            assert.strictEqual(signal instanceof Signals.signal, true);

        });

    });

    describe('add(fn)', function(){

        var signals = new Signals();

        it('should add signal', function(){

            var signal = signals.add(function(){});
            assert.strictEqual(signal instanceof Signals.signal, true);
            assert.strictEqual(signals._signals.length, 1);

        });

        it('should add signal with correct context', function(){

            var context = Object.create(null);
            var signal = signals.add(function(){}, context);
            assert.strictEqual(signal.context, context);

        });

        it('should add signal with correct priority', function(){

            var signal = signals.add(function(){}, undefined, 3);
            assert.strictEqual(signal.priority, 3);

        });

    });

    describe('queue(fn)', function(){

        var signals = new Signals(),
            t = true;

        it('should add signal', function(){

            var signal = signals.queue(function(){});
            assert.strictEqual(signal instanceof Signals.signal, true);
            assert.strictEqual(signals._signals.length, 1);

        });

        it('should add signal with correct priority', function(){

            var signal = signals.queue(function(){
                t = false;
            }, undefined);
            assert.strictEqual(signal.priority, 1);

        });

        it('should dispatch signals in correct order', function(){

            signals.dispatch();
            assert.strictEqual(t, false);

        });

    });

    describe('remove(signal)', function(){

        var signals = new Signals();

        it('should remove signal', function(){

            var signal = signals.add(function(){});
            assert.strictEqual(signals._signals.length, 1);
            signals.remove(signal);
            assert.strictEqual(signals._signals.length, 0);

        });

        it('should remove all signals', function(){

            signals.add(function(){});
            signals.add(function(){});
            assert.strictEqual(signals._signals.length, 2);
            signals.remove();
            assert.strictEqual(signals._signals.length, 0);

        });

    });

    describe('dispatch(args)', function(){

        var signals = new Signals(),
            callCount = 0,
            args = undefined,
            calledWith = undefined,
            context = Object.create(null);

        for(var i = 9; i >= 0; i--){

            signals.add(function(argObj){

                callCount++;
                args = argObj;
                calledWith = this;

            }, context, i);

        }

        it('should invoke all signals', function(){

            signals.dispatch();
            assert.strictEqual(callCount, 10);

        });

        it('should invoke each signal with arguments', function(){

            var argObj = Object.create(null);
            signals.dispatch(argObj);
            assert.strictEqual(args, argObj);

        });

        it('should invoke each signal with correct context', function(){

            signals.dispatch();
            assert.strictEqual(calledWith, context);

        });

        it('should invoke each signal in correct order and halt on return false', function(){

            callCount = 0;

            signals.add(function(){

                callCount++;
                return false;

            }, undefined, 4);

            signals.dispatch();

            assert.strictEqual(callCount, 5);

        });

    });

});

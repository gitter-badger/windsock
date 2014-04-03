(function(){

    'use strict';

    var util = require('./util'),
        is = util.is,
        extend = util.extend,
        merge = util.merge,
        each = util.each,
        inherit = util.inherit,
        nextTick = util.nextTick;

    module.exports = Signals;

    Signals.Promise = Promise;
    Signals.Signal = Signal;

    function Promise(){

        this._callbacks = [];

    }

    Promise.prototype.then = function(fn){

        if(is(fn, 'function')) {

            this._callbacks.push(fn);

        }

        return this;

    };

    //similar to a transform stream
    function Signal(){}

    Signal.prototype._signal = function(){};

    Signal.prototype._flush = function(){};

    Signal.extend = function(obj, fn){

        var signal = function(){

            Signal.call(this);
            if(fn) fn.apply(this, arguments);

        };

        inherit(signal, Signal);

        extend(signal.prototype, obj);

        return signal;

    };

    //similar to a stream
    //returns a function that can be invoked with methods add and remove
    //calling returns a new promise only if async

    function Signals(options){

        var signals = this;

        signals._callbacks = Array.prototype.slice.call(arguments, 1);

        if(is(signals._callbacks[0], 'array')) signals._callback = signals._callback[0];

        signals._index = 0;

        signals._config = merge({

            async: true,
            flowing: false

        }, options);

        //return an extended closure
        return extend(function(){

            if(!signals._callbacks.length) return {then:function(fn){nextTick(fn);}};

            var promise = new Promise(signals._config.async),

                args = Array.prototype.slice.call(arguments),

                done = function(){

                    //first increment
                    signals._index ++;

                    //need to call the next callback or promise.then
                    if(signals._index === signals._callbacks.length) {

                        each(promise._callbacks, function(fn){ fn.call(signals); }, signals);

                        each(signals._callbacks, function(fn){ fn._flush.apply(fn, args); });

                        //reset index
                        signals._index = 0;

                    }else{

                        if(signals._config.async){

                            nextTick(tick);

                        }else{

                            tick();

                        }

                    }

                },

                tick = function(){

                    var nextSignal = signals._callbacks[signals._index];

                    nextSignal._signal.apply(nextSignal, args);

                    if(signals._config.flowing) done();

                    //return value only matters for sync callbacks
                    return signals;

                    //to support a returned promise
                    //signals._callbacks[signals._index]._signal.apply(signals._callbacks[signals._index], args).then(function(er){ if(!er) done();});

                };

            if(!signals._config.flowing) args.push(done);

            if(signals._config.async){

                nextTick(tick);
                return promise;

            }else{

                return tick();

            }

        }, signals);

    }

    //can only add instances of signal
    Signals.prototype.add = function(signal){

        if(!(signal instanceof Signal) && !(signal._signal)) throw new Error('add() requires an instance of Signal');

        this._callbacks.push(signal);

        return this;

    }

    //removes one or all signals just to keep it simple for now
    Signals.prototype.remove = function(signal){

        if(signal){

            if(is(signal, 'number')){

                this._callbacks.splice(signal, 1);

                return this;

            }

            if(!(signal instanceof Signal) && !(signal._signal)) throw new Error('remove() requires an instance of Signal');

            each(this._callbacks, function(f, i, list, exit){

                if(f === signal){

                    list.splice(i, 1);

                    return exit;

                }

            });

        }else{

            this._callbacks = [];

        }

        return this;

    };

})();

var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    bind = util.bind,
    each = util.each,
    extend = util.extend;

var arrayMethods = [
        'push',
        'splice',
        'pop'
    ],
    define = Object.defineProperty,
    defines = Object.defineProperties;

function accessors(value, key, obj){
    return {
        get: function(){
            return value;
        },
        set: function(val){

            if(is(val, 'array') || is(val, 'object')){

                val = Observer.observe(val);

            }

            value = val;

            obj._observers.dispatch(mutation({
                method: 'set',
                value: value,
                args: key
            }));
        },
        enumerable:true
    };
}

function mutation(obj){
    return extend(Object.create(null, {
        method:{
            value:null,
            writable:true,
            enumerable:true
        },
        value:{
            value: null,
            writable:true,
            enumerable:true
        }
    }), obj);
}

function Observer(watch){

    this.watch = watch;
    this.observed =  null;
    this.signal = null;

}

Observer.prototype = {

    observe: function(target){

        this.observed = Observer.observe(target);
        this.signal = this.observed._observers.add(this.watch, this);
        return this.observed;

    },

    disconnect: function(){

        this.observed._observers.remove(this.signal);

    }

};

Observer.observable = function(obj){

    if(!is(obj, 'array') && !is(obj, 'object')){

        throw new Error('failed to make target observable not an array or object');

    }

    if(obj._observers) return obj;

    if(is(obj, 'array') || typeof obj.length !== 'undefined'){

        each(arrayMethods, function(method){

            define(obj, method, {

                value:bind(function(){

                    var args = Array.prototype.slice.call(arguments),
                        value;

                    value = Array.prototype[method].apply(this, Array.prototype.slice.call(arguments));

                    this._observers.dispatch(mutation({
                        method: method,
                        value: value,
                        args: args
                    }));

                }, obj),

                enumerable:false

            });

        });

    }else{

        defines(obj, {

            add: {

                value: bind(function(key, value){

                    if(is(value, 'array') || is(value, 'object')){

                        value = Observer.observe(value);

                    }

                    define(this, key, accessors(value, key, this));

                    this._observers.dispatch(mutation({
                        method: 'add',
                        value: value,
                        args: Array.prototype.slice.call(arguments)
                    }));

                }, obj),

                enumerable:false

            },

            remove:{

                value: bind(function(key){

                    var removed;

                    if(typeof this[key] !== 'undefined'){

                        removed = this[key];

                        delete this[key];

                        this._observers.dispatch(mutation({
                            method: 'remove',
                            value:removed,
                            args: Array.prototype.slice.call(arguments)
                        }));

                    }

                }, obj),

                enumerable:false

            }

        });

    }

    define(obj, '_observers', {

        value: new Signals(),
        enumerable: false

    });

    return obj;

};

//doesn't check for subclassed arrays
Observer.observe = function(obj){

    var object;

    if(is(obj, 'object')){




        object = Observer.observable(Object.create(Object.prototype));



        each(obj, function(value, key){

            object.add(key, value);

        });

    }else if(is(obj, 'array')){

        object = Observer.observable(Object.create(Array.prototype));

        each(obj, function(value, key){

            object.push(value);

        });

    }else{

        throw new Error('param is not of type Object or Array');

    }

    return object;

};

Observer.mutation = mutation;

module.exports = Observer;

var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    bind = util.bind,
    each = util.each,
    extend = util.extend;

var arrayMethods = [
        'push',
        'unshift',
        'splice',
        'shift',
        'pop',
        'set'
    ],
    define = Object.defineProperty,
    defines = Object.defineProperties;

function observe(target){

    return (is(target, 'array') || is(target, 'object'));

}

function accessors(value, key, obj){

    return {

        get: function(){

            return value;

        },

        set: function(val){

            if(observe(val)){

                val = Observer.observe(val);

            }

            value = val;

            obj._observers.dispatch(mutation({
                method: 'set',
                value: value,
                args: key
            }));

        },

        enumerable: true,
        configurable: true

    };

}

function mutation(obj){

    return extend(Object.create(null, {

        method:{
            value: null,
            writable: true,
            enumerable: true
        },

        value:{
            value: null,
            writable: true,
            enumerable: true
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

//checks for subclassed arrays by duck typing for length
Observer.observable = function(obj){

    if(!observe(obj)){

        throw new Error('failed to make target observable not an array or object');

    }

    //return obj if already observable
    if(obj._observers) return obj;

    if(is(obj, 'array') || typeof obj.length !== 'undefined'){

        each(arrayMethods, function(method){

            define(obj, method, {

                value:bind(function(){

                    var args = Array.prototype.slice.call(arguments),
                        value;

                    //if the method adds or changes a value, need to check if array or object
                    switch(method){

                        case 'push':
                        case 'unshift':

                            each(args, function(arg, i){

                                if(observe(arg)){

                                    args[i] = Observer.observe(arg);

                                }

                            });

                            break;

                        case 'splice':

                            if(args.length > 2){

                                each(args.slice(2), function(arg, i){

                                    if(observe(arg)){

                                        args[i + 2] = Observer.observe(arg);

                                    }

                                });

                            }

                            break;

                        case 'set':

                            if(observe(args[1])){

                                args[1] = Observer.observe(args[1]);

                            }

                            break;

                    }

                    if(method === 'set'){

                        //treat set differently
                        if(typeof this[args[0]] === 'undefined'){

                            throw new Error('failed to set value at ' + args[0] + ' index does not exist');

                        }

                        this[args[0]] = value = args[1];


                    }else{

                        value = Array.prototype[method].apply(this, args);

                    }

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

                    if(typeof this[key] !== 'undefined'){

                        throw new Error('failed to add ' + key + ' already defined');

                    }

                    if(observe(value)){

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

                    if(typeof this[key] === 'undefined'){

                        throw new Error('failed to remove ' + key + ' does not exist');

                    }

                    removed = this[key];

                    if(this[key]._observers){

                        this[key]._observers.remove();

                    }

                    delete this[key];

                    this._observers.dispatch(mutation({
                        method: 'remove',
                        value:removed,
                        args: Array.prototype.slice.call(arguments)
                    }));

                }, obj),

                enumerable:false

            }

        });

    }

    defines(obj, {

        _observers: {

            value: new Signals(),

            enumerable: false

        },

        watch:{

            value: bind(function(path, watch){

                if(is(path, 'function')){

                    this._observers.add(path, this);
                    return;

                }

                var resolved = this;
                //resolve key path
                each(path.split('.'), function(key, index, list, halt){

                    if(resolved[key]){

                        resolved = resolved[key];

                    }else{

                        resolved = null;
                        return halt;

                    }

                });

                if(resolved == null || typeof resolved._observers === 'undefined'){

                    throw new Error('failed to watch value, keypath does not exist or is not observable');

                }

                resolved._observers.add(watch, this);

            }, obj),

            enumerable: false

        }


    });

    return obj;

};

//doesn't check for subclassed arrays
//returns a new observable object with enumerable keys of param
Observer.observe = function(obj){

    var object;

    if(is(obj, 'object')){

        object = Observer.observable(Object.create(Object.prototype));

        each(obj, function(value, key){

            object.add(key, value);

        });

    }else if(is(obj, 'array')){

        object = Observer.observable(Object.create(Array.prototype,  {length:{value:0, enumerable:false, writable:true}}));

        each(obj, function(value, key){

            object.push(value);

        });

    }else{

        throw new Error('param is not an Object or Array');

    }

    return object;

};

Observer.mutation = mutation;

module.exports = Observer;

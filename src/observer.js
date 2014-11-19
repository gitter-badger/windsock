var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    bind = util.bind,
    each = util.each,
    extend = util.extend;

var define = Object.defineProperty,
    defines = Object.defineProperties,
    arrayMethods = [
        'push',
        'unshift',
        'splice',
        'shift',
        'pop',
        'set'
    ];

//Returns whether or not the target is a candidate for observing
function observe(target){

    return ((is(target, 'array') || is(target, 'object')) && typeof target._observers === 'undefined');

}

function configurableProperties(obj){

    var properties = [];

    each(Object.getOwnPropertyNames(obj), function(prop){

        if( Object.getOwnPropertyDescriptor(obj, prop).configurable) properties.push(prop);

    });

    return properties;

}

//Binds a callback to specific property
function bindMutation(property, fn){

    return function(mutation){

        if(mutation.args[0] === property) fn.call(this, mutation);

    };

}

//Returns a value object for mutations
function mutation(obj){

    return extend(Object.create(null, {

        target: {
            value: null,
            writable: true,
            enumerable: true
        },

        method: {
            value: null,
            writable: true,
            enumerable: true
        },

        value: {
            value: null,
            writable: true,
            enumerable: true
        },

        args: {
            value: null,
            writable: true,
            enumerable: true
        }

    }), obj);

}

function transform(obj){
    return extend({



    }, obj);
}

function accessors(value, key, obj){

    return {

        get: function(){

            return value;

        },

        set: function(val){

            var transformedValue = transform({

                target: this,
                method: 'set',
                value: val

            }), old;

            if(observe(val) && this._recursive){

                Observer.observe(transformedValue.value);

            }

            this._transforms.dispatch(transformedValue);

            old = value;
            value = transformedValue.value;

            this._observers.dispatch(mutation({

                target: this,
                method: 'set',
                value: old,
                transformed: transformedValue.value,
                args: Array.prototype.slice.call(arguments)

            }));

        },

        enumerable: true,
        configurable: true

    };

}

function Observer(fn){

    this.bound = fn;
    this.observed = null;
    this.signal = null;

}

Observer.prototype = {

    observe: function(target){

        this.observed = Observer.observe(target);
        this.signal = this.observed._observers.add(this.bound, this);
        return this.observed;

    },

    disconnect: function(){

        this.observed._observers.remove(this.signal);

    }

};

Observer.observable = function(obj, descriptor){

    if(!observe(obj)){

        throw new Error('failed to make target observable not an array or object');

    }

    if(obj._observers) return obj;

    if(is(descriptor, 'boolean')){

        descriptor = {

            _recursive: {

                value: descriptor,
                writable: false,
                enumerable: false

            }

        };

    }

    if(is(obj, 'array') || typeof obj.length !== 'undefined'){

        each(arrayMethods, function(method){

            //TODO: performance diff between bind and closure for obj methods

            define(obj, method, {

                value: function(){

                    var args = Array.prototype.slice.call(arguments),
                        transformedValue = transform({
                            target: this,
                            method: method,
                            args: Array.prototype.slice.call(arguments)
                        }),
                        value;

                    //if the method adds or changes a value, need to check if array or object
                    switch(method){

                        case 'push':
                        case 'unshift':

                            each(transformedValue.args, function(arg, i){

                                if(observe(arg) && obj._recursive){

                                    transformedValue.args[i] = Observer.observe(arg);

                                }

                            });

                            break;

                        case 'splice':

                            if(transformedValue.args.length > 2){

                                each(transformedValue.args.slice(2), function(arg, i){

                                    if(observe(arg) && obj._recursive){

                                        transformedValue.args[i + 2] = Observer.observe(arg);

                                    }

                                });

                            }

                            break;

                        case 'set':

                            if(observe(transformedValue.args[1]) && obj._recursive){

                                transformedValue.args[1] = Observer.observe(transformedValue.args[1]);

                            }

                            break;

                    }

                    this._transforms.dispatch(transformedValue);

                    if(method === 'set'){

                        //treat set differently
                        if(typeof obj[transformedValue.args[0]] === 'undefined'){

                            throw new Error('failed to set value at ' + transformedValue.args[0] + ' index does not exist');

                        }

                        obj[transformedValue.args[0]] = value = transformedValue.args[1];


                    }else{

                        value = Array.prototype[method].apply(obj, transformedValue.args);

                    }

                    obj._observers.dispatch(mutation({

                        target: obj,
                        method: method,
                        value: value,
                        transformed: transformedValue.value,
                        args: args

                    }));

                },

                enumerable:false

            });

        });

    }else{

        defines(obj, {

            add: {

                value: function(key, value){

                    /**
                     * Value object to hold transform value
                     * @type {Object}
                     */
                    var transformedValue = transform({

                        target: this,
                        method: 'add',
                        value: value

                    });

                    if(typeof this[key] !== 'undefined'){

                        throw new Error('failed to add ' + key + ' already defined');

                    }

                    if(observe(value) && this._recursive){

                        Observer.observe(transformedValue.value);

                    }

                    this._transforms.dispatch(transformedValue);

                    define(this, key, accessors(transformedValue.value, key, obj));

                    this._observers.dispatch(mutation({

                        target: this,
                        method: 'add',
                        value: value,
                        transformed: transformedValue.value,
                        args: Array.prototype.slice.call(arguments)

                    }));

                },

                enumerable: false

            },

            remove:{

                value: function(key){

                    var removed;

                    if(typeof obj[key] === 'undefined'){

                        throw new Error('failed to remove ' + key + ' does not exist');

                    }

                    removed = obj[key];

                    if(obj[key]._observers){

                        obj[key]._observers.remove();

                    }

                    delete obj[key];

                    obj._observers.dispatch(mutation({

                        target: obj,
                        method: 'remove',
                        value: removed,
                        args: Array.prototype.slice.call(arguments)

                    }));

                },

                enumerable:false

            }

        });

    }


    /**
     * Define non enumerable properties to object
     * @type {Object}
     */
    defines(obj, extend({

        _transforms: {

            value: new Signals,

            enumerable: false

        },

        _observers: {

            value: new Signals,

            enumerable: false

        },

        _recursive: {

            value: true,

            writable: false,

            enumerable: false

        },

        bind: {

            value: function(path, fn){

                if(is(path, 'function')){

                    this._observers.add(path, this);
                    return;

                }

                var resolved = this,
                    property;

                each(path.split('.'), function(key, index, list, halt){

                    if(index === list.length - 1){

                        property = key;
                        return halt;

                    }else if(resolved[key]){

                        resolved = resolved[key];

                    }else{

                        resolved = null;
                        return halt;

                    }

                });

                if(resolved == null || typeof resolved._observers === 'undefined'){

                    throw new Error('failed to bind value, keypath does not exist or is not observable');

                }

                resolved._observers.add(bindMutation(property, fn), this);

            },

            enumerable: false

        }


    }, descriptor));

    return obj;

};

Observer.observe = function(obj, fn){

    each(configurableProperties(obj), function(key){

        if(observe(obj[key])){

            Observer.observe(obj[key]);

        }

        //isNAN lol
        //redefine the configurable property if not an array index
        if(typeof obj.length === 'undefined' || isNaN(key)) define(obj, key, accessors(obj[key], key, obj));

    });

    Observer.observable(obj);

    if(fn) obj.bind(fn);

    return obj;

};

Observer.mutation = mutation;

module.exports = Observer;

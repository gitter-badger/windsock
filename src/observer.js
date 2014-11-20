var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    bind = util.bind,
    each = util.each,
    merge = util.merge,
    extend = util.extend;

var define = Object.defineProperty,
    defines = Object.defineProperties,
    arrayMutatorMethods = [
        'push',
        'unshift',
        'splice',
        'shift',
        'pop',
        'set'
    ];

/**
 * Returns whether or not the target is a candidate for observing
 *
 * @param {Object|Array} target
 */

function isObservable(target){

    return ((is(target, 'array') || is(target, 'object')) && typeof target._observers === 'undefined');

}

/**
 * Returns the configurable property keys of an object
 *
 * @param {Object|Array} target
 * @return {Array}
 */

function configurableProperties(target){

    var properties = [];

    each(Object.getOwnPropertyNames(target), function(prop){

        if(Object.getOwnPropertyDescriptor(target, prop).configurable) properties.push(prop);

    });

    return properties;

}

/**
* Returns a new mutation value object
*
* @param {Object} obj
* @return {Object}
*/

function mutation(obj){

    return merge({

        target: null,
        method: null,
        args: null,
        value: null,
        transformed: null

    }, obj);

}

/**
 *Loops an array of objects and transforms them if observable
 *
 * @param {Array} array
 */

function observeEach(array){

    each(array, function mutationArgumentIterator(target){

        if(isObservable(target)) Observer.observe(target);

    });

}

/**
 *Defines proxied mutate methods on an array
 *
 * @param {Array} array
 */

function observableArray(array){

    each(arrayMutatorMethods, function arrayMutatorMethodIterator(method){

        define(array, method, {

            value: function(){

                var mutationObject = mutation({
                        target: this,
                        method: method,
                        args: Array.prototype.slice.call(arguments)
                    });

                switch(method){

                    case 'push':
                    case 'unshift':

                        if(this._recursive) observeEach(mutationObject.args);

                    break;

                    case 'splice':

                        if(mutationObject.args.length > 2 && this._recursive) observeEach(mutationObject.args.slice(2));

                    break;

                    case 'set':

                        if(isObservable(mutationObject.args[1]) && this._recursive) Observer.observe(mutationObject.args[1]);

                    break;

                }

                this._transforms.dispatch(mutationObject);

                if(method === 'set'){

                    if(typeof this[mutationObject.args[0]] === 'undefined'){

                        throw new Error('failed to set value at ' + mutationObject.args[0] + ' index does not exist');

                    }

                    this[mutationObject.args[0]] = mutationObject.args[1];


                }else{

                    mutationObject.value = Array.prototype[method].apply(this, mutationObject.args);

                }

                this._observers.dispatch(mutationObject);

            }

        });

    });

}

/**
 * Sets the property of an object in the context of a mutation
 *
 * @param {String} key
 * @param {*} value
 * @param {Object} target
 * @param {String} method
 */

function setValue(key, value, target, method){

    var mutationObject = mutation({
        target: target,
        method: method,
        args: Array.prototype.slice.call(arguments),
        value: value
    });

    if(isObservable(mutationObject.value) && target._recursive){

        Observer.observe(mutationObject.value);

    }

    target._transforms.dispatch(mutationObject);

    define(target, key, accessors(mutationObject.transformed || mutationObject.value, key, target));

    target._observers.dispatch(mutationObject);

}

/**
*Defines mutate methods Add/Remove on an object
*
* @param {Object} object
*/

function observableObject(object){

    defines(object, {

        add: {

            value: function(key, value){

                if(typeof this[key] !== 'undefined'){

                    throw new Error('failed to add ' + key + ' already defined');

                }

                setValue(key, value, this, 'add');

            }

        },

        remove:{

            value: function(key){

                var removed,
                    mutationObject = mutation({
                        target: this,
                        method: 'remove',
                        args: Array.prototype.slice.call(arguments)
                    });

                if(typeof this[key] === 'undefined'){

                    throw new Error('failed to remove ' + key + ' does not exist');

                }

                mutationObject.value = this[key];

                if(this[key]._observers){

                    this[key]._observers.remove();

                }

                delete this[key];

                this._observers.dispatch(mutationObject);

            }

        }

    });

}

function accessors(value, key, obj){

    return {

        get: function(){

            return value;

        },

        set: function(val){

            setValue(key, value, obj, 'set');

        },

        enumerable: true,
        configurable: true

    };

}

function bindMutation(property, fn){

    return function(mutation){

        if(mutation.args[0] === property) fn.call(this, mutation);

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

    if(!isObservable(obj)){

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

        observableArray(obj);

    }else{

        observableObject(obj);

    }

    defines(obj, extend({

        _transforms: {
            value: new Signals
        },

        _observers: {
            value: new Signals
        },

        _recursive: {
            value: true,
            writable: false
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

            }

        }

    }, descriptor));

    return obj;

};

Observer.observe = function(obj, fn){

    each(configurableProperties(obj), function configurablePropertiesIterator(key){

        if(isObservable(obj[key])){

            Observer.observe(obj[key]);

        }

        //redefine the configurable property if not an array index
        if(typeof obj.length === 'undefined' || isNaN(key)) define(obj, key, accessors(obj[key], key, obj));

    });

    Observer.observable(obj);

    if(fn) obj.bind(fn);

    return obj;

};

Observer.mutation = mutation;

module.exports = Observer;

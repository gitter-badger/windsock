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
        'fill',
        'pop',
        'push',
        'reverse',
        'shift',
        'sort',
        'splice',
        'unshift'
    ];

function dispatch(mutationRecord, signals){

    each(mutationRecord.object._observers, function(observer){

        observer[signals].dispatch(mutationRecord);

    });

}

function mutate(mutationRecord, m){

    dispatch(mutationRecord, 'transforms');

    m.call(mutationRecord);

    dispatch(mutationRecord, 'observers');

}

function mutation(obj){
    return merge({
        name:null,
        object:null,
        type:null,
        oldValue:null,
        transformed:null
    }, obj);
}

function defineAccessors(descriptor, prop, value){

    return descriptor[prop] = {

        get: function(){return value;},

        set: function(newValue){

            mutate(mutation({

                name: prop,
                object: this,
                type: 'update',
                oldValue: value,
                transformed: newValue

            }), function(){

                if(this.object._recursive) observable(this.transformed);

                value = this.transformed;

            });

        },

        enumerable: true,

        configurable: true

    };

}

function defineConfigurableProperties(descriptor, target){

    each(Object.getOwnPropertyNames(target), function(prop){

        if(descriptor._recursive) observable(target[prop]);

        if(Object.getOwnPropertyDescriptor(target, prop).configurable) defineAccessors(descriptor, prop, target[prop]);

    });

}

function observableArray(descriptor){

    each(arrayMutatorMethods, function arrayMutatorMethodIterator(method){

        descriptor[method] = {

            value: function(){

                var mutationRecord = mutation({
                        object: this,
                        type: method
                    }),
                    args = Array.prototype.slice.call(arguments);

                switch(method){

                    case 'push':

                        mutationRecord.name = this.length;

                    case 'unshift':

                        mutationRecord.name = 0;

                    break;

                    case 'splice':

                        mutationRecord.name = args[0];
                        if(args[1]) mutationRecord.oldValue = this.slice(args[0], args[0] + args[1]);

                    break;

                }

                mutationRecord.transformed = args;

                mutate(mutationRecord, function(){

                    if(this._recursive) each(this.transformed, observable);

                    Array.prototype[this.type].apply(this.object, this.transformed);

                });

                mutationRecord = null;

            },

        };

    });

}

function observableObject(descriptor){

    extend(descriptor, {

        add: {

            value: function(prop, value){

                if(!is(this[prop], 'undefined')) throw new Error('failed to add ' + prop + ' already defined');

                mutate(mutation({

                    name: prop,
                    object: this,
                    type: 'add',
                    transformed: value

                }, function(){

                    if(this.object._recursive) observable(this.transformed);

                    defines(this.object, defineAccessors({}, this.name, this.transformed));

                }));

            }

        },

        delete:{

            value: function(prop){

                if(is(this[prop], 'undefined')) throw new Error('failed to remove ' + prop + ' does not exist');

                mutate(mutation({

                    name: prop,
                    object: this,
                    type: 'delete',
                    oldValue: this[prop]

                }), function(){

                    if(this.object[this.name]._observers) each(this.object[this.name]._observers, function(observer){observer.unobserve();});

                    delete this.object[this.name];

                });

            }

        }

    });

}

function observable(target, recursive){

    if(!is(target._observers, 'undefined') || !(is(target, 'array') || is(target, 'object'))) return target;

    var descriptor = {

        _observers: {
            value: []
        },

        _recursive: {
            value: !is(recursive, 'boolean') ? true : recursive
        }

    };

    if(is(target, 'array') || !is(target.length, 'undefined')){

        observableArray(descriptor);

    }else{

        observableObject(descriptor);

    }

    defineConfigurableProperties(descriptor, target);

    defines(target, descriptor);

    return target;

}

function only(object, callback){

    return function(mutation){

        if(mutation.object === object) callback.call(this, mutation);

    };

}

function Observer(){

    this.observers = new Signals;
    this.transforms = new Signals;
    this._observed = [];
}

Observer.prototype = {

    observe: function(target, callback){

        observable(target);

        if(!this.observing(target)){

            target._observers.push(this);
            this._observed.push(target);

        }

        if(callback){

            return this.observers.add(only(target, callback), this);

        }

    },

    transform: function(target, callback){

        this.observe(target);

        if(callback){

            return this.transforms.queue(only(target, callback), this);

        }

    },

    unobserve: function(target){

        var remove = bind(function(value){

                value._observers.splice(value._observers.indexOf(this), 1);
                this._observed.splice(this._observed.indexOf(value), 1);

            }, this);

        if(target){

            remove(target);

        }else{

            this.observers.remove();
            this.transforms.remove();

            each(this._observed, remove);

        }

    },

    observing: function(target){

        return this._observed.indexOf(target) >= 0;

    }

};

module.exports = Observer;

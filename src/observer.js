var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    bind = util.bind,
    each = util.each,
    match = util.match,
    merge = util.merge,
    extend = util.extend;

var define = Object.defineProperty,
    defines = Object.defineProperties,
    ARRAY_MUTATOR_METHODS = [
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

    each(mutationRecord.object._observers, function mutationDispatchIterator(observer){

        observer[signals].dispatch(mutationRecord, observer);

    });

}

function mutate(mutationRecord, m){

    dispatch(mutationRecord, 'transforms');

    m(mutationRecord);

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

function arrayMutation(m){

    if(m.object._recursive){

        each(m.transformed, function(val){

            observable(val, true);

            observeEach(m.object._observers, val, true);

        });

    }

    //if anything is removed need to clean up _observers

    Array.prototype[m.type].apply(m.object, m.transformed);

}

function objectAddMutation(m){

    if(m.object._recursive){

        observable(m.transformed, true);

        observeEach(m.object._observers, m.transformed, true);

    }

    define(m.object, m.name, defineAccessors({}, m.name, m.transformed));

}

function objectDeleteMutation(m){

    if(m.object[m.name]._observers) {

        each(m.object[m.name]._observers, function(observer){

            observer.unobserve(m.object[m.name]);

        });

    }

    delete m.object[m.name];

}

function defineAccessors(descriptor, prop, value){

    return (descriptor[prop] = {

        get: function(){return value;},

        set: function(newValue){

            //create the mutation method in this closure to retain value param ref :)
            mutate(mutation({

                name: prop,
                object: this,
                type: 'update',
                oldValue: value,
                transformed: newValue

            }), function objectSetMutation(m){

                if(m.object._recursive){

                    observable(m.transformed, true);

                    observeEach(m.object._observers, m.transformed, true);

                }

                value = m.transformed;

            });

            //if old value was an object clean up observers

        },

        enumerable: true,

        configurable: true

    });

}

function observableArray(descriptor){

    each(ARRAY_MUTATOR_METHODS, function arrayMutatorMethodIterator(method){

        descriptor[method] = {

            value: function arrayMutationClosure(){

                var mutationRecord = mutation({
                        object: this,
                        type: method,
                        transformed: Array.prototype.slice.call(arguments)
                    }),
                    args = mutationRecord.transformed;

                switch(method){

                    case 'fill':

                        mutation.name = args[1];
                        mutationRecord.oldValue = this.slice(args[1], args[2]);

                    break;

                    case 'pop':

                        mutationRecord.name = this.length - 1;
                        mutationRecord.oldValue = this.slice(this.length - 1);

                    break;

                    case 'push':

                        mutationRecord.name = this.length;

                    break;

                    case 'shift':

                        mutationRecord.oldValue = this.slice(0, 1);

                        /* falls through */
                    case 'unshift':

                        mutationRecord.name = 0;

                    break;

                    case 'splice':

                        mutationRecord.name = args[0];
                        if(args[1]) mutationRecord.oldValue = this.slice(args[0], args[0] + args[1]);

                    break;

                }

                //mutationRecord.transformed = args;

                mutate(mutationRecord, arrayMutation);

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

                }), objectAddMutation);

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

                }), objectDeleteMutation);

            }

        }

    });

}

function observable(target, recursive){

    var props, descriptor;

    if(is(target, 'array') || is(target, 'object')){

        props = configurableProperties(target);

        if(is(target._observers, 'undefined')){

            descriptor = {

                _observers: {

                    value: []

                },

                _recursive: {

                    value: false,

                    configurable: true

                }

            };

            if(is(target, 'array') || !is(target.length, 'undefined')){

                observableArray(descriptor);

            }else{

                observableObject(descriptor);

                each(props, function(prop){

                    defineAccessors(descriptor, prop, target[prop]);

                });

            }

            defines(target, descriptor);

        }

        //target was either observable or is now observable
        if(target._recursive === false && recursive){

            Object.defineProperty(target, '_recursive', {

                value: true

            });

            each(props, function(prop){

                observable(target[prop], true);

            });

        }

    }

    return target;

}

function limit(callback, query){

    return function limitMutation(mutation, observer){

        if(match(mutation, query)) callback.call(this, mutation, observer);

    };

}

function configurableProperties(target){

    var props = [];

    each(Object.getOwnPropertyNames(target), function(prop){

        if(Object.getOwnPropertyDescriptor(target, prop).configurable) props.push(prop);

    });

    return props;

}

function observe(observer, target, recursive){

    if(!target || is(target._observers, 'undefined')) return;

    if(!observer.observing(target)){

        target._observers.push(observer);
        observer._observed.push(target);

    }

    if(recursive){

        each(configurableProperties(target), function(prop){

            observe(observer, target[prop], true);

        });

    }


}

function observeEach(observers, target, recursive){

    if(!target || is(target._observers, 'undefined')) return;

    each(observers, function observeEachIterator(observer){

        observe(observer, target, recursive);

    });

}

function Observer(root){

    this.observers = new Signals();
    this.transforms = new Signals();
    this._observed = [];
    this.root = root; //retain an optional root object to pass to all observers/transforms

}

Observer.prototype = {

    observe: function(target, recursive, callback){

        if(!target) return;

        observable(target, recursive);

        observe(this, target, recursive);

        if(callback){

            return this.observers.add(limit(callback, {object: target}), this);

        }

    },

    transform: function(target, recursive, callback){

        this.observe(target, recursive);

        if(callback){

            return this.transforms.queue(limit(callback, {object: target}), this);

        }

    },

    unobserve: function(target){

        var remove = bind(function(value){

                this.observers.each(function(signal){

                    if(signal.context === value) this.remove(signal);

                });

                this.transforms.each(function(signal){

                    if(signal.context === value) this.remove(signal);

                });

                value._observers.splice(value._observers.indexOf(this), 1);
                this._observed.splice(this._observed.indexOf(value), 1);

            }, this);

        if(target){

            remove(target);

        }else{

            this.observers.remove();
            this.transforms.remove();

            //each(this._observed, remove);
            while(this._observed.length > 0){

                remove(this._observed[this._observed.length - 1]);

            }

        }

    },

    observing: function(target){

        return this._observed.indexOf(target) >= 0;

    }

};

Observer.observable = observable;

Observer.observe = function(target, recursive, callback){

    var observer = new Observer();

    observer.observe(target, recursive, callback);

    return observer;

};

Observer.transform = function(target, recursive, callback){

    var observer = new Observer();

    observer.transform(target, recursive, callback);

    return observer;

};

Observer.unobserve = function(target){

    if(target._observers){

        each(target._observers, function(observer){

            observer.unobserve(target);

        });

    }

};

module.exports = Observer;

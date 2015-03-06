var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    merge = util.merge,
    extend = util.extend;

var ARRAY_MUTATOR_METHODS = [
        'fill',
        'pop',
        'push',
        'reverse',
        'shift',
        'sort',
        'splice',
        'unshift'
    ], arrayMutationMethods = {};

function dispatchTransforms(mutationRecord, observer){
    observer.transforms.dispatch(mutationRecord, observer);
}

function dispatchObservers(mutationRecord, observer){
    observer.observers.dispatch(mutationRecord, observer);
}

function dispatch(mutationRecord, method){
    for(var i = 0, l = mutationRecord.object._observers.length; i < l; i++){
        method(mutationRecord, mutationRecord.object._observers[i]);
    }
}

function dispatchMutation(mutationRecord, mutate){
    dispatch(mutationRecord, dispatchTransforms);
    mutate(mutationRecord);
    dispatch(mutationRecord, dispatchObservers);
}

function mutationObject(obj){
    return merge({
        name: null,
        object: null,
        type: null,
        oldValue: null,
        transformed: null
    }, obj);
}

function arrayMutation(m){
    if(m.object._recursive){
        for(var i = 0, l = m.transformed.length; i < l; i++){
            observable(m.transformed[i], true);
            observeEach(m.object._observers, m.transformed[i], true);
        }
    }
    //if anything is removed need to clean up _observers

    Array.prototype[m.type].apply(m.object, m.transformed);
}

function objectAddMutation(m){
    if(m.object._recursive){
        observable(m.transformed, true);
        observeEach(m.object._observers, m.transformed, true);
    }
    Object.defineProperty(m.object, m.name, defineAccessors({}, m.name, m.transformed));
}

function objectDeleteMutation(m){
    if(m.object[m.name]._observers) {
        for(var i = 0, l = m.object[m.name]._observers.length; i < l; i++){
            m.object[m.name]._observers[i].unobserve(m.object[m.name]);
        }
    }
    delete m.object[m.name];
}

function defineAccessors(descriptor, prop, value){
    return (descriptor[prop] = {
        get: function(){return value;},
        set: function(newValue){
            //create the mutationObject method in this closure to retain value param ref :)
            dispatchMutation(mutationObject({
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

//higher order function to retain array mutation method
function arrayMutationClosure(method){
    return function mutateArray(){
        var mutationRecord = mutationObject({
            object: this,
            type: method,
            transformed: Array.prototype.slice.call(arguments)
        }),
        args = mutationRecord.transformed;

        switch(method){
            case 'fill':
                mutationRecord.name = args[1];
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
        dispatchMutation(mutationRecord, arrayMutation);
        mutationRecord = null;
    };
}

ARRAY_MUTATOR_METHODS.forEach(function(method){
    arrayMutationMethods[method] = arrayMutationClosure(method);
});

function observableArray(descriptor){
    for(var i = 0, l = ARRAY_MUTATOR_METHODS.length; i < l; i++){
        descriptor[ARRAY_MUTATOR_METHODS[i]] = {
            value: arrayMutationMethods[ARRAY_MUTATOR_METHODS[i]]
        };
    }
}

function _add(prop, value){
    if(!is(this[prop], 'undefined')) throw new Error('failed to add ' + prop + ' already defined');
    dispatchMutation(mutationObject({
        name: prop,
        object: this,
        type: 'add',
        transformed: value
    }), objectAddMutation);
}

function _delete(prop){
    if(is(this[prop], 'undefined')) throw new Error('failed to remove ' + prop + ' does not exist');
    dispatchMutation(mutationObject({
        name: prop,
        object: this,
        type: 'delete',
        oldValue: this[prop]
    }), objectDeleteMutation);
}

function observableObject(descriptor){
    extend(descriptor, {
        add: {
            value: _add
        },
        delete:{
            value: _delete
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
                for(var i = 0, l = props.length; i < l; i++){
                    defineAccessors(descriptor, props[i], target[props[i]]);
                }
            }
            Object.defineProperties(target, descriptor);
        }
        //target was either observable or is now observable
        if(target._recursive === false && recursive) observableProperties(target, props);
    }
    return target;
}

function observableProperties(target, props){
    Object.defineProperty(target, '_recursive', {
        value: true
    });
    for(var i = 0, l = props.length; i < l; i++){
        observable(target[props[i]], true);
    }
}

function configurableProperties(target){
    var names = Object.getOwnPropertyNames(target),
        props = [];
    for(var i = 0, l = names.length; i < l; i++){
        if(Object.getOwnPropertyDescriptor(target, names[i]).configurable) props.push(names[i]);
    }
    return props;
}

function defineObserverRelation(observer, target, recursive){
    var props;
    if(!target || is(target._observers, 'undefined')) return;
    if(!observer.observing(target)){
        target._observers.push(observer);
        observer._observed.push(target);
    }
    if(recursive){
        props = configurableProperties(target);
        for(var i = 0, l = props.length; i < l; i++){
            defineObserverRelation(observer, target[props[i]], true);
        }
    }
}

function observeEach(observers, target, recursive){
    if(!target || is(target._observers, 'undefined')) return;
    for(var i = 0, l = observers.length; i < l; i++){
        defineObserverRelation(observers[i], target, recursive);
    }
}

function limit(callback, target){
    return function limitMutationDispatch(mutation, observer){
        if(mutation.object === target) callback.call(this, mutation, observer);
    };
}

function Observer(root){
    this.observers = new Signals();
    this.transforms = new Signals();
    this._observed = [];
    //define a shared root object to pass to all observers/transforms
    this.root = root;
}

Observer.prototype = {
    observe: function(target, recursive, callback){
        if(!target) return;
        observable(target, recursive);
        defineObserverRelation(this, target, recursive);
        if(callback) return this.observers.add(limit(callback, target));
    },
    transform: function(target, recursive, callback){
        if(!target) return;
        this.observe(target, recursive);
        if(callback) return this.transforms.queue(limit(callback, target));
    },

    unobserve: function(){
        var observed;
        this.observers.remove();
        this.transforms.remove();
        while(this._observed.length > 0){
            observed = this._observed[this._observed.length - 1];
            observed._observers.splice(observed._observers.indexOf(this), 1);
            this._observed.splice(this._observed.indexOf(observed), 1);
        }
        observed = null;
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
        // each(target._observers, function(observer){
        //     observer.unobserve(target);
        // });
    }
};

module.exports = Observer;

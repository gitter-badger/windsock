var util = require('../util'),
    Signals = require('../signals'),
    Observer = require('../observer'),
    is = util.is,
    extend = util.extend,
    match = util.match,
    each = util.each;

function Node(value){

    this._events = {};

    this._observers = {

        value: new Observer(),

        events: new Observer()

    };

    this._value = extend({

        value: null,
        parent: null,
        data: {}

    }, value);

    this._observers.value.observe(this._value);

    this._observers.events.observe(this._events);

    this._observer('data');

    this._jsonml = [];

    this._compiled = false;

    this._batch = null;

    this._transclude = null;

    this._documentNode = null;

}

Node.prototype = {

    _event: function(name){

        if(!this._events[name]) this._events.add(name, new Signals());
        return this._events[name];

    },

    _observer: function(prop){

        if(is(this._value[prop], 'undefined') && is(this._observers[prop], 'undefined')) return;

        //assume the key is an observable object on this._value
        if(!this._observers[prop]) {

            this._observers[prop] = new Observer();
            this._observers[prop].observe(this._value[prop], true);

        }

        return this._observers[prop];

    },

    _dispatch: function(name, e){

        this._event(name).dispatch(e);

    },

    on: function(name, callback){

        return this._event(name).queue(callback, this);

    },

    off: function(name, signal){

        if(this._events[name]) {

            if(signal) return this._events[name].remove(signal);
            this._events.delete(name);

        }

    },

    observe: function(prop, fn){

        if(is(prop, 'function')) return this._observers.value.observers.queue(prop, this);

        return this._observer(prop).observers.queue(fn, this);

    },

    transform: function(prop, fn){

        if(is(prop, 'function')) return this._observers.value.transforms.queue(prop, this);

        return this._observer(prop).transforms.queue(fn, this);

    },

    remove: function(){

        if(this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);

    },

    append: function(node){

        node.parent = this;
        this.children.push(node);


    },

    prepend: function(node){

        node.parent = this;
        this.children.unshift(node);

    },

    before: function(node){

        if(this.parent){

            node.parent = this.parent;
            this.parent.children.splice(this.parent.children.indexOf(this), 0, node);

        }

    },

    after: function(node){

        if(this.parent){

            node.parent = this.parent;
            this.parent.children.splice(this.parent.children.indexOf(this)+1, 0, node);

        }

    },

    find: function(query){

        var result = [],
            find;

        if(!is(query, 'function')){

            if(is(query, 'string')){

                find = function(child){

                    return child.name === query;

                };

            }else if(is(query, 'object')){

                find = function(child){

                    return match(child.attributes, query);

                };

            }else{

                throw new Error('failed to find, query not supported');

            }

        }else{

            find = query;

        }

        each(this.children, function(child){

            if(find(child)) result.push(child);

            if(!is(child.children, 'undefined') && child.children.length) result = result.concat(child.find(find));

        });

        return result;

    },

    clone: function(events){

        var clone = new this.constructor(this.valueOf());

        if(events){

            each(this.events, function(signals, event){

                signals.each(function(signal){

                    clone.on(event, signal.binding);

                });

            });

        }

        if(clone.children){

            each(clone.children, function(child, i){

                clone.children.splice(i, 1, child.clone());

            });

        }

        return clone;

    },

    valueOf: function(){

        return this._value;

    },

    toJSON: function(){

        return this._jsonml;

    },

    toString: function(){

        //fragments aren't valid jsonml
        return JSON.stringify(this._jsonml);

    }

};

Object.defineProperties(Node.prototype, {

    value: {

        get: function(){

            return this._value.value;

        },

        set: function(value){

            this._value.value = value;

        },

        enumerable: true

    },

    data: {

        get: function(){

            return this._value.data;

        },

        set: function(data){

            this._value.data = data;

        },

        enumerable: true

    },

    parent: {

        get: function(){

            return this._value.parent;

        },

        set: function(parent){

            this._value.parent = parent;

        },

        enumerable: true

    },

    events:{

        get:function(){

            return this._events;

        },

        enumerable: true

    }

});

module.exports = Node;

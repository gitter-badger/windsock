var util = require('../util'),
    Signals = require('../signals'),
    Observer = require('../observer'),
    is = util.is,
    extend = util.extend,
    match = util.match,
    each = util.each;

function Node(value){

    this._events = {};

    this._value = extend({

        value: null,
        parent: null,
        data: {}

    }, value);

    this._observer = Observer.observe(this._value, false);

    this._observer.observe(this._value.data, false);

    this._jsonml = [];

    this._compiled = false;

    this._documentNode = null;

}

Node.prototype = {

    _event: function(name){

        if(!this._events[name]) this._events[name] = new Signals();
        return this._events[name];

    },

    _dispatch: function(name){

        this._event(name).dispatch.apply(undefined, Array.prototype.slice.call(arguments));

    },

    on: function(name, callback){

        return this._event(name).queue(callback, this);

    },

    off: function(name, signal){

        if(this._events[name]) this._events.remove(signal);

    },

    remove: function(){

        if(this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);

    },

    append: function(node){

        this.children.push(node);
        node.parent = this;

    },

    prepend: function(node){

        this.children.unshift(node);
        node.parent = this;

    },

    before: function(node){

        if(this.parent){

            this.parent.children.splice(this.parent.children.indexOf(this), 0, node);
            node.parent = this.parent;

        }

    },

    after: function(node){

        if(this.parent){

            this.parent.children.splice(this.parent.children.indexOf(this)+1, 0, node);
            node.parent = this.parent;

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

    clone: function(){

        var clone = new this.constructor(this.valueOf());

        if(clone.children){

            each(clone.children, function(child, i){

                clone.children.splice(i, 1, child.clone());

            });

        }

        return clone;

    },

    observe: function(fn){

        //returns an observer that observers changes to this._value
        //could be used to observe similar nodes
        return Observer.observe(this._value, false, fn);

    },

    transform: function(fn){

        return Observer.transform(this._value, false, fn);

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

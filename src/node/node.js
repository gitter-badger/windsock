var util = require('../util'),
    Signals = require('../signals'),
    Observer = require('../observer'),
    extend = util.extend;

function Node(value){

    this._events = {};

    this._value = extend({

        value: null,
        parent: null,
        data: {}

    }, value);

    this._observer = Observer.observe(this._value);

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

    clone: function(){

        return new this.constructor(this.valueOf());

    },

    valueOf: function(){

        return this._value;

    },

    toJSON: function(){

        return this._jsonml;

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

    parent: {

        get: function(){

            return this._value.parent;

        },

        set: function(parent){

            this._value.parent = parent;

        },

        enumerable: true

    },

    observers: {

        get: function(){

            return this._observer.observers;

        },

        enumerable: true

    },

    transforms: {

        get: function(){

            return this._observer.transforms;

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

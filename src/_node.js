var util = require('./util'),
    Observer = require('./observer'),
    inherit = util.inherit;

var defines = Object.defineProperties;

//An object literal module with factory methods for constructing new value objects
//representing uncompiled jsonml compliant virtual dom nodes
var node = {

    //Creates an array literal and defines property to hold reference to fragmentNode
    fragment: function(documentNode){

        return Object.create(Object.prototype, {

            documentNode: {

                value: documentNode || {},

                enumerable: true,

                writable: true

            },

        });

    },

    //Extends fragment by defining name and attribute properties
    element: function(name, attributes, documentNode){

        return defines(node.fragment(documentNode), {

            name: {

                value: name,

                enumerable: true

            },

            attributes: {

                value: attributes || {},

                enumerable: true

            }

        });

    },

    //Creates an object that represents the text value
    text: function(value, documentNode){

        return Object.create(Object.prototype, {

            documentNode: {

                value: documentNode || {},

                enumerable: false,

                writable: true

            },

            toString: {

                value: function(){

                    return this.value;

                },

                enumerable: false

            },

            valueOf: {

                value: function(){

                    return this.value;

                },

                enumerable: false

            },

            toJSON: {

                value: function(){

                    return this.value;

                },

                enumerable: false

            },

            value: {

                value: value,

                enumerable: false,

                writable: true,

                configurable: true

            }

        });

    }

};

//consider adding jsonml and observer stuff in windsock not here
//still need to have parser in here though

function Node(){
    this._jsonml = [];
    this._documentNode = null;
    this.value = Observer.observe({
        name: null,
        attributes: null,
        parent: null,

    });
    this.events = {};
}

Node.prototype = {
    _event: function(event){
        if(!this.events[event]) {
            this.events[event] = new Signals();
            if(this._documentNode) this._documentNode.addEventListener(event, this._dispatch());
        }
        return this.events[event];
    },
    _dispatch: function(){
        var _this = this;
        return function(event){
            _this._event(event.type).dispatch(event, _this);
        };
    },
    observe: function(){},
    transform: function(){},
    clone: function(){},
    find: function(){},
    append: function(){},
    prepend: function(){},
    remove: function(){},
    before: function(){},
    after: function(){},
    on: function(event, callback){

        this._event(event).queue(callback, this);

    },
    off: function(){},
    jsonml: function(){

        return JSON.stringify(this);

    },
    valueOf: function(){

        return this._jsonml;

    }
};

defines(Node.prototype, {

    parent:{
        get: function(){

        },
        set: function(parent){
            this.value.parent = parent;
        }
    },
    children:{
        get: function(){},
        set: function(){}
    }

});

function Text(){
    Node.call(this);
}

inherit(Text, Node);

function Element(){
    Node.call(this);
}

inherit(Element, Node);

function Fragment(){
    Node.call(this);
}

inherit(Fragment, Node);

module.exports = node;

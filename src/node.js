var util = require('./util'),
    is = util.is;

//An object literal module with factory methods for constructing new value objects
//representing jsonml compliant virtual dom nodes
var Node = {

    fragment: function(documentNode){

        return Object.create(Array.prototype, {

            length:{

                value: 0,

                enumerable: false,

                writable: true

            },

            documentNode: {

                value: documentNode || {},

                enumerable: false,

                writable: true

            },

        });

    },

    element: function(name, attributes, documentNode){

        return Object.create(Array.prototype, {

            length:{

                value: 0,

                enumerable: false,

                writable: true

            },

            documentNode: {

                value: documentNode || {},

                enumerable: false,

                writable: true

            },

            name: {

                get: function(){

                    return this[0];

                },

                set: function(value){

                    this.set(0, value);

                },

                enumerable: false

            },

            attributes: {

                value: attributes || {},

                enumerable: false

            }

        });

    },

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

            value:{

                value: value,

                enumerable: false,

                writable: true

            }

        });

    }

};

module.exports = Node;

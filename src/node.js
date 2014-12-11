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

module.exports = node;

var util = require('./util'),
    Observer = require('./observer'),
    each = util.each,
    is = util.is;

//Node factory object
var Node = {

    fragment: function(){

        var fragmentNode = Observer.observable( Object.create( Array.prototype, {

            length:{

                value: 0,

                enumerable: false,

                writable: true

            },

            append: {

                value: function(node){

                    return fragmentNode.push(is(node, 'string') ? Node.text(node) : Node.element.apply(undefined, Array.prototype.slice.call(arguments)));

                },

                enumerable: false

            },

            prepend: {

                value:function(node){

                    return fragmentNode.unshift(is(node, 'string') ? Node.text(node) : Node.element.apply(undefined, Array.prototype.slice.call(arguments)));

                },

                enumerable: false

            },

            find: {

                value: function(query){



                },

                enumerable: false

            }

        }), false);

        return fragmentNode;

    },

    element: function(config){

        var elementNode;

        if(typeof config.name === 'undefined' || !is(config.name, 'string')){

            throw new Error('failed to create elementNode, name must be a string');

        }

        elementNode = Observer.observable( Object.create( Array.prototype, {

            length:{

                value: 0,

                enumerable: false,

                writable: true

            },

            name: {

                get: function(){

                    return elementNode[0];

                },

                set: function(value){

                    elementNode.set(0, value);

                },

                enumerable: false

            },

            attributes: {

                value: Observer.observable(Object.create(Object.prototype), false),

                enumerable: false

            },

            children: {

                value: Node.fragment(),

                enumerable: false

            },

            documentNode: {

                value: config.documentNode || {},

                enumerable: false

            }

        }), false);

        elementNode.attributes._observers.add(function attributeObserver(mutation){

            if(Object.keys(mutation.target).length){

                if(this[1] !== mutation.target){

                    this.splice(1, 0, mutation.target);

                }else{

                    //bubble mutation to parent
                    this._observers.dispatch(mutation);

                }

            }else{

                this.splice(1, 1);

            }

        }, elementNode, -1);


        elementNode.children._observers.add(function childObserver(mutation){

            //intercept splice mutations
            if(mutation.method === 'splice'){

                //args
                mutation.args[0] = hasAttributes(this) ? mutation.args[0] + 2 : mutation.args[0] + 1;

            }

            this[mutation.method].apply(undefined, mutation.args);

        }, elementNode, -1);

        //set name
        elementNode.push(config.name);

        //set attributes
        if(config.attributes){

            each(config.attributes, function setAttribute(value, key){

                elementNode.attributes.add(key, value);

            });

        }

        return elementNode;

    },

    text: function(value){

        // var textNode = Observer.observable( Object.create( Object.prototype, {
        //
        //     toString: {
        //
        //         value: function(){
        //
        //             return this.value;
        //
        //         },
        //
        //         enumerable: false
        //
        //     },
        //
        //     value: {
        //
        //         value: value,
        //
        //         enumerable: true
        //
        //     }
        //
        // }), false);
        //
        // return textNode;

        return value;

    }

};

module.exports = Node;

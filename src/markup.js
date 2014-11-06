var util = require('./util'),
    Observer = require('./observer'),
    each = util.each,
    is = util.is;

function attributes(node){

    return is(node[1], 'object') && typeof node[1].length === 'undefined';

}

function isNode(node){

    return (is(node, 'string') || typeof node.name !== 'undefined' && node.hasOwnProperty('attributes') && typeof node.children !== 'undefined');

}

function isFragment(frag){

    return typeof frag.append !== 'undefined' && typeof frag.prepend !== 'undefined';

}

function valid(node){

    return (isNode(node) || isFragment(node));

}

function Markup(){
    
}

Markup.prototype = {

};

Markup.node = function(name){

    var node;

    if(typeof name === 'undefined' || !is(name,'string')) throw new Error('failed to create node, name must be a string');

    node = Observer.observable(Object.create(Array.prototype, {

        length:{

            value: 0,
            enumerable: false,
            writable: true

        },

        name: {

            get: function(){

                return node[0];

            },

            set: function(value){

                node.set(0, value);

            },

            enumerable: false

        },

        attributes:{
            //value: Observer.observable(Object.create(Object.prototype)),
            get: function(){

                return attributes(node) ? node[1] : undefined;

            },

            set: function(value){

                if(attributes(node)){

                    //has attributes

                    each(node[1], function(val, key){

                        node[1].remove(key);

                    });

                    each(value, function(val, key){

                        node[1].add(key, val);

                    });

                }else{

                    node.splice(1, 0, value);

                }

            },

            enumerable: false

        },

        children:{

            get: function(){

                return node.slice(attributes(node) ? 2 : 1);

            },

            set: function(value){

                //value is array of children
                value = Array.prototype.slice.call(value);

                var i = attributes(node) ? 2 : 1;

                value.unshift(i, node.length - 1);

                node.splice.apply(undefined, value);

            },

            enumerable: false

        }

    }));

    node.push(name);//kicks off mutation

    return node;

};

Markup.fragment = function(){

    var fragment = Observer.observable(Object.create(Array.prototype, {

        length:{

            value: 0,
            enumerable: false,
            writable: true

        },

        append:{

            value: function(){

                each(Array.prototype.slice.call(arguments), function(node){

                    if(valid(node)){

                        fragment.push(node);

                    }

                });

            },

            enumerable: false

        },

        prepend:{

            value: function(){

                each(Array.prototype.slice.call(arguments), function(node){

                    if(valid(node)){

                        fragment.unshift(node);

                    }

                });

            },

            enumerable: false

        }

    }));

    return fragment;

};

module.exports = Markup;

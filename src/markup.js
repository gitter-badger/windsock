var util = require('./util'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    Batch = require('./batch'),
    inherit = util.inherit,
    bind = util.bind,
    each = util.each,
    is = util.is;

function hasAttributes(node){

    return is(node[1], 'object') && typeof node[1].length === 'undefined';

}

function hasChildren(node){

    return hasAttributes(node) ? node.length > 2 : node.length > 1;

}

function isNode(node){

    return (is(node, 'string') || typeof node.name !== 'undefined' && node.hasOwnProperty('attributes') && typeof node.children !== 'undefined');

}

function isFragment(frag){

    return typeof frag.append !== 'undefined' && typeof frag.prepend !== 'undefined';

}

function element(){

    var elm;

    return {

        get: function(){

            return elm;

        },

        set: function(value){

            if(value.nodeName){

                elm = value;

            }

        },

        enumerable: false,
        configurable: true

    };

}

//markup instance is responsible for one fragment and it's decendants
//
function Markup(){

    var active, parent;

    //keep this value as private to the instance of markup
    this._fragment = Markup.fragment();

    active = this._fragment;

    //signal callbacks invoked with this constructors instance
    Parser.call(this, {

        start: function(node){

            var n = Markup.node(node); //returns an observable jsonml compliant node object

            if(node.documentElement) n.documentElement = node.documentElement;
            //active target is either a fragment or element children which is a fragment
            //append to fragment or children
            if(active.children){

                active.children.push(n); //manipulate elements children through method

            }else{

                active.push(n);

            }

            parent = active;

            active = active[active.length - 1];

        },

        content: function(text){

            if(active.children){

                active.children.push(text); //manipulate elements children through method

            }else{

                active.push(text);

            }

        },

        end:function(node, isVoid){

            var n;

            if(isVoid){

                n = Markup.node(node);

                if(node.documentElement) n.documentElement = node.documentElement;

                if(active.children){

                    active.children.push(n); //manipulate elements children through method

                }else{

                    active.push(n);

                }

            }else{

                active = parent;

            }

        }

    });

}

inherit(Markup, Parser);

//converts fragment to html string
Markup.prototype.html = function(){

    var parser = new Parser, html = [];

    parser.start.add(function(node){

        html.push('<' + node.name);

        if(node.attributes){

            each(node.attributes, function(key, value){

                if(value) value = '="' + value + '"';
                html.push(' ' + key + value);

            });

        }

        html.push('>');

    });

    parser.content.add(function(text){

        html.push(text);

    });

    parser.end.add(function(node, isVoid){

        if(isVoid){

            html.push('<' + node.name);

            if(node.attributes){

                each(node.attributes, function(key, value){

                    if(value) value = '="' + value + '"';
                    html.push(' ' + key + value);

                });

            }

            html.push('/>');

        }else{

            html.push('</' + node.name + '>');

        }

    });

    parser.parse(this._fragment);

    return html.join('');

};

//returns a jsonml compliant json string of the fragment
Markup.prototype.json = function(){

    return JSON.stringify(this._fragment);

};

//returns an actual document fragment
Markup.prototype.render = function(){

    return this._fragment.render();

};

//returns a new observable node
//@name STRING as tagname
//@name OBJECT literal as node.name, node.attributes
Markup.node = function(name, attr){

    var node;

    if(is(name, 'object')){

        attr = name.attributes;
        name = name.name;

    }

    if(typeof name === 'undefined' || !is(name, 'string')) throw new Error('failed to create node, name must be a string');

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

        documentElement: element(),

        batch: {

            value: new Batch(function(){
                console.log('batch complete');
            }),

            enumerable: false

        },

        //read only property, write with methods
        attributes: {

            value: Observer.observable(Object.create(Object.prototype)),

            enumerable: false

        },

        //read only property
        children: {

            value: Markup.fragment(),

            enumerable: false

        },

        //methods
        remove: function(){

            //removes from parent and from dom
            //if arguments - find children and invoke remove

        },

        //builds document elements
        render: function(){}

    }));

    node.push(name);

    if(attr){

        each(attr, function(val, key){

            node.attributes.add(key, val);

        });

    }

    node._observers.add(function(mutation){

        //handle mutation and reflect changes to documentElement
        console.log(mutation);

        if(this.documentElement){

            this.batch.add(bind(function(){

                //this.documentElement.setAttribute(mutation.args[0], mutation.args[1]);

            }, this));

        }

    }, node, -1); //make sure executes first

    node.attributes._observers.add(function(mutation){

        //this is node
        //mutation.target is node.attributes
        //need to know if we add or remove from node on mutation
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

    }, node, -1); //make sure this executes first

    node.children._observers.add(function(mutation){

        //intercept splice mutations
        if(mutation.method === 'splice'){

            //args
            mutation.args[0] = hasAttributes(this) ? mutation.args[0] + 2 : mutation.args[0] + 1;

        }

        this[mutation.method].apply(undefined, mutation.args);

    }, node, -1);

    return node;

};

//returns a new observable document fragment
Markup.fragment = function(){

    var fragment = Observer.observable(Object.create(Array.prototype, {

        length:{

            value: 0,
            enumerable: false,
            writable: true

        },

        append: {

            value: function(){

                fragment.push(Markup.node.apply(undefined, Array.prototype.slice.call(arguments)));

            },

            enumerable: false

        },

        documentFragment: {

            value: null,

            enumerable: false

        },

        render: {

            value:function(){

                //how to handle rendering if element already exists
            },

            enumerable: false

        },

        prepend: {

            value:function(){

                fragment.unshift(Markup.node.apply(undefined, Array.prototype.slice.call(arguments)));

            },

            enumerable: false

        },

        find: {

            value: function(query){

                var match = [];

                fragment.each(function(node){



                });

            },

            enumerable: false

        }

    }));

    return fragment;

};

module.exports = Markup;

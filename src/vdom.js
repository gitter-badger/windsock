var util = require('./util'),
    node = require('./node'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    match = util.match,
    each = util.each,
    is = util.is;

var vdom = Object.create(null);

function create(){

    var args = Array.prototype.slice.call(arguments),
        jsonml = [],
        config = {};

    if(args.length){
        if(is(args[0], 'string')){

            config.name = args[0];
            if(is(args[1],'string')){
                config.text = args[1];
            }else{
                config.attributes = args[1];
            }

        }else if(is(args[0], 'object')){
            //treat as parse event value object
            if(args[0].value) return node.text(args[0].value);
            config.name = args[0].name;
            config.attributes = args[0].attributes;
        }
    }else{
        //fragment
    }



    Object.defineProperties(jsonml, {

        name:{

            get: function(){

                return this._node.name.value;

            },
            set: function(name){

                this._node.name.value = name;

            }

        },

        attributes:{

            get: function(){

                return this._node.attributes;

            },
            set: function(attributes){

                if(this._node.name.value === null) throw new Error('failed to set attributes on fragment');

                var keys = Object.keys(attributes);

                each.call(this, this._node.attributes, function(val, prop){

                    if(!attributes[prop]) {

                        this._node.attributes.delete(prop);
                        return;
                    }

                    if(attributes[prop] !== val) this._node.attributes[prop] = attributes[prop];
                    keys.splice(keys.indexOf(prop), 1);

                });

                each.call(this, keys, function(prop){

                    this._node.attributes.add(prop, attributes[prop]);

                });

            }

        },

        children:{

            get: function(){

                return this._node.children;

            },

            set: function(node){

                this._node.children = create(node);//need to make this kick off observer

            }

        },

        text:{

            get: function(){

                return this.find(function(child){
                    return typeof child.attributes === 'undefined';
                });

            },

            set: function(value){
                if(this.text.length){
                    //remove all first
                    this.text[0].value = value;
                }else{
                    this.append(node.text(value));
                }
            }

        },

        parent:{

            value: null,
            writable: true

        },

        find:{

            value: function(query){

                var result = [],
                    find = query;

                if(!is(query, 'function')) find = function(child){
                    return match(child, query);
                };

                each(this.children, function(child){

                    if(find(child)) result.push(child);
                    if(!is(child.children, 'undefined') && child.children.length) result.concat(child.find(find));

                });

                return result;

            }

        },

        clone:{

            value: function(fn){

                return parse(this, Parser.parseJSONML);

            }

        },

        before:{

            value: function(){

                var elm = create.apply(this, Array.prototype.slice.call(arguments));

                if(!this.name){
                    this.children.unshift(elm);
                    return elm;
                }
                if(this.parent){
                    this.parent.children.splice(this.parent.children.indexOf(this), 0, elm);
                    return elm;
                }

                throw new Error('failed to resolve parent');

            }

        },

        after:{

            value: function(){

                var elm = create.apply(this, Array.prototype.slice.call(arguments));

                if(!this.name){
                    this.children.push(elm);
                    return elm;
                }
                if(this.parent){
                    this.parent.children.splice(this.parent.children.indexOf(this) + 1, 0, elm);
                    return elm;
                }

                throw new Error('failed to resolve parent');

            }

        },

        prepend:{

            value: function(){

                this.children.unshift(create.apply(this, Array.prototype.slice.call(arguments)));
                return this;

            }

        },

        append:{

            value: function(){

                this.children.push(create.apply(this, Array.prototype.slice.call(arguments)));
                return this;

            }

        },

        jsonml:{

            value:function(){}
        },

        html:{

            value:function(){}

        },

        _compiled:{

            value: false,

            writable: true

        },

        _observer:{

            value: new Observer

        },

        _node:{

            value: {

                name: {
                    value: null
                },

                attributes: {},

                children: []

            },
            configurable: true

        }

    });

    jsonml._observer.observe(jsonml._node.name, function(mutation){

        if(mutation.oldValue === null){

            jsonml.unshift(mutation.object[mutation.name]);

        }else{

            jsonml[0] = mutation.object[mutation.name];

        }

    });

    jsonml._observer.observe(jsonml._node.attributes, function(mutation){

        if(is(mutation.object, 'empty') && is(jsonml[1], 'object')){

            jsonml.splice(1, 1);

        }else if(jsonml[1] !== mutation.object){

            jsonml.splice(1, 0, mutation.object);

        }

    });

    jsonml._observer.observe(jsonml._node.children, function(mutation){

        Array.prototype[mutation.type].apply(jsonml, mutation.transformed);

    });

    if(config.name) jsonml.name = config.name;
    if(config.attributes) jsonml.attributes = config.attributes;

    return jsonml;

}

function compileJSONML(){}

function compile(jsonml){

    if(jsonml._compiled) throw new Error('failed to compile, already compiled');

    var compiled = jsonml.clone(compileJSONML);
    
    compiled._compiled = true;

}

function parse(source, method){

    var fragment = create();

    method(source, function(e){

        switch(e.type){

            case 'text':

                fragment.append(e);

            break;

            case 'start':

                fragment = fragment.after(e);

            break;

            case 'end':

                if(e.void){

                    fragment.append(e);

                }else{

                    fragment = fragment.parent;

                }

            break;

        }

    });

    return fragment;

}

vdom.parse = function(source){

    if(is(source, 'string')) return parse(source, Parser.parseHTML);

    if(source.nodeName) return parse(source.cloneNode(true), Parser.parseDOM);

    return parse(source, Parser.parseJSONML);

};

vdom.create = create;

vdom.compile = compile;

module.exports = vdom;

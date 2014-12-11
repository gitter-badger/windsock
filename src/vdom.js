var util = require('./util'),
    node = require('./node'),
    parser = require('./parser'),
    Observer = require('./observer'),
    match = util.match,
    merge = util.merge,
    each = util.each,
    is = util.is;

//the assumption is that you are creating an element
//this method returns a jsonml spec compliant virtual dom element
//inherits from Node
//Node isnt instantiated only inherited from
//text, element, fragment
//no arguments return fragment
//string
//string, object
//object convert base on type property

function attributesToString(attr){

    var attribute = '';

    for(var key in attr){

        attribute += ' ' + key;

        if(attr[key]) attribute+= '="' + attr[key] + '"';

    }

    return attribute;

}

function create(){

    var args = Array.prototype.slice.call(arguments),
        jsonml = [],
        n;

    if(!args.length) throw new Error('failed to create vdom, atleast 1 argument required');

    if(is(args[0], 'string')){

        n = node.element.apply(undefined, args);

    }else if(is(args[0], 'object')){

        try{

            n = node[args[0].type].apply(args, args.slice(1));

        }catch(e){

            throw new Error('failed to create vdom, node type does not exist');

        }

        if(args[0].type !== 'element') return n;
        //text can have: parent, before(), after(), and all other methods after jsonml
        //fragment can have everything but jsonml technically

    }

    Object.defineProperties(jsonml, {

        //accessor properties

        name:{

            get: function(){

                return this._node.name.value;

            },
            set: function(name){

                this._node.name.value = name;

            },

            enumerable: true

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
                }).join('');

            },

            set: function(value){
                if(this.text.length){

                    var textNodes = this.find(function(child){
                        return typeof child.attributes === 'undefined';
                    });

                    each(textNodes, function(text, i){
                        if(i === 0){
                            text.value = value;
                        }else{
                            text.remove();
                        }
                    });

                }else{
                    this.append({type:'text'}, value);
                }
            }

        },

        parent:{

            value: null,
            writable: true

        },

        //methods

        find:{

            value: function(query){

                var result = [],
                    find = query;

                if(!is(query, 'function')) find = function(child){
                    return match(child, query);
                };

                each(this.children, function(child){

                    if(find(child)) result.push(child);
                    if(!is(child.children, 'undefined') && child.children.length) result = result.concat(child.find(find));

                });

                return result;

            }

        },

        clone:{

            value: function(fn){

                return parse(this, parser.parseJSONML);

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

        remove:{

            value: function(){

                if(this.parent){
                    this.parent.children.splice(this.parent.children.indexOf(this), 1);
                    return this.parent
                }

            }

        },

        jsonml:{

            value:function(){

                //HAWT
                return JSON.stringify(this);

            }
        },

        html:{

            value:function(){

                var html = [];

                parser.parseJSONML(this, function(e){

                    switch(e.type){

                        case 'text':

                            html.push(e.value);

                        break;

                        case 'start':

                            html.push('<' + e.name + attributesToString(e.attributes) + '>');

                        break;

                        case 'end':

                            if(e.void){

                                html.push('<' + e.name + attributesToString(e.attributes) + '/>');

                            }else{

                                html.push('</' + e.name + '>');

                            }

                        break;

                    }

                });

                return html.join('');

            }

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

    //adding the observers should be here
    //adding the jsonml specific observers and setting initial values should be another fn

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

    jsonml.name = n.name;
    if(!is(n.attributes, 'empty')) jsonml.attributes = n.attributes;

    return jsonml;

}

function compile(jsonml){

    if(jsonml._compiled) throw new Error('failed to compile, already compiled');

    var compiled = jsonml.clone(compileJSONML);

    compiled._compiled = true;

}

exports.parse = function (source){

    var method, fragment;

    if(is(source, 'string')){

        method = parser.parseHTML;

    }else if(source.nodeName){

        method = parser.parseDOM;

    }else{

        method = parser.parseJSONML;

    }

    method(source, function(e){

        switch(e.type){

            case 'text':

                fragment.append(e);

            break;

            case 'start':

                e.type = 'element';
                fragment = fragment ? fragment.after(e) : create(e);

            break;

            case 'end':

                if(e.void){

                    e.type = 'element';
                    fragment.append(e);

                }else{

                    fragment = fragment.parent;

                }

            break;

        }

    });

    return fragment;

};

exports.create = create;

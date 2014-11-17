//windsock.js version 0.0.0
(function(){
'use strict';
require.module = Object.create(null);

function require(path, register){

    if(register){

        require.module[path] = register;

        return;

    }

    var module = Object.create(null);

    path = path.replace('./', '');

    if(require.module[path]){

        require.module[path].call(this, module);

    }else{

        throw new Error('failed to resolve module path: ' + path);

    }

    return module.exports;

}
require('batch', function(module){
var paint = require('./util').nextPaint;

function Batch(fn){

    this._done();
    this.callback = fn;

}

Batch.prototype = {

    add: function(fn){

        this.queue.push(fn);

        if(!this.requested) {

            this.id = paint(this._run, this);
            this.requested = true;

        }

    },

    cancel: function(){

        if(typeof window !== 'undefined' && window.cancelAnimationFrame) window.cancelAnimationFrame(this.id);
        this._done();

    },

    _run: function(){

        this.running = true;

        for(var i = 0; i < this.queue.length; i++){

            this.queue[i].call(this);

        }

        this._done();

    },

    _done: function(){

        this.queue = [];
        this.requested = false;
        this.running = false;
        this.id = null;
        if(this.callback) this.callback.call(this);

    }

};

module.exports = Batch;

});
require('binding', function(module){
var util = require('./util'),
    Signals = require('./signals'),
    noop = util.noop,
    merge = util.merge,
    extend = util.extend,
    each = util.each,
    accessors = util.accessors,
    define = Object.defineProperty;

function Binding(){

    

}

Binding.prototype = {};



Binding.create = function(config){

    var binding = Object.create(Object.prototype, {

        update:{

            value: new Signals,
            enumerable: false,
            writable: true

        }

    });

    config = merge({

        view: null,
        model: null,
        directive: noop

    }, config || Object.create(null));

    each(config, function(value, key){

        define(binding, key, accessors(value, function(val, last){

            binding.update.dispatch(val, last);

        }, {

            enumerable: true

        }));

    });

    return binding;

};

module.exports = Binding;

});
require('directive', function(module){
var util = require('./util'),
    extend = util.extend;

function Directive(){
    //e.g. fragmentNode of a few li's ['li'], ['li'], ['li']
    //model [1,2,3]
}

Directive.extend = function(directive){

    var e = directive.prototype.constructor;
    e.prototype = extend(Object.create(Directive.prototype), directive.prototype);
    return e;

};

Directive.prototype.init = function(view, model){

    this.view = view;
    this.model = model;

};

Directive.prototype.update = function(mutation){

    //called when model changes


};

Directive.prototype.bind = function(){

    //called once
    this.model._observers.add(this.update, this);

};

Directive.prototype.destroy = function(){

    this.model._observers.remove();

};

module.exports = Directive;

});
require('node', function(module){
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

});
require('observer', function(module){
var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    bind = util.bind,
    each = util.each,
    extend = util.extend;

var define = Object.defineProperty,
    defines = Object.defineProperties,
    arrayMethods = [
        'push',
        'unshift',
        'splice',
        'shift',
        'pop',
        'set'
    ];

//Returns whether or not the target is a candidate for observing
function observe(target){

    return ((is(target, 'array') || is(target, 'object')) && typeof target._observers === 'undefined');

}

function configurableProperties(obj){

    var properties = [];

    each(Object.getOwnPropertyNames(obj), function(prop){

        if( Object.getOwnPropertyDescriptor(obj, prop).configurable) properties.push(prop);

    });

    return properties;

}

function bindMutation(property, fn){

    return function(mutation){

        if(mutation.args[0] === property) fn.call(this, mutation);

    };

}

//Returns a value object for mutations
function mutation(obj){

    return extend(Object.create(null, {

        target: {
            value: null,
            writable: true,
            enumerable: true
        },

        method: {
            value: null,
            writable: true,
            enumerable: true
        },

        value: {
            value: null,
            writable: true,
            enumerable: true
        },

        args: {
            value: null,
            writable: true,
            enumerable: true
        }

    }), obj);

}

function accessors(value, key, obj){

    return {

        get: function(){

            return value;

        },

        set: function(val){

            if(observe(val) && obj._recursive){

                val = Observer.observe(val);

            }

            value = val;

            obj._observers.dispatch(mutation({

                target: obj,
                method: 'set',
                value: value,
                args: [key, value]

            }));

        },

        enumerable: true,
        configurable: true

    };

}

function Observer(watch){

    this.watch = watch;
    this.observed =  null;
    this.signal = null;

}

Observer.prototype = {

    observe: function(target){

        this.observed = Observer.observe(target);
        this.signal = this.observed._observers.add(this.watch, this);
        return this.observed;

    },

    disconnect: function(){

        this.observed._observers.remove(this.signal);

    }

};

Observer.observable = function(obj, descriptor){

    if(!observe(obj)){

        throw new Error('failed to make target observable not an array or object');

    }

    if(obj._observers) return obj;

    if(is(descriptor, 'boolean')){

        descriptor = {

            _recursive: {

                value: descriptor,
                writable: false,
                enumerable: false

            }

        };

    }

    if(is(obj, 'array') || typeof obj.length !== 'undefined'){

        each(arrayMethods, function(method){

            //TODO: performance diff between bind and closure for obj methods

            define(obj, method, {

                value: function(){

                    var args = Array.prototype.slice.call(arguments),
                        value;

                    //if the method adds or changes a value, need to check if array or object
                    switch(method){

                        case 'push':
                        case 'unshift':

                            each(args, function(arg, i){

                                if(observe(arg) && obj._recursive){

                                    args[i] = Observer.observe(arg);

                                }

                            });

                            break;

                        case 'splice':

                            if(args.length > 2){

                                each(args.slice(2), function(arg, i){

                                    if(observe(arg) && obj._recursive){

                                        args[i + 2] = Observer.observe(arg);

                                    }

                                });

                            }

                            break;

                        case 'set':

                            if(observe(args[1]) && obj._recursive){

                                args[1] = Observer.observe(args[1]);

                            }

                            break;

                    }

                    if(method === 'set'){

                        //treat set differently
                        if(typeof obj[args[0]] === 'undefined'){

                            throw new Error('failed to set value at ' + args[0] + ' index does not exist');

                        }

                        obj[args[0]] = value = args[1];


                    }else{

                        value = Array.prototype[method].apply(obj, args);

                    }

                    obj._observers.dispatch(mutation({

                        target: obj,
                        method: method,
                        value: value,
                        args: args

                    }));

                },

                enumerable:false

            });

        });

    }else{

        defines(obj, {

            add: {

                value: function(key, value){

                    if(typeof obj[key] !== 'undefined'){

                        throw new Error('failed to add ' + key + ' already defined');

                    }

                    if(observe(value) && obj._recursive){

                        value = Observer.observe(value);

                    }

                    define(obj, key, accessors(value, key, obj));

                    obj._observers.dispatch(mutation({

                        target: obj,
                        method: 'add',
                        value: value,
                        args: Array.prototype.slice.call(arguments)

                    }));

                },

                enumerable: false

            },

            remove:{

                value: function(key){

                    var removed;

                    if(typeof obj[key] === 'undefined'){

                        throw new Error('failed to remove ' + key + ' does not exist');

                    }

                    removed = obj[key];

                    if(obj[key]._observers){

                        obj[key]._observers.remove();

                    }

                    delete obj[key];

                    obj._observers.dispatch(mutation({

                        target: obj,
                        method: 'remove',
                        value: removed,
                        args: Array.prototype.slice.call(arguments)

                    }));

                },

                enumerable:false

            }

        });

    }

    defines(obj, extend({

        _observers: {

            value: new Signals(),

            enumerable: false

        },

        _recursive: {

            value: true,

            writable: false,

            enumerable: false

        },

        bind: {

            value: function(path, fn){

                if(is(path, 'function')){

                    this._observers.add(path, this);
                    return;

                }

                var resolved = this,
                    property;

                each(path.split('.'), function(key, index, list, halt){

                    if(index === list.length - 1){

                        property = key;
                        return halt;

                    }else if(resolved[key]){

                        resolved = resolved[key];

                    }else{

                        resolved = null;
                        return halt;

                    }

                });

                if(resolved == null || typeof resolved._observers === 'undefined'){

                    throw new Error('failed to bind value, keypath does not exist or is not observable');

                }

                resolved._observers.add(bindMutation(property, fn), this);

            },

            enumerable: false

        }


    }, descriptor || Object.create(null)));

    return obj;

};

Observer.observe = function(obj, fn){

    each(configurableProperties(obj), function(key){

        if(observe(obj[key])){

            obj[key] = Observer.observe(obj[key]);

        }

        //isNAN lol
        if(typeof obj.length === 'undefined' || isNaN(key)) define(obj, key, accessors(obj[key], key, obj));

    });

    Observer.observable(obj);

    if(fn) obj.bind(fn);

    return obj;

};

Observer.mutation = mutation;

module.exports = Observer;

});
require('parser', function(module){
var Signals = require('./signals'),
    util = require('./util'),
    lowerCase = util.lowerCase,
    extend = util.extend,
    each = util.each,
    is = util.is;

var voidTags = [
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];

var ignoreTags = [
    'script'
];

function parseTag (tag){

    var node = createNode(),

    reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)=["']([^"']+)["'])/g;

    var m = tag.match(reg);

    if(m.length > 1){

        node.attributes = Object.create(null);

    }

    for(var i = 0, l = m.length; i < l; i++){

        var keyVal = m[i].split('=');

        if(i === 0) {

            //node.name = keyVal[0].replace('/','').replace('>','').trim();
            node.name = keyVal[0].replace(/[\/>]/g, '').trim();

        }else if(keyVal.length > 1){

            node.attributes[keyVal[0].trim()] = keyVal[1].replace(/["'>]/g, '').trim();

        }else{

            node.attributes[keyVal[0].replace(/[>]/g, '').trim()] = null;

        }

    }

    return node;

}

function isVoid(tag){

    for(var i = 0, l = voidTags.length; i < l; i++){

        if(voidTags[i] === tag) return true;

    }

    return false;

}

//normalize parsed results for signals
function createNode(){

    return Object.create(null, {

        documentNode:{

            value: null,
            enumerable: true,
            writable: true

        }

    });

}

Parser.signals = ['start', 'content', 'end', 'done'];

//doesn't support xml namespaces, any type of fuzzy/predictive syntax,
//error handling, doctypes, optional closures or anything a real parser would
function Parser(callbacks){

    var selfie = this;

    //parseHTML signals
    each(Parser.signals, function registerParserSignals(name){

        selfie[name] = new Signals;

        if(typeof callbacks !== 'undefined' && typeof callbacks[name] !== 'undefined'){

            selfie[name].add(callbacks[name], selfie);

        }

    });

}

Parser.prototype.reset = function(){

    var self = this;

    each(Parser.signals, function destroyParserSignals(signals){

        self[signals].remove();

    });

};

Parser.prototype.parse = function(obj){

    if(!obj) return;

    if(is(obj, 'string')){

        //html string
        this.parseHTML(obj);

    }else if(obj.nodeName){

        //html element
        this.parseDOM(obj);

    }else{

        //jsonml compliant object
        this.parseJSONML(obj);

    }

    this.done.dispatch();

};

Parser.prototype.domChildren = function(documentNode){

    if(documentNode.hasChildNodes()){

        var childNodes = documentNode.childNodes;

        for (var i = 0, l = childNodes.length; i < l; i++) {

            this.parseDOM(childNodes[i]);

        }

    }

};

//parsers job is to take input and return as close to the same result for each as possible
Parser.prototype.parseDOM = function(documentNode){

    //heavy dom read operations
    //accepts
    //a documentElement
    //a documentFragment
    //a documentTextNode

    if(ignoreTags.indexOf(lowerCase(documentNode.nodeName)) !== -1) return;

    //fragment
    if(documentNode.nodeType == 11){

        this.domChildren(documentNode);

        return;

    }

    var node = createNode();

    node.documentNode = documentNode;

    //if text node
    if(documentNode.nodeType == 3){

        node.value = documentNode.nodeValue;
        this.content.dispatch(node);
        return;

    }

    node.name = lowerCase(documentNode.nodeName);

    if(documentNode.attributes.length){

        node.attributes = {};

        each(documentNode.attributes, function(attribute, index){

            node.attributes[attribute.name] = attribute.value;

        });

    }

    if(!isVoid(node.name)) this.start.dispatch(node);

    this.domChildren(documentNode);

    if(node.attributes && !isVoid(node.name)) delete node.attributes;

    this.end.dispatch(node, isVoid(node.name));

};

Parser.prototype.parseJSONML = function(jsonml){

    var i = 1, node;

    if((is(jsonml[0], 'array') || is(jsonml[0], 'object')) && typeof jsonml[0].length !== 'undefined'){

        this.parseJSONML(jsonml[0]);

    }else{

        node = createNode();

        node.name = jsonml[0];

        //replaced Object.prototype check in is(jsonml[1], 'object') with custom toString for text nodes
        if(jsonml.length > 1 && jsonml[1].toString() === '[object Object]'){

            i++;
            node.attributes = extend(Object.create(null), jsonml[1]);

        }

        if(!isVoid(node.name)){

            this.start.dispatch(node);

        }

    }

    while(i < jsonml.length){

        if(is(jsonml[i], 'string') || jsonml[i].nodeValue ){

            //convert to node
            this.content.dispatch(jsonml[i].toString());

        }else{

            this.parseJSONML(jsonml[i]);

        }

        i++

    }

    if(typeof node === 'undefined') return;

    if(node.attributes && !isVoid(node.name)) delete node.attributes;

    this.end.dispatch(node, isVoid(node.name));

};

Parser.prototype.parseHTML = function(markup){

    if(!markup) return;

    //nodejs buffer and remove all line breaks = dirty
    markup = markup.toString().replace(/\n/g,'').replace(/\r/g,'');

    while(markup){

        var nextTagIndex = markup.indexOf('<');

        if(nextTagIndex >= 0 ){

            //start element exists in string
            //need to convert content to node
            if(nextTagIndex > 0) this.content.dispatch(markup.substring(0, nextTagIndex));

            //set html string to index of new element to end
            markup = markup.substring(nextTagIndex);

            //grab the start tag
            var endOfTagIndex = markup.indexOf('>') + 1,
                startTag = markup.substring(0, endOfTagIndex),
                parsedTag = parseTag(startTag),
                //if not xhtml void tag check tagname for html5 valid void tags
                voidTag = (markup[startTag.length - 2] === '/') || isVoid(parsedTag.name);

            if(startTag[1] === '!'){

                //comment, ignore?
                endOfTagIndex = markup.indexOf('-->') + 1;

            }else if(startTag[1] === '/' || voidTag){

                //void tag or end tag. start is never called for void tags
                this.end.dispatch(parsedTag, voidTag);

            }else{

                //start tag
                this.start.dispatch(parsedTag);

            }

            // substring to end of tag
            markup = markup.substring(endOfTagIndex);

        }else{

            //need to convert content to node
            this.content.dispatch(markup);

            //reset
            markup = null;

        }

    }

};

module.exports = Parser;

});
require('signals', function(module){
var util = require('./util'),
    each = util.each;

function Signal(fn, context, priority){

    this.binding = fn;
    this.context = context;
    this.priority = typeof priority !== 'undefined' ? priority : 0;

}

Signal.prototype = {

    invoke: function(args){

        if(this.binding){

            return this.binding.apply(this.context, args);

        }

    }

};

//TODO - make call stack/queue configurable
function Signals(){

    this._signals = [];

}

Signals.prototype = {

    dispatch: function(){

        var args = Array.prototype.slice.call(arguments);

        each(this._signals, function invokeSignal(signal){

            if(signal.invoke(args) === false) return arguments[3];

        });

    },

    add: function(fn, context, priority){

        //signals are one to many, a signal can only belong to one signals class
        //default order is a stack
        var signal = new Signal(fn, context, priority),
            i = 0;

        while(i < this._signals.length){

            if(signal.priority <= this._signals[i].priority) break;

            i++;

        }

        this._signals.splice(i, 0, signal);

        return signal;//consider returning index of signal instead

    },

    remove: function(signal){

        if(!signal){

            this._signals = [];
            return;

        }

        //can add the same function with different context or priority
        //so pass signal ref returned by add
        var i = this._signals.indexOf(signal);

        if(i !== -1){

            this._signals.splice(i, 1);

        }

        return i;

    }

};

Signals.signal = Signal;

module.exports = Signals;

});
require('util', function(module){
var tick = (typeof process !== 'undefined' && process.nextTick) ? process.nextTick : window.setTimeout,
    paint = (typeof window !== 'undefined' && window.requestAnimationFrame) ? window.requestAnimationFrame : tick;

var Util = {

    nextTick: function(fn, context){

        //defer callback to nextTick in node.js otherwise setTimeout in the client
        return tick(Util.bind(fn, context), 1);

    },

    nextPaint: function(fn, context){

        return paint(Util.bind(fn, context), 1);

    },

    each:function(obj, fn){

        var halt = Object.create(null),
            keys;

        //duck typing ftw
        if(typeof obj.length === 'undefined'){

            keys = Object.keys(obj);

            for(var i = 0, l = keys.length; i < l; i++){

                if(fn.call(this, obj[keys[i]], keys[i], obj, halt) === halt) return;

            }

            return;

        }

        //cached length is faster
        for(var i = 0, l = obj.length; i < l; i++){

            if (fn.call(this, obj[i], i, obj, halt) === halt) return;

        }

    },

    //in order synchronous traversal
    traverse: function(list, fn){

        Util.each.call(this, list, function(result){

            var halt;

            //invoke function on result first
            halt = fn.apply(this, Array.prototype.slice.call(arguments));

            //traverse results
            if(Util.is(result, 'object') || Util.is(result, 'array')){

                Util.traverse.call(this, result, fn);

            }

            return halt;

        });

    },

    find: function(list, query){

        var assert = Util.noop,
            result;

        if(Util.is(query, 'function')){

            assert = function(){

                if(query.apply(undefined, Array.prototype.slice.call(arguments))){

                    result = arguments[2];
                    return arguments[3];

                }
            };

        }else{

            assert = function(value, key, obj, halt){

                var match = true;

                each(query, function(v, k){



                });

            };

        }

        Util.each(list, assert);

        return result;

    },

    //adds enumerable properties to object, returns that object
    extend: function(obj){

        for(var i = 1, l = arguments.length; i < l; i++){

            Util.each(arguments[i], function(value, key){

                obj[key] = value;

            });

        }

        return obj;

    },

    //overwrites enumerable properties only if they exist
    //TODO: make this an option - only if they dont exist
    merge: function(obj){

        var args = Array.prototype.slice.call(arguments, 1);

        Util.each(args, function(val, i){

            Util.each(obj, function(value, key){

                if(typeof args[i][key] !== 'undefined') obj[key] = args[i][key];

            });

        });

        return obj;

    },

    //props is a object.defineProp descriptor
    inherit: function(construct, superConstruct, props){

        //Sets the prototype of the construct to a new object created from super.
        //Uses ECMAScript 5 Object.create
        if(construct.prototype && superConstruct.prototype){

            //Use carefully: v8 creates subclasses everytime the prototype is modified.
            construct.prototype = Object.create(superConstruct.prototype, props);
            construct.prototype.constructor = construct;

        }

        return construct;

    },

    match: function(list, query){

        var matched = true;

        Util.each(query, function(val, key){

            if(list[key] !== val) matched = false;

        });

        return matched;

    },

    bind: function(fn, context){

        var args = Array.prototype.slice.call(arguments);

        return function(){

            return fn.apply(context, args.concat(Array.prototype.slice.call(arguments)));

        };

    },

    is: function(obj, type){

        switch(type){

            case 'empty':

                return Object.keys(obj).length == 0;

            default:

                break;
                
        }

        return Object.prototype.toString.call(obj) === '[object ' + Util.upperCase(type) + ']';

    },

    accessors: function(initial, fn, descriptor){

        //closure function for getter/setter value

        return Util.extend({

            get: function(){

                return initial;

            },

            set: function(value){

                var i = initial;
                initial = value;
                if(fn) fn.call(this, value, i);

            }

        }, descriptor || Object.create(null));

    },

    //Uppercase first letter
    upperCase: function(str){

        return str.replace(/[a-z]/, function(match){return match.toUpperCase();});

    },

    //Lowercase all letters
    lowerCase: function(str){

        return str.replace(/[A-Z]/g, function(match){return match.toLowerCase();});

    },

    isEmpty: function(obj){

        //converts the operands to numbers then applies strict comparison
        return Object.keys(obj).length == false;

    },

    noop: function(){}

};

module.exports = Util;

});
require('view', function(module){
var util = require('./util'),
    Node = require('./node'),
    Parser = require('./parser'),
    Batch = require('./batch'),
    traverse = util.traverse,
    each = util.each,
    is = util.is;

function View(obj){

    //private ref to virtual node
    this._node = null;
    this._batch = new Batch;

    if(obj) this._parse(obj);

}

View.prototype._compile = function(){

    //traverse this._node
    //add observers to each element to batch changes to dom nodes
    traverse.call(this, this._node, function compileView(value){

        console.log(value);

    });

};

View.prototype._parse = function(obj){

    //parse the obj and convert to virtual dom at this._node
    //takes anything compatible with parser.parse
    //a node list
    //or an array of anything compatible with parser.parse

    var parser = new Parser,
        dom = typeof obj.nodeName !== 'undefined',
        createElement,
        setActive,
        active,
        parent;



    parser.start.add(function(node){

        node = Node.element(node);

        if(is(node.documentNode, 'empty') && !dom){
            node.documentNode = document.createElement(node.name);
            if(node.attributes){
                each(node.attributes, function(value, key){
                    node.documentNode.setAttribute(key, value);
                })
            }
        }

        node.attributes._observers.add( function(mutation){

            if(mutation.method == 'remove'){

                this.documentNode.removeAttribute(mutation.args[0]);

            }else{

                this.documentNode.setAttribute(mutation.args[0], mutation.args[1]);

            }

        }, node);

        if(!this._node){

            active = this._node = node;

        }else{

            active.push(node);

            parent = active;

            active = active[active.length - 1];

        }



        if(!dom) active.documentNode.appendChild(node.documentNode);



    }, this);

    parser.content.add(function(text){

        text = Node.text(text);

        if(!dom){

            text.textNode = document.createTextNode(text.nodeValue);

        }

        text._observers.add( function(mutation){

            console.log('here');

            if(mutation.method == 'remove'){

                //remove text node

            }else{

                this.textNode.nodeValue = mutation.value;

            }

        }, text);

        active.push(text);

        if(!dom) active.documentNode.appendChild(text.textNode);

    });

    parser.end.add(function(node, isVoid){

        if(isVoid){

            node = Node.element(node);

            if(is(node.documentNode, 'empty') && !dom){
                node.documentNode = document.createElement(node.name);
                if(node.attributes){
                    each(node.attributes, function(value, key){
                        node.documentNode.setAttribute(key, value);
                    })
                }
            }

            active.push(node);

            if(!dom) active.documentNode.appendChild(node.documentNode);

        }else{

            active = parent;

        }

    });

    parser.done.add(function(){

        parser.reset();
        parser = null;

    });

    parser.parse(obj);

};

View.prototype.fragment = function(){

    return this._node;

};

View.prototype.html = function(){

    if(!this._node) return;

    var html = [],
        parser = new Parser;

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

    parser.parse(this._node);

    return html.join('');

};

View.prototype.json = function(){

    if(!this._node) return;

    return JSON.stringify(this._node, function jsonReplacer(key, value){

        if(value.nodeValue){

            return value.toString();

        }

        return value;

    });

};

View.prototype.find = function(query, target){

    var self = this, result = [];

    target = target || this._node;

    if(is(query, 'object')){

        each(target, function viewFind(element){

            var match = true;

            if(!element.attributes) return;

            each(query, function(value, key, q, halt){

                if(!element.attributes[key] || element.attributes[key] !== value){

                    match = false;
                    return halt;

                }

            });

            if(match) result.push(element);

            if(element.children.length){

                result = result.concat(self.find(query, element.children));

            }

        });

    }

    return result;

};

module.exports = View;

});
require('windsock', function(module){
var util = require('./util'),
    Signals = require('./signals'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    Directive = require('./directive'),
    Binding = require('./binding'),
    View = require('./view'),
    find = util.find,
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;


//Windsock constructor
function Windsock(options){

    options = options || Object.create(null);

    this._model = options.model || Object.create(null);

}

Windsock.prototype = {

    _setModel: function(data){

        //TODO: see if causes memory leak if no clean up of any observers on old data first
        this._model = Observer.observe(data);

    }


};

Object.defineProperty(Windsock.prototype, 'model', {

    get: function(){

        return this._model;

    },

    set: function(data){

        this._setModel(data);

    }

});



Windsock.binding = Binding;
Windsock.observer = Observer;
Windsock.view = View;
Windsock.Directive = Directive;

module.exports = Windsock;

});
window.Windsock = require('windsock');})();
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
require('markup', function(module){
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

Markup.prototype.html = function(){

    //converts fragment to html string
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

Markup.prototype.json = function(){

    return JSON.stringify(this._fragment);

};

Markup.prototype.fragment = function(){

    //converts fragment to document fragment

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

        documentFragment:{
            value:null,
            enumerable:false
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

});
require('observer', function(module){
var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    bind = util.bind,
    each = util.each,
    extend = util.extend;

var arrayMethods = [
        'push',
        'unshift',
        'splice',
        'shift',
        'pop',
        'set'
    ],
    define = Object.defineProperty,
    defines = Object.defineProperties;

//returns whether or not the target is a candidate for observing
function observe(target){

    return ((is(target, 'array') || is(target, 'object')) && typeof target._observers === 'undefined');

}

function accessors(value, key, obj){

    return {

        get: function(){

            return value;

        },

        set: function(val){

            if(observe(val)){

                val = Observer.observe(val);

            }

            value = val;

            obj._observers.dispatch(mutation({
                target: obj,
                method: 'set',
                value: value,
                args: key
            }));

        },

        enumerable: true,
        configurable: true

    };

}

function mutation(obj){

    return extend(Object.create(null, {

        target: {
            value: null,
            writable: true,
            enumerable: true
        },

        method:{
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

//checks for subclassed arrays by duck typing for length
Observer.observable = function(obj, descriptor){

    if(!observe(obj)){

        throw new Error('failed to make target observable not an array or object');

    }

    //return obj if already observable
    if(obj._observers) return obj;

    if(is(obj, 'array') || typeof obj.length !== 'undefined'){

        each(arrayMethods, function(method){

            //todo: performance diff between bind and closure for obj

            define(obj, method, {

                value:bind(function(){

                    var args = Array.prototype.slice.call(arguments),
                        value;

                    //if the method adds or changes a value, need to check if array or object
                    switch(method){

                        case 'push':
                        case 'unshift':

                            each(args, function(arg, i){

                                if(observe(arg)){

                                    args[i] = Observer.observe(arg);

                                }

                            });

                            break;

                        case 'splice':

                            if(args.length > 2){

                                each(args.slice(2), function(arg, i){

                                    if(observe(arg)){

                                        args[i + 2] = Observer.observe(arg);

                                    }

                                });

                            }

                            break;

                        case 'set':

                            if(observe(args[1])){

                                args[1] = Observer.observe(args[1]);

                            }

                            break;

                    }

                    if(method === 'set'){

                        //treat set differently
                        if(typeof this[args[0]] === 'undefined'){

                            throw new Error('failed to set value at ' + args[0] + ' index does not exist');

                        }

                        this[args[0]] = value = args[1];


                    }else{

                        value = Array.prototype[method].apply(this, args);

                    }

                    this._observers.dispatch(mutation({
                        target: this,
                        method: method,
                        value: value,
                        args: args
                    }));

                }, obj),

                enumerable:false

            });

        });

    }else{

        defines(obj, {

            add: {

                value: bind(function(key, value){

                    if(typeof this[key] !== 'undefined'){

                        throw new Error('failed to add ' + key + ' already defined');

                    }

                    if(observe(value)){

                        value = Observer.observe(value);

                    }

                    define(this, key, accessors(value, key, this));

                    this._observers.dispatch(mutation({
                        target: this,
                        method: 'add',
                        value: value,
                        args: Array.prototype.slice.call(arguments)
                    }));

                }, obj),

                enumerable:false

            },

            remove:{

                value: bind(function(key){

                    var removed;

                    if(typeof this[key] === 'undefined'){

                        throw new Error('failed to remove ' + key + ' does not exist');

                    }

                    removed = this[key];

                    if(this[key]._observers){

                        this[key]._observers.remove();

                    }

                    delete this[key];

                    this._observers.dispatch(mutation({
                        method: 'remove',
                        value:removed,
                        args: Array.prototype.slice.call(arguments)
                    }));

                }, obj),

                enumerable:false

            }

        });

    }

    defines(obj, extend({

        _observers: {

            value: new Signals(),

            enumerable: false

        },

        watch:{

            value: bind(function(path, watch){

                //wrapper function for _observers.add
                //makes sure the watch function is called with the obj as the context

                if(is(path, 'function')){

                    this._observers.add(path, this);
                    return;

                }

                var resolved = this;
                //resolve key path
                each(path.split('.'), function(key, index, list, halt){

                    if(resolved[key]){

                        resolved = resolved[key];

                    }else{

                        resolved = null;
                        return halt;

                    }

                });

                if(resolved == null || typeof resolved._observers === 'undefined'){

                    throw new Error('failed to watch value, keypath does not exist or is not observable');

                }

                resolved._observers.add(watch, this);

            }, obj),

            enumerable: false

        }


    }, descriptor || Object.create(null)));

    return obj;

};

//doesn't check for subclassed arrays
//returns a new observable object with enumerable keys of param
Observer.observe = function(obj){

    var object;

    if(is(obj, 'object')){

        object = Observer.observable(Object.create(Object.prototype));

        each(obj, function(value, key){

            object.add(key, value);

        });

    }else if(is(obj, 'array')){

        object = Observer.observable(Object.create(Array.prototype,  {length:{value:0, enumerable:false, writable:true}}));

        each(obj, function(value, key){

            object.push(value);

        });

    }else{

        throw new Error('param is not an Object or Array');

    }

    return object;

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

function createNode(){

    return Object.create(null, {

        name: {

            value: '',
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
    each(Parser.signals, function(name){

        selfie[name] = new Signals; //woa i don't even need parens

        if(typeof callbacks !== 'undefined' && typeof callbacks[name] !== 'undefined'){

            selfie[name].add(callbacks[name], selfie);

        }

    });

}

Parser.prototype.parse = function(obj){

    if(!obj) return;

    if(is(obj, 'string')){

        //treat as html
        return this.parseHTML(obj);

    }else if(obj.nodeName){

        //html element
        return this.parseDOM(obj);

    }else{

        //assume a jsonml object
        return this.parseJSONML(obj);

    }

};

Parser.prototype.parseDOM = function(element){

    //heavy dom read operations

    if(ignoreTags.indexOf(lowerCase(element.nodeName)) !== -1) return;

    var node = createNode();

    node.name = lowerCase(element.nodeName);

    node.documentElement = element;

    if(element.attributes.length){

        node.attributes = {};

        each(element.attributes, function(attribute, index){

            node.attributes[attribute.name] = attribute.value;

        });

    }

    if(!isVoid(node.name)) this.start.dispatch(node);

    if(element.hasChildNodes()){

        var childNodes = element.childNodes;

        for (var i = 0; i < childNodes.length; i++) {

            if(childNodes[i].nodeType == 1){

                this.parseDOM(childNodes[i]);

            }else if(childNodes[i].nodeType == 3) {

                this.content.dispatch(childNodes[i].nodeValue);

            }

        }

    }

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

        if(is(jsonml[1], 'object')){

            i++;
            node.attributes = extend(Object.create(null), jsonml[1]);

        }

        if(!isVoid(node.name)){

            this.start.dispatch(node);

        }

    }

    while(i < jsonml.length){

        if(is(jsonml[i], 'string')){

            this.content.dispatch(jsonml[i]);

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

            this.content.dispatch(markup);

            //reset
            markup = null;

        }

    }

    return this.done.dispatch();

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

        each(this._signals, function(signal){

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

        return signal;

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

        return paint(Util.bind(fn, context));

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

    //adds enumerable properties to object, returns that object
    extend: function(obj){

        for(var i = 1, l = arguments.length; i < l; i++){

            //Object.keys then loop
            Util.each(arguments[i], function(value, key){

                obj[key] = value;

            });

        }

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

        return function(){

            return fn.apply(context, Array.prototype.slice.call(arguments));

        };

    },

    is: function(obj, type){

        return Object.prototype.toString.call(obj) === '[object ' + Util.upperCase(type) + ']';

    },

    //Uppercase first letter
    upperCase: function(str){

        return str.replace(/[a-z]/, function(match){return match.toUpperCase();});

    },

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
require('windsock', function(module){
var util = require('./util'),
    Signals = require('./signals'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    Markup = require('./markup'),
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;

function Windsock(options){

}

Windsock.prototype = {

    parse: function(){
        //accepts am html string, dom element, jsonmlobject
        //converts to a markup object
        //sets this instance markup value
        //kicks off compile if needed
        //returns markup object

        //parser must be a part of markup module instance
        //return this.markup = Markup.apply(this, arguments);

    }

};

Windsock.util = util;

Windsock.markup = Markup;

module.exports = Windsock;

});
window.Windsock = require('windsock');})();
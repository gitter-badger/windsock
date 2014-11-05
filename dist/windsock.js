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
require('markup', function(module){
var Parser = require('./parser'),
    Signals = require('./signals'),
    util = require('./util'),
    is = util.is,
    each = util.each,
    merge = util.merge,
    extend = util.extend,
    traverse = util.traverse;

//jsonml manip and traversal
function Markup(obj, options){

    merge(this.options, options);

    this._selection = this._jsonml = [];

    var parser = new Parser(this.options.parser);

    var parseSignal = Signals.Signal.extend({

        markup: this

    }, function(fn){ this._signal = fn; });

    var tagsig = new parseSignal(function(tag, voidTag){

        //called for both start tag and end tag events
        if(voidTag || typeof voidTag === 'undefined'){

            if(voidTag){

                this.markup.append(tag);

            }else{

                this.markup.insert(tag);

            }

        }else{

            // voidtag is defined and false, close and set selection to parent
            this.markup.parent();

        }

    });

    var endtag

    var contentsig = new parseSignal(function(content){

        if(content.length){

            this.markup.append(content);

        }

    });

    parser.start.add(tagsig);
    parser.content.add(contentsig);
    parser.end.add(tagsig);

    parser.parse(obj);

}

Markup.prototype.options = {

    parser : {

        async: false,
        flowing: true

    }

};

//jsonml
Markup.prototype.each = function(fn){

    var args = Array.prototype.slice(arguments, 1);

    each.apply(this, [this._selection, fn].concat(args));

    return this;

};

Markup.prototype.traverse = function(fn, selection){

    selection = selection || this._selection;

    traverse.call(this, selection, fn);

    return this;

};

Markup.prototype.append = function(obj){

    this._selection.push(this.convert(obj));

};

//wrap for splice, optionally sets selection
Markup.prototype.insert = function(obj, i){

    var jsonml = is(obj, 'object') ? this.convert(obj) : obj,
        index = 0;

    //i should be greater than 1 if selection has attributes
    if(i && i > 0){

        Array.prototype.splice.call(this._selection, i, 0, jsonml);
        index = this._selection.length - 1;

    }else{

        index = Array.prototype.push.call(this._selection, jsonml) - 1;

    }

    if(is(jsonml, 'array')) {

        //if an array and not text node set active selection
        this._selection = this._selection[index];

    }

    return this;

};

//for now just simple convert object literal tojsonml
Markup.prototype.convert = function(obj){

    if(is(obj, 'string') || is(obj, 'array')) return obj;

    var jsonml = [];

    jsonml[0] = obj.nodeName;

    if(obj.attributes && !util.isEmpty(obj.attributes)) jsonml[1] = obj.attributes;

    // each(obj, function(val, key){

    //     util.set(jsonml, key, {
    //         value: val,
    //         writable: true,
    //         enumerable: false
    //     });

    // });

    return jsonml;

};

//markup.find('tag name')
//markup.find('attr name', 'attr value')
//markup.find({nodeName: 'h1', class: 'someClass'})
//all of these methods return a new instance of markup with exception of
//markup.find() sets current selection to entire object
//markup.find(int) sets current selection to index
Markup.prototype.find = function(query){

    if(is(query, 'number')) {
        this._selection = this._selection[query];
        return this;
    }

    if(!query) {
        this._selection = this._jsonml;
        return this;
    }

    var args = Array.prototype.slice.call(arguments);

    var queryObject = {
        nodeName:'',
        attributes: {}
    };

    if(args.length > 1){

        queryObject.attributes[args[0]] = queryObject.attributes[args[1]];

    }else if(is(query, 'string')){

        //traverse just tag names
        queryObject.nodeName = query;

    }else if(is(query, 'object')){

        //match all props
        extend(queryObject, query);

    }

    //['div','asd']
    //['br']
    //['asd',['div',{}, 'asd'],'asd',['br']]
    var match = new Markup();

    this.traverse(function(val, index, node, exit){

        if(index > 0 || is(node, 'object')) return; //skip anything past tagname

        console.log('matching');
        console.log(node);
        console.log(queryObject);

        if(queryObject.nodeName.length){

            if(node[0] !== queryObject.nodeName) return;

        }

        if(!util.isEmpty(queryObject.attributes)){

            if(!is(node[1], 'object')) return;

            if(util.match(node[1], queryObject)) {

                match.append(node);//append parent which might have kids
                console.log('match');

            }

        }else{

            match.append(node);
            console.log('match');

        }


    }, this._jsonml);

    if(match._jsonml.length) return match;

    return this;

};

Markup.prototype.replace = function(v){

    this._selection = v;
    return this;

};

//returns flat list of children
Markup.prototype.children = function(selection, qualifier){

    selection = selection || this._selection;

    qualifier = qualifier || function(){return true;};

    var sweetChidrens = [];

    each(selection, function(child){

        if(is(child, 'array') && qualifier.call(this, child)){

            sweetChidrens.push(child);

        }

    }, this);

    return new Markup(sweetChidrens, this.options);

};

//sets selection to parent of selection
Markup.prototype.parent = function(){

    this.traverse(function(node, index, parent, exit){

        if(index > 0) return; //skip anything past tagname

        var match = this.children(parent, function(child){

            if(child == this._selection) return true;
            return false;

        });

        if(match._jsonml.length){

            this._selection = parent;
            return exit;

        }

    }, this._jsonml);

    return this;

};

Markup.prototype.jsonml = function(){

    return this._jsonml;

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
        'splice',
        'pop'
    ],
    define = Object.defineProperty,
    defines = Object.defineProperties;

function accessors(value, key, obj){
    return {
        get: function(){
            return value;
        },
        set: function(val){

            if(is(val, 'array') || is(val, 'object')){

                val = Observer.observe(val);

            }

            value = val;

            obj._observers.dispatch(mutation({
                method: 'set',
                value: value,
                args: key
            }));
        },
        enumerable:true
    };
}

function mutation(obj){
    return extend(Object.create(null, {
        method:{
            value:null,
            writable:true,
            enumerable:true
        },
        value:{
            value: null,
            writable:true,
            enumerable:true
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

Observer.observable = function(obj){

    if(!is(obj, 'array') && !is(obj, 'object')){

        throw new Error('failed to make target observable not an array or object');

    }

    if(obj._observers) return obj;

    if(is(obj, 'array') || typeof obj.length !== 'undefined'){

        each(arrayMethods, function(method){

            define(obj, method, {

                value:bind(function(){

                    var args = Array.prototype.slice.call(arguments),
                        value;

                    value = Array.prototype[method].apply(this, Array.prototype.slice.call(arguments));

                    this._observers.dispatch(mutation({
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

                    if(is(value, 'array') || is(value, 'object')){

                        value = Observer.observe(value);

                    }

                    define(this, key, accessors(value, key, this));

                    this._observers.dispatch(mutation({
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

                    if(typeof this[key] !== 'undefined'){

                        removed = this[key];

                        delete this[key];

                        this._observers.dispatch(mutation({
                            method: 'remove',
                            value:removed,
                            args: Array.prototype.slice.call(arguments)
                        }));

                    }

                }, obj),

                enumerable:false

            }

        });

    }

    define(obj, '_observers', {

        value: new Signals(),
        enumerable: false

    });

    return obj;

};

//doesn't check for subclassed arrays
Observer.observe = function(obj){

    var object;

    if(is(obj, 'object')){




        object = Observer.observable(Object.create(Object.prototype));



        each(obj, function(value, key){

            object.add(key, value);

        });

    }else if(is(obj, 'array')){

        object = Observer.observable(Object.create(Array.prototype));

        each(obj, function(value, key){

            object.push(value);

        });

    }else{

        throw new Error('param is not of type Object or Array');

    }

    return object;

};

Observer.mutation = mutation;

module.exports = Observer;

});
require('parser', function(module){
var Signals = require('./signals'),
    util = require('./util'),
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

    return Object.create(null, {name:{value:'', enumerable:true, writable:true}});

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

Parser.prototype.parseDOM = function(node){

    var self = this;

    if(node.nodeName === 'SCRIPT') return;

    var attr = Object.create(null);

    each(node.attributes, function(attribute, index){

        attr[attribute.nodeName] = attribute.nodeValue;

    });

    if(node.hasChildNodes()){

        var childNodes = node.childNodes;

        for (var i = 0; i < childNodes.length; i++) {

            if(childNodes[i].nodeType == 1){

            }else if(childNodes[i].nodeType == 3) {


            }

        }

    }

};

Parser.prototype.parseJSONML = function(jsonml){

    var i = 1, node;

    if(is(jsonml[0], 'array')){

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

    this.end.dispatch(node);

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
var tick = (typeof process !== 'undefined' && process.nextTick) ? process.nextTick : window.setTimeout;

var Util = {

    nextTick: function(fn){

        //defer callback to nextTick in node.js otherwise setTimeout in the client
        tick(fn, 1);

    },

    each:function(obj, fn){

        var halt = Object.create(null),
            keys;

        //duck typing ftw
        if(!obj.length){

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

        return str.replace(/[a-z]/, function(match){return match.toUpperCase()});

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
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;

function Markup(object){

    var markup = Observer.observable(Object.create(Array.prototype));

    Object.defineProperties(markup, {

        node:{
            value: null,
            enumerable: false,
            writable: true
        },

        name:{
            get:function(){
                return markup[0];
            },
            set:function(value){
                if(!markup.length){
                    markup.add(value);
                }else{
                    markup[0] = value;//should kick off dispatch
                }
            }
        },

        attributes:{
            get:function(){
                return is(markup[1], 'object') ? markup[1] : null;
            },
            set:function(value){
                if(!markup.length){
                    throw new Error('failed to set attributes, node name undefined');
                }
                if(is(markup[1], 'object')){
                    markup[1] = value;
                }else{
                    //cant use markup.add because it will push value
                    Array.prototype.splice.call(markup, 1, 0, value);
                    markup._observers.dispatch(Observer.mutation({
                        method: 'add',
                        value: value
                    }));
                }
            },
            enumerable: false
        },

        append:{
            value: function(value){
                //value must be converted into markup object
                markup.add(Markup(value));
            }
        },

        parser:{
            value: new Parser(),
            enumerable:false,
            writable:true
        }

    });

    //add events to markup.parser

    if(object) markup.parser.parse(object);

    return markup;

}

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
        return this.markup = Markup.apply(this, arguments);

    }

};

Windsock.util = util;

module.exports = Windsock;

});
window.Windsock = require('windsock');})();
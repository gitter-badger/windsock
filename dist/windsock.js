//windsock.js version 0.0.0
(function(){
'use strict';
require.module = Object.create(null);

function registerFormat(path){
    return path.replace(/\//g,'');
}

function require(path, register){

    if(register){

        require.module[registerFormat(path)] = register;

        return;

    }

    var module = Object.create(null),
        exports = module.exports = Object.create(null);


    path = path.replace(/[\/.]/g, '');

    if(require.module[path]){

        require.module[path].call(this, module, exports);

    }else{

        throw new Error('failed to resolve module path: ' + path);

    }

    return module.exports;

}
require('batch', function(module, exports){
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
require('binding', function(module, exports){
var util = require('./util'),
    Signals = require('./signals'),
    noop = util.noop,
    merge = util.merge,
    extend = util.extend,
    each = util.each,
    accessors = util.accessors,
    define = Object.defineProperty;

function Binding(options){

    this.options = options || {};

}

Binding.prototype = {

    

};



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
require('directive', function(module, exports){
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
    //normalizes mutation and invokes callbacks accordingly


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
require('node', function(module, exports){
var defines = Object.defineProperties;

//An object literal module with factory methods for constructing new value objects
//representing uncompiled jsonml compliant virtual dom nodes
var node = {

    //Creates an array literal and defines property to hold reference to fragmentNode
    fragment: function(documentNode){

        return defines([], {

            documentNode: {

                value: documentNode || {},

                enumerable: false,

                writable: true

            },

        });

    },

    //Extends fragment by defining name and attribute properties
    element: function(name, attributes, documentNode){

        var elm = defines(node.fragment(documentNode), {

            name: {

                value: name,

                enumerable: false,

                configurable: true

            },

            attributes: {

                value: attributes || {},

                enumerable: false,

                configurable: true

            }

        });

        elm.push(name);

        if(attributes) elm.push(attributes);

        return elm;

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

});
require('observer', function(module, exports){
var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    bind = util.bind,
    each = util.each,
    match = util.match,
    merge = util.merge,
    extend = util.extend;

var define = Object.defineProperty,
    defines = Object.defineProperties,
    arrayMutatorMethods = [
        'fill',
        'pop',
        'push',
        'reverse',
        'shift',
        'sort',
        'splice',
        'unshift'
    ];

function dispatch(mutationRecord, signals){

    each(mutationRecord.object._observers, function(observer){

        observer[signals].dispatch(mutationRecord);

    });

}

function mutate(mutationRecord, m){

    dispatch(mutationRecord, 'transforms');

    m.call(mutationRecord);

    dispatch(mutationRecord, 'observers');

}

function mutation(obj){

    return merge({

        name:null,
        object:null,
        type:null,
        oldValue:null,
        transformed:null

    }, obj);

}

function defineAccessors(descriptor, prop, value){

    return descriptor[prop] = {

        get: function(){return value;},

        set: function(newValue){

            mutate(mutation({

                name: prop,
                object: this,
                type: 'update',
                oldValue: value,
                transformed: newValue

            }), function(){

                if(this.object._recursive) observable(this.transformed);

                value = this.transformed;

            });

        },

        enumerable: true,

        configurable: true

    };

}

function defineConfigurableProperties(descriptor, target){

    each(Object.getOwnPropertyNames(target), function(prop){

        if(descriptor._recursive) observable(target[prop]);

        if(Object.getOwnPropertyDescriptor(target, prop).configurable) defineAccessors(descriptor, prop, target[prop]);

    });

}

function observableArray(descriptor){

    each(arrayMutatorMethods, function arrayMutatorMethodIterator(method){

        descriptor[method] = {

            value: function(){

                var mutationRecord = mutation({
                        object: this,
                        type: method
                    }),
                    args = Array.prototype.slice.call(arguments);

                switch(method){

                    case 'fill':

                        mutation.name = args[1];
                        mutationRecord.oldValue = this.slice(args[1], args[2]);

                    break;

                    case 'pop':

                        mutationRecord.name = this.length - 1;
                        mutationRecord.oldValue = this.slice(this.length - 1);

                    break

                    case 'push':

                        mutationRecord.name = this.length;

                    break;

                    case 'shift':

                        mutationRecord.oldValue = this.slice(0, 1);

                    case 'unshift':

                        mutationRecord.name = 0;

                    break;

                    case 'splice':

                        mutationRecord.name = args[0];
                        if(args[1]) mutationRecord.oldValue = this.slice(args[0], args[0] + args[1]);

                    break;

                }

                mutationRecord.transformed = args;

                mutate(mutationRecord, function(){

                    if(this._recursive) each(this.transformed, observable);

                    Array.prototype[this.type].apply(this.object, this.transformed);

                });

                mutationRecord = null;

            },

        };

    });

}

function observableObject(descriptor){

    extend(descriptor, {

        add: {

            value: function(prop, value){

                if(!is(this[prop], 'undefined')) throw new Error('failed to add ' + prop + ' already defined');

                mutate(mutation({

                    name: prop,
                    object: this,
                    type: 'add',
                    transformed: value

                }), function(){

                    if(this.object._recursive) observable(this.transformed);

                    define(this.object, this.name, defineAccessors({}, this.name, this.transformed));

                });

            }

        },

        delete:{

            value: function(prop){

                if(is(this[prop], 'undefined')) throw new Error('failed to remove ' + prop + ' does not exist');

                mutate(mutation({

                    name: prop,
                    object: this,
                    type: 'delete',
                    oldValue: this[prop]

                }), function(){

                    if(this.object[this.name]._observers) each(this.object[this.name]._observers, function(observer){observer.unobserve();});

                    delete this.object[this.name];

                });

            }

        }

    });

}

function observable(target, recursive){

    if(is(target, 'null') || !is(target._observers, 'undefined') || !(is(target, 'array') || is(target, 'object'))) return target;

    var descriptor = {

        _observers: {
            value: []
        },

        _recursive: {
            value: !is(recursive, 'boolean') ? true : recursive
        }

    };

    if(is(target, 'array') || !is(target.length, 'undefined')){

        observableArray(descriptor);

    }else{

        observableObject(descriptor);

    }

    defineConfigurableProperties(descriptor, target);

    defines(target, descriptor);

    return target;

}

function only(object, callback){

    return function(mutation){

        if(mutation.object === object) callback.call(this, mutation);

    };

}

function limit(callback, query){

    return function(mutation){

        if(match(mutation, query)) callback.call(this, mutation);

    };

}

function Observer(){

    this.observers = new Signals;
    this.transforms = new Signals;
    this._observed = [];
}

Observer.prototype = {

    observe: function(target, callback){

        observable(target);

        if(!this.observing(target)){

            target._observers.push(this);
            this._observed.push(target);

        }

        if(callback){

            return this.observers.add(limit(callback, {object: target}), target);

        }

    },

    transform: function(target, callback){

        this.observe(target);

        if(callback){

            return this.transforms.queue(limit(callback, {object: target}), target);

        }

    },

    unobserve: function(target){

        var remove = bind(function(value){

                this.observers.each(function(signal){

                    if(signal.context === value) this.remove(signal);

                });

                this.transforms.each(function(signal){

                    if(signal.context === value) this.remove(signal);

                });

                value._observers.splice(value._observers.indexOf(this), 1);
                this._observed.splice(this._observed.indexOf(value), 1);

            }, this);

        if(target){

            remove(target);

        }else{

            this.observers.remove();
            this.transforms.remove();

            each(this._observed, remove);

        }

    },

    observing: function(target){

        return this._observed.indexOf(target) >= 0;

    }

};

module.exports = Observer;

});
require('parser', function(module, exports){
var util = require('./util'),
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
    ],

    ignoreTags = [
        'script'
    ];

function isVoid(name){

    for(var i = 0, l = voidTags.length; i < l; i++){

        if(voidTags[i] === name) return true;

    }

    return false;

}

function eventValueObject(options){

    return extend({

        type: null

    }, options || {});

}

function hasChildren(source, callback){

   if(source.hasChildNodes()){

       var childNodes = source.childNodes;

       for (var i = 0, l = childNodes.length; i < l; i++) {

           parseDOM(childNodes[i], callback);

       }

   }

}

//cloneNode prior to avoid heavy dom reads
function parseDOM(source, callback){

    var node;

    if(ignoreTags.indexOf(source.nodeName.toLowerCase()) !== -1) return;

    if(source instanceof DocumentFragment){

        hasChildren(source, callback);

        return;

    }

    if(source.nodeType === 3){

        return callback(eventValueObject({

            type: 'text',

            textNode: source,

            value: source.nodeValue

        }));

    }

    node = eventValueObject({

        documentElement: source,

        name: source.nodeName.toLowerCase()

    });

    node.void = isVoid(node.name);

    if(source.attributes.length){

        node.attributes = {};

        each(source.attributes, function(attribute, index){

            node.attributes[attribute.name] = attribute.value;

        });

    }

    node.type = 'start';

    if(!node.void) callback(node);

    hasChildren(source, callback);

    if(node.attributes && !node.void) delete node.attributes;

    node.type = 'end';

    callback(node);

}

function parseJSONML(source, callback){

    var index = 1, node;

    if((is(source[0], 'array') || is(source[0], 'object')) && typeof source[0].length !== 'undefined'){

        parseJSONML(source[0], callback);

    }else{

        node = eventValueObject({

            documentElement: {},

            name: source[0]

        });

        //replaced Object.prototype check in is(source[1], 'object') with custom toString for text nodes
        if(source.length > 1 && source[1].toString() === '[object Object]'){

            index++;
            node.attributes = extend(Object.create(null), source[1]);

        }

        node.void = isVoid(node.name);

        node.type = 'start';

        if(!node.void) callback(node);

    }

    while(index < source.length){

        if(is(source[index], 'string') || source[index].value ){

            callback(eventValueObject({

                type: 'text',

                textNode: {},

                value: source.value || source[index]

            }));

        }else{

            parseJSONML(source[index], callback);

        }

        index++

    }

    if(typeof node === 'undefined') return;

    if(node.attributes && !node.void) delete node.attributes;

    node.type = 'end';

    callback(node);

}

function parseTag (tag){

    var node = eventValueObject({

        documentElement: {}

    }),

    reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)=["']([^"']+)["'])/g,

    match = tag.match(reg);

    if(match.length > 1) node.attributes = {};

    for(var i = 0, l = match.length; i < l; i++){

        var keyVal = match[i].split('=');

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

function parseHTML(source, callback){

    var endOfTagIndex,
        startTag,
        node;

    //nodejs buffer and remove all line breaks aka dirty
    source = source.toString().replace(/\n/g,'').replace(/\r/g,'');

    while(source){

        var nextTagIndex = source.indexOf('<');

        if(nextTagIndex >= 0 ){

            //start element exists in string
            //need to convert content to node
            if(nextTagIndex > 0) {

                callback(eventValueObject({

                    type: 'text',

                    textNode: {},

                    value: source.substring(0, nextTagIndex)

                }));

            }

            //set html string to index of new element to end
            source = source.substring(nextTagIndex);

            endOfTagIndex = source.indexOf('>') + 1;

            startTag = source.substring(0, endOfTagIndex);

            node = parseTag(startTag);

            //if not xhtml void tag check tagname for html5 valid void tags
            node.void = (source[startTag.length - 2] === '/') || isVoid(node.name);

            if(startTag[1] === '!'){

                //comment, ignore?
                endOfTagIndex = source.indexOf('-->') + 1;

            }else if(startTag[1] === '/' || node.void){

                //void tag or end tag. start is never called for void tags
                node.type = 'end';
                callback(node);

            }else{

                //start tag
                node.type = 'start';
                callback(node);

            }

            // substring to end of tag
            source = source.substring(endOfTagIndex);

        }else{

            callback(eventValueObject({

                type: 'text',

                textNode: {},

                value: source

            }));

            //reset
            source = null;

        }

    }

}

exports.parseDOM = parseDOM;
exports.parseJSONML = parseJSONML;
exports.parseHTML = parseHTML;

});
require('signals', function(module, exports){
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

        each(this._signals, function invokeSignal(signal){

            if(signal.invoke(args) === false) return arguments[3];

        });

    },

    add: function(fn, context, priority){

        //signals are one to many, a signal can only belong to one signals class
        //default order is a stack
        //default priority is 0
        var signal = new Signal(fn, context, priority),
            i = 0;

        while(i < this._signals.length){

            if(signal.priority <= this._signals[i].priority) break;

            i++;

        }

        this._signals.splice(i, 0, signal);

        return signal;//consider returning index of signal instead

    },

    queue: function(fn, context){

        return this.add(fn, context, this._signals.length);

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

    },

    each: function(fn){

        each.call(this, this._signals, fn);

    }

};

Signals.signal = Signal;

module.exports = Signals;

});
require('util', function(module, exports){
var tick = (typeof process !== 'undefined' && process.nextTick) ? process.nextTick : window.setTimeout,
    paint = (typeof window !== 'undefined' && window.requestAnimationFrame) ? window.requestAnimationFrame : tick;

var util = {

    nextTick: function(fn, context){

        //defer callback to nextTick in node.js otherwise setTimeout in the client
        return tick(util.bind(fn, context), 1);

    },

    nextPaint: function(fn, context){

        return paint(util.bind(fn, context), 1);

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

        util.each.call(this, list, function(result){

            var halt;

            //invoke function on result first
            halt = fn.apply(this, Array.prototype.slice.call(arguments));

            //traverse results
            if(util.is(result, 'object') || util.is(result, 'array')){

                util.traverse.call(this, result, fn);

            }

            return halt;

        });

    },

    find: function(list, query){

        var assert = util.noop,
            result;

        if(util.is(query, 'function')){

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

        util.each(list, assert);

        return result;

    },

    //adds enumerable properties to object, returns that object
    extend: function(obj){

        for(var i = 1, l = arguments.length; i < l; i++){

            if(arguments[i]) util.each(arguments[i], function(value, key){

                obj[key] = value;

            });

        }

        return obj;

    },

    //overwrites enumerable properties only if they exist
    //TODO: make this an option - only if they dont exist
    merge: function(obj){

        var args = Array.prototype.slice.call(arguments, 1);

        util.each(args, function mergeArgIterator(val, i){

            util.each(obj, function mergeTargetKeyIterator(value, key){

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

        util.each(query, function(val, key){

            if(list[key] !== val) matched = false;

        });

        return matched;

    },

    bind: function(fn, context){

        var args = Array.prototype.slice.call(arguments, 2);

        return function(){

            return fn.apply(context, args.concat(Array.prototype.slice.call(arguments)));

        };

    },

    is: function(obj, type){

        switch(type){

            case 'empty':

                return Object.keys(obj).length == 0;

            case 'undefined':

                return typeof obj === 'undefined';

            case 'null':

                return obj === null;

            default:

                return Object.prototype.toString.call(obj) === '[object ' + util.capitalize(type) + ']';

        }

    },

    accessors: function(initial, fn, descriptor){

        //closure function for getter/setter value

        return util.extend({

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
    capitalize: function(str){

        return str.replace(/[a-z]/, function(match){return match.toUpperCase();});

    },

    isEmpty: function(obj){

        //converts the operands to numbers then applies strict comparison
        return Object.keys(obj).length == false;

    },

    noop: function(){}

};

module.exports = util;

});
require('vdom', function(module, exports){
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

});
require('view', function(module, exports){
var util = require('./util'),
    node = require('./node'),
    parser = require('./parser'),
    Observer = require('./observer'),
    Batch = require('./batch'),
    traverse = util.traverse,
    bind = util.bind,
    each = util.each,
    is = util.is;

//Instance of view is a jsonml spec compliant virtual dom
//Mutations on nodes are observed and batched for dom manipulation
//API:
//var jsonml = View.parser.parse(source)
//Parses markup source and converts it to an array
//
//View.compile(jsonml)
//Compiles observers to batch changes

//var fragment = View.render(jsonml)
//Compiles and returns the parent document fragment

function View(obj){}

View.parser = parser;

function bind(element){

    if(!element.name && !element.value && element.length){

        each(element, View.parser.bind);

    }

    Observer.observe(element);

}

function parse(e){

    if(!this.active) this.active = this;
    if(!this.parent) this.parent = this;

    switch(e.type){

        case 'text':
            this.active.push(node.text(e.value, e.textNode));
            break;
        case 'start':
            this.parent = this.active;
            this.active = this.active[this.active.push(node.element(e.name, e.attributes, e.documentElement)) - 1];
            break;
        case 'end':
            if(e.void){
                this.active.push(node.element(e.name, e.attributes, e.documentElement));
            }else{
                //set active to parent
                this.active = this.parent;
            }
            break;

    }

};

//Determines which method to use for parsing
//cloneNode is used for DOM nodes
//documentNodes are created for string and array source types
//parent node is appended to a documentFragment
//returns virtualdom
View.parser.parse = function(source){

    var virtualDOM = node.fragment(document.createDocumentFragment()),
        method;

    if(is(source, 'string')){

        method = 'parseHTML';

    }else if(source.nodeName){

        method = 'parseDOM';
        source = source.cloneNode();

    }else{

        method = 'parseJSONML';

    }

    View.parser[method].call(undefined, source, bind(parse, virtualDOM));

    delete virtualDOM.active;
    delete virtualDOM.parent;

    return virtualDOM;

};

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
require('windsock', function(module, exports){
var util = require('./util'),
    Signals = require('./signals'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    Directive = require('./directive'),
    Binding = require('./binding'),
    View = require('./view'),
    vdom = require('./vdom'),
    find = util.find,
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;

function Windsock(options){

    this.options = options = options || Object.create(null);

    this._observer = new Observer;

    if(options.model) this.model = options.model;

    if(options.view) this.view = options.view;

}

Windsock.prototype = {

    _setModel: function(data){

        if(this._model) this._observer.unobserve();
        this._observer.observe(data);
        this._model = data;

    },

    _setView: function(view){


    }


};


Object.defineProperties(Windsock.prototype, {

    model:{
        get:function(){
            return this._model;
        },
        set:function(m){
            this._setModel(m);
        },
        enumerable: true
    },
    view:{
        get:function(){
            return this._view;
        },
        set:function(v){
            this._setView(v);
        },
        enumerable: true
    }

});


Windsock.observer = Observer;

Windsock.vdom = vdom;

module.exports = Windsock;

});
require('parse/html', function(module, exports){
function attributes(attr){

    var attribute = '';

    for(var key in attr){

        attribute += ' ' + key;

        if(attr[key]) attribute+= '="' + attr[key] + '"';

    }

    return attribute;

}

//Assumes the signals share same context and have an array property 'html'
module.exports = {

    start: function(node){

        this.html.push('<' + node.name + attributes(node.attributes) + '>');

    },

    content: function(text){

        this.html.push(text.value);

    },

    end: function(node, isVoid){

        if(isVoid){

            this.html.push('<' + node.name + attributes(node.attributes) + '/>');

        }else{

            this.html.push('</' + node.name + '>');

        }

    }

};

});
window.Windsock = require('windsock');})();
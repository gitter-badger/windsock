!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.windsock=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var paint = require('./util').paint;

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

},{"./util":10}],2:[function(require,module,exports){
var util = require('./util'),
    Batch = require('./batch');

module.exports = {
    compile: function(){},
    transclude: function(){}
};

},{"./batch":1,"./util":10}],3:[function(require,module,exports){
var util = require('../util'),
    Node = require('./node'),
    Text = require('./text'),
    Observer = require('../observer'),
    is = util.is,
    each = util.each,
    match = util.match,
    inherit = util.inherit;

function Element(value){

    Node.call(this, {
        name: value.name,
        attributes: value.attributes || {},
        children: value.children || []
    });

    this._jsonml = [];

    this._value.attributes._recursive = false;
    this._value.children._recursive = false;

    //observer mutations to update _jsonml
    //these are anonymous observers
    Observer.observe(this._value.attributes)
            .observers.add(function(mutation){

                if(is(mutation.object, 'empty') && is(this._jsonml[1], 'object')){

                    this._jsonml.splice(1, 1);

                }else if(this._jsonml[1] !== mutation.object){

                    this._jsonml.splice(1, 0, mutation.object);

                }

            }, this);

    Observer.observe(this._value.children)
            .observers.add(function(mutation){

            }, this);

}

inherit(Element, Node);

Element.prototype.find = function(query){

    var result = [],
        find;

    if(!is(query, 'function')){

        if(is(query, 'string')){

            find = function(child){

                return child.name === query;

            };

        }else if(is(query, 'object')){

            find = function(child){

                return match(child.attributes, query);

            };

        }else{

            throw new Error('failed to find, query not supported');

        }

    }else{

        find = query;

    }

    each(this.children, function(child){

        if(find(child)) result.push(child);

        if(!is(child.children, 'undefined') && child.children.length) result = result.concat(child.find(find));

    });

    return result;

};

Element.prototype.toString = function(){

    //should do?
    return JSON.stringify(this._jsonml);

};

Object.defineProperties(Element.prototype, {

    name:{

        get: function(){

            return this._value.name;

        },

        set: function(name){

            this._value.name = name;

        }

    },

    attributes:{

        get: function(){

            return this._value.attributes;

        },

        set: function(attributes){

            this._value.attributes = attributes;

        }

    },

    children:{

        get: function(){

            return this._value.children;

        },

        set: function(children){

            this._value.children = children;

        }

    },

    text:{

        get: function(){

            return this.find(function(child){

                return child instanceof Text;

            }).join('');

        },

        set: function(value){

            if(this.text.length){

                var textNodes = this.find(function(child){

                    return child instanceof Text;

                });

                each(textNodes, function(text, i){

                    if(i === 0){

                        text.value = value;

                    }else{

                        text.remove();

                    }

                });

            }else{

                this.append(new Text(value));

            }

        }

    }

});

module.exports = Element;

},{"../observer":7,"../util":10,"./node":5,"./text":6}],4:[function(require,module,exports){
var util = require('../util'),
    Text = require('./text'),
    Element = require('./element'),
    is = util.is;

//factory for creating nodes
//normalize params to value objects
module.exports = {

    text: function(value){

        //text node value object is just a string :)
        return new Text(value);

    },
    
    element: function(name, attributes, children){

        if(!name) throw new Error('failed to create element, name required');

        return new Element({

            name: name,

            attributes: attributes,

            children: children

        });

    }

};

},{"../util":10,"./element":3,"./text":6}],5:[function(require,module,exports){
var util = require('../util'),
    Signals = require('../signals'),
    Observer = require('../observer'),
    extend = util.extend;

function Node(value){

    this._events = {};

    this._value = extend({

        value: null,
        parent: null,
        data: {}

    }, value);

    this._observer = Observer.observe(this._value);

    this._jsonml = [];

    this._compiled = false;

    this._documentNode = null;

}

Node.prototype = {

    _event: function(name){

        if(!this._events[name]) this._events[name] = new Signals();
        return this._events[name];

    },

    _dispatch: function(name){

        this._event(name).dispatch.apply(undefined, Array.prototype.slice.call(arguments));

    },

    on: function(name, callback){

        return this._event(name).queue(callback, this);

    },

    off: function(name, signal){

        if(this._events[name]) this._events.remove(signal);

    },

    remove: function(){

        if(this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);

    },

    append: function(node){

        this.children.push(node);
        node.parent = this;

    },

    prepend: function(node){

        this.children.unshift(node);
        node.parent = this;

    },

    before: function(node){

        if(this.parent){
            this.parent.children.splice(this.parent.children.indexOf(this), 0, node);
            node.parent = this.parent;
        }

    },

    after: function(node){

        if(this.parent){
            this.parent.children.splice(this.parent.children.indexOf(this)+1, 0, node);
            node.parent = this.parent;
        }

    },

    clone: function(){

        return new this.constructor(this.valueOf());

    },

    valueOf: function(){

        return this._value;

    },

    toJSON: function(){

        return this._jsonml;

    }

};

Object.defineProperties(Node.prototype, {

    value: {

        get: function(){

            return this._value.value;

        },

        set: function(value){

            this._value.value = value;

        },

        enumerable: true

    },

    parent: {

        get: function(){

            return this._value.parent;

        },

        set: function(parent){

            this._value.parent = parent;

        },

        enumerable: true

    },

    observers: {

        get: function(){

            return this._observer.observers;

        },

        enumerable: true

    },

    transforms: {

        get: function(){

            return this._observer.transforms;

        },

        enumerable: true

    },

    events:{

        get:function(){

            return this._events;

        },

        enumerable: true

    }

});

module.exports = Node;

},{"../observer":7,"../signals":9,"../util":10}],6:[function(require,module,exports){
var util = require('../util'),
    Node = require('./node'),
    inherit = util.inherit;

function Text(value){

    Node.call(this, {

        value: value || ''

    });

    this.observers.add(function(mutation){

        if(mutation.name === 'value') this._jsonml = mutation.object[mutation.name];

    }, this);

    this._jsonml = this._value.value;

}

inherit(Text, Node);

Text.prototype.append = function(value){

    this._value.value = this._value.value + value;

};

Text.prototype.prepend = function(value){

    this._value.value = value + this._value.value;

};

Text.prototype.valueOf = function(){

    return this._value.value;

};

Text.prototype.toString = function(){

    return this._value.value;

};

module.exports = Text;

},{"../util":10,"./node":5}],7:[function(require,module,exports){
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

    return (descriptor[prop] = {

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

    });

}

function defineConfigurableProperties(descriptor, target){

    each(Object.getOwnPropertyNames(target), function(prop){

        if(descriptor._recursive.value) observable(target[prop]);

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

                    break;

                    case 'push':

                        mutationRecord.name = this.length;

                    break;

                    case 'shift':

                        mutationRecord.oldValue = this.slice(0, 1);

                        /* falls through */
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

    if(!target || !is(target._observers, 'undefined') || !(is(target, 'array') || is(target, 'object'))) return target;

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

function limit(callback, query){

    return function(mutation){

        if(match(mutation, query)) callback.call(this, mutation);

    };

}

function Observer(){

    this.observers = new Signals();
    this.transforms = new Signals();
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

Observer.observe = function(target, callback){
    var observer = new Observer();
    observer.observe(target, callback);
    return observer;
};

Observer.unobserve = function(target){
    if(target._observers){
        each(target._observers, function(observer){
            observer.unobserve(target);
        });
    }
    return target;
};

module.exports = Observer;

},{"./signals":9,"./util":10}],8:[function(require,module,exports){
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

function parseTag (tag){

    var event = eventValueObject({

        documentElement: {}

    }),

    reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)=["']([^"']+)["'])/g,

    match = tag.match(reg);

    if(match.length > 1) event.attributes = {};

    for(var i = 0, l = match.length; i < l; i++){

        var keyVal = match[i].split('=');

        if(i === 0) {

            //event.name = keyVal[0].replace('/','').replace('>','').trim();
            event.name = keyVal[0].replace(/[\/>]/g, '').trim();

        }else if(keyVal.length > 1){

            event.attributes[keyVal[0].trim()] = keyVal[1].replace(/["'>]/g, '').trim();

        }else{

            event.attributes[keyVal[0].replace(/[>]/g, '').trim()] = null;

        }

    }

    return event;

}

//cloneNode prior to avoid heavy dom reads
function parseDOM(source, callback){

    var event;

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

    event = eventValueObject({

        documentElement: source,

        name: source.nodeName.toLowerCase()

    });

    event.void = isVoid(event.name);

    if(source.attributes.length){

        event.attributes = {};

        each(source.attributes, function(attribute){

            event.attributes[attribute.name] = attribute.value;

        });

    }

    event.type = 'start';

    if(!event.void) callback(event);

    hasChildren(source, callback);

    if(event.attributes && !event.void) delete event.attributes;

    event.type = 'end';

    callback(event);

}

function parseJSONML(source, callback){

    var index = 1, event;

    if((is(source[0], 'array') || is(source[0], 'object')) && typeof source[0].length !== 'undefined'){

        parseJSONML(source[0], callback);

    }else{

        event = eventValueObject({

            documentElement: {},

            name: source[0]

        });

        //replaced Object.prototype check in is(source[1], 'object') with custom toString for text nodes
        if(source.length > 1 && source[1].toString() === '[object Object]'){

            index++;
            event.attributes = extend(Object.create(null), source[1]);

        }

        event.void = isVoid(event.name);

        event.type = 'start';

        if(!event.void) callback(event);

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

        index++;

    }

    if(typeof event === 'undefined') return;

    if(event.attributes && !event.void) delete event.attributes;

    event.type = 'end';

    callback(event);

}

function parseHTML(source, callback){

    var endOfTagIndex,
        startTag,
        event;

    //nodejs buffer and remove all line breaks aka dirty
    source = source.toString().replace(/\n/g,'').replace(/\r/g,'');

    while(source){

        var nextTagIndex = source.indexOf('<');

        if(nextTagIndex >= 0 ){

            //start element exists in string
            //need to convert content to event
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

            event = parseTag(startTag);

            //if not xhtml void tag check tagname for html5 valid void tags
            event.void = (source[startTag.length - 2] === '/') || isVoid(event.name);

            if(startTag[1] === '!'){

                //comment, ignore?
                endOfTagIndex = source.indexOf('-->') + 1;

            }else if(startTag[1] === '/' || event.void){

                //void tag or end tag. start is never called for void tags
                event.type = 'end';
                callback(event);

            }else{

                //start tag
                event.type = 'start';
                callback(event);

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
exports.parseHTML = parseHTML;
exports.parseJSONML = parseJSONML;

},{"./util":10}],9:[function(require,module,exports){
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

},{"./util":10}],10:[function(require,module,exports){
var tick = (typeof process !== 'undefined' && process.nextTick) ? process.nextTick : window.setTimeout,
    paint = (typeof window !== 'undefined' && window.requestAnimationFrame) ? window.requestAnimationFrame : tick;

var util = {

    tick: function(fn, context){

        //defer callback to nextTick in node.js otherwise setTimeout in the client
        return tick(util.bind(fn, context), 1);

    },

    paint: function(fn, context){

        return paint(util.bind(fn, context), 1);

    },

    each: function(obj, fn){

        var halt = Object.create(null),
            keys,
            i = 0,
            l;

        //duck typing ftw
        if(typeof obj.length === 'undefined'){

            keys = Object.keys(obj);

            for(l = keys.length; i < l; i++){

                if(fn.call(this, obj[keys[i]], keys[i], obj, halt) === halt) return;

            }

            return;

        }

        //cached length is faster
        for(l = obj.length; i < l; i++){

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

    //adds enumerable properties to object, returns that object
    extend: function(obj){

        for(var i = 1, l = arguments.length; i < l; i++){

            if(arguments[i]){

                for(var key in arguments[i]){

                    obj[key] = arguments[i][key];

                }

            }

        }

        return obj;

    },

    //overwrites enumerable properties only if they exist
    //TODO: make this an option - only if they dont exist
    merge: function(obj){

        var args = Array.prototype.slice.call(arguments, 1);

        util.each(args, function mergeArgIterator(val, i){

            if(!val) return;

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

            return Object.keys(obj).length === 0;

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
        return Object.keys(obj).length === 0;

    },

    noop: function(){}

};

module.exports = util;

},{}],11:[function(require,module,exports){
var util = require('./util'),
    node = require('./node'),
    parser = require('./parser'),
    compiler = require('./compiler'),
    each = util.each,
    is = util.is;

function attributesToString(attr){

    var attribute = '';

    for(var key in attr){

        attribute += ' ' + key;

        if(attr[key]) attribute+= '="' + attr[key] + '"';

    }

    return attribute;

}

var windsock = {

    util: util,

    parse: function(source){

        //retain real document node if exists

        var method, parsed, parent;

        if(is(source, 'string')){

            method = parser.parseHTML;

        }else if(source.nodeName){

            if(source.parentNode) parent = source.parentNode;
            method = parser.parseDOM;

        }else{

            method = parser.parseJSONML;

        }

        method(source, function(e){

            var n;

            switch(e.type){

                case 'text':

                    parsed.append(node.text(e.value));

                break;

                case 'start':

                    n = node.element(e.name, e.attributes);
                    if(parsed) parsed.append(n);
                    parsed = n;

                break;

                case 'end':

                    if(e.void){

                        parsed.append(node.element(e.name, e.attributes));

                    }else{

                        if(parsed.parent) parsed = parsed.parent;

                    }

                break;

            }

            n = null;

        });

        if(parent) parsed._parentDocumentNode = parent;

        return parsed;

    },

    compile: function(node){

        var fragment = node.fragment();
        compiler.compile(fragment);
        // parser.parseNode(node, function(){
        //     //build fragment
        //     //observe and batch
        // });
        return fragment;

    },

    render: function(node){

        //optionally clone?
        return compiler.transclude(node);

    },

    jsonml: function(node){

        return JSON.stringify(node);

    },

    html: function(node){

        var html = [];

        parser.parseJSONML(node._jsonml, function(e){

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

};

windsock.node = node;

module.exports = windsock;

},{"./compiler":2,"./node":4,"./parser":8,"./util":10}]},{},[11])(11)
});
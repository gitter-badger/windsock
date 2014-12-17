!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.windsock=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var util = require('../util'),
    Node = require('./node'),
    Observer = require('../observer'),
    is = util.is,
    inherit = util.inherit;

function Element(jsonml){

    var childrenIndex = is(jsonml[1], 'object') && !(jsonml[1] instanceof Node) ? 2 : 1;

    Node.call(this, {
        name: jsonml[0],
        attributes: childrenIndex === 2 ? jsonml[1] : {},
        children: jsonml.slice(childrenIndex)
    });

    this._jsonml = jsonml;
    //observer mutations to update _jsonml
    Observer.observe(this._value.attributes)
            .observers.add(function(mutation){

                if(is(mutation.object, 'empty') && is(this._jsonml[1], 'object')){

                    this._jsonml.splice(1, 1);

                }else if(this._jsonml[1] !== mutation.object){

                    this._jsonml.splice(1, 0, mutation.object);

                }

            }, this);

}

inherit(Element, Node);

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
    }

});

Element.prototype.valueOf = function(){
    return this._jsonml;
};

Element.prototype.toJSON = function(){
    return this._jsonml;
};

Element.prototype.clone = function(){
    return new Element(this.valueOf());
};

module.exports = Element;

},{"../observer":5,"../util":8,"./node":3}],2:[function(require,module,exports){
var Text = require('./text'),
    Element = require('./element');

module.exports = {
    text: function(value){
        return new Text(value);
    },
    element: function(name){
        if(!name) throw new Error('failed to create element, name required');
        return new Element([name].concat(Array.prototype.slice.call(arguments, 1)));
    }
};

},{"./element":1,"./text":4}],3:[function(require,module,exports){
var util = require('../util'),
    Observer = require('../observer'),
    extend = util.extend;

function Node(value){

    this._value = extend({
        value: null,
        data: {}
    }, value);

    Observer.observe(this._value);

}

Node.prototype = {
    valueOf: function(){
        return this._value;
    }
};

Object.defineProperties(Node.prototype, {
    value: {
        get: function(){
            return this._value.value;
        },
        set: function(value){
            this._value.value = value;
        }
    }
});

module.exports = Node;

},{"../observer":5,"../util":8}],4:[function(require,module,exports){
var util = require('../util'),
    Node = require('./node'),
    inherit = util.inherit;

function Text(value){

    Node.call(this, {
        value: value || ''
    });

}

inherit(Text, Node);

Text.prototype.valueOf = function(){
    return this._value.value;
};

Text.prototype.toJSON = function(){
    return this._value.value;
};

Text.prototype.clone = function(){
    return new Text(this.valueOf());
};

module.exports = Text;

},{"../util":8,"./node":3}],5:[function(require,module,exports){
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

},{"./signals":7,"./util":8}],6:[function(require,module,exports){
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

        each(source.attributes, function(attribute){

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

        index++;

    }

    if(typeof node === 'undefined') return;

    if(node.attributes && !node.void) delete node.attributes;

    node.type = 'end';

    callback(node);

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
exports.parseHTML = parseHTML;
exports.parseJSONML = parseJSONML;

},{"./util":8}],7:[function(require,module,exports){
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

},{"./util":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
var node = require('./node'),
    parser = require('./parser');

function attributesToString(attr){

    var attribute = '';

    for(var key in attr){

        attribute += ' ' + key;

        if(attr[key]) attribute+= '="' + attr[key] + '"';

    }

    return attribute;

}

var windsock = {

    parse: function(source){

    },
    compile: function(){},
    render: function(){},
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

},{"./node":2,"./parser":6}]},{},[9])(9)
});
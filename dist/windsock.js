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

},{"./util":14}],2:[function(require,module,exports){
var util = require('../util'),
    Text = require('../node/text'),
    Element = require('../node/element'),
    Observer = require('../observer'),
    Batch = require('../batch'),
    each = util.each,
    is = util.is;

module.exports = function compile(node){

    var clone = node.clone(true);

    clone._transclude = node._transclude;

    node._transclude = null; // for teh memories

    compileNode(clone);

    if(clone.children) compileNodes(clone.children);

    return clone;

};

function compileNode(node){

    if(node instanceof Text){

        return compileText(node);

    }else if(node instanceof Element){

        return compileElement(node);

    }

}

function compileText(node){

    var batch = new Batch();

    node._documentNode = document.createTextNode(node.value);

    node._jsonml = node.value;

    Observer.observe(node._value, false, function(mutation){

        if(mutation.name === 'value' && mutation.object.value !== mutation.oldValue){

            batch.add(function(){

                node._documentNode.textContent = mutation.object.value;

            });

            this._jsonml = mutation.object.value;

        }

    });

    if(node.parent) node.parent._documentNode.appendChild(node._documentNode);

    node._compiled = true;

    return node;

}

function compileElement(node){

    var observer = new Observer(),
        batch = new Batch();

    node._documentNode = document.createElement(node.name);

    node._jsonml = node.children.slice();

    node._jsonml.unshift(node.name);

    if(!is(node.attributes, 'empty')) node._jsonml.splice(1, 0, node.attributes);

    observer.observe(node._value);

    observer.observe(node._value.attributes, false, function(mutation){

        if(node.attributes[mutation.name] !== mutation.oldValue){

            batch.add(function(){

                node._documentNode.setAttribute(mutation.name, mutation.object[mutation.name]);

            });

        }

        if(is(mutation.object, 'empty') && is(node._jsonml[1], 'object')){

            node._jsonml.splice(1, 1);

        }else if(node._jsonml[1] !== mutation.object){

            node._jsonml.splice(1, 0, mutation.object);

        }

    });

    observer.observe(node._children, false, function(mutation){

        //change to switch
        if(mutation.type === 'splice'){

            if(mutation.oldValue){

                each(mutation.oldValue, function batchRemoveChild(child){

                    batch.add(function(){

                        child._documentNode.parentNode.removeChild(child._documentNode);

                    });

                });

            }
            if(mutation.transformed.length === 3){

                batch.add(function(){

                    //childNodes returns live list of child nodes need this because like unshift the virtual node.children has already been manip
                    node._documentNode.insertBefore(mutation.transformed[2]._documentNode, node._documentNode.childNodes[mutation.name]);

                });

            }

        }else if(mutation.type == 'push'){

            each(mutation.transformed, function(child){

                batch.add(function(){

                    node._documentNode.appendChild(child._documentNode);

                });

            });

        }else if(mutation.type == 'unshift'){

            each(mutation.transformed, function(child){

                batch.add(function(){

                    //have to use elements first child because its already been unshifted to _children array

                    node._documentNode.insertBefore(child._documentNode, node._documentNode.firstChild);

                });

            });

        }

        var children = is(node.attributes, 'empty') ? node._jsonml.splice(1) : node._jsonml.splice(2);

        Array.prototype[mutation.type].apply(children, mutation.transformed);

        for(var i = 0, l = children.length; i < l; i++){

            node._jsonml.push(children[i]);

        }

    });

    observer.observe(node._events, false, function(mutation){

        if(mutation.type === 'add'){

            node._documentNode.addEventListener(mutation.name, function(e){

                node._dispatch(mutation.name, e);

            });

        }else if(mutation.type === 'delete'){

            node._documentNode.removeEventListener(mutation.name);

        }

    });

    each(node._events, function(signals, evt){

        node._documentNode.addEventListener(evt, function(e){

            node._dispatch(evt, e);

        });

    });

    each(node._value.attributes, function(value, key){

        node._documentNode.setAttribute(key, value);

    });

    if(node.parent) node.parent._documentNode.appendChild(node._documentNode);

    node._compiled = true;

    return node;

}

function compileNodes(nodes){

    var node;

    for(var i = 0, l = nodes.length; i < l; i++){

        node = compileNode(nodes[i]);

        if(node.children) compileNodes(node.children);

    }

}

},{"../batch":1,"../node/element":6,"../node/text":9,"../observer":10,"../util":14}],3:[function(require,module,exports){
module.exports = function(node, DOMNode){

    var parent;

    DOMNode = DOMNode || node._transclude;

    parent = DOMNode.parentNode;

    parent.insertBefore(node._documentNode, DOMNode);

    parent.removeChild(DOMNode);

    node._transclude = null;

};

},{}],4:[function(require,module,exports){
var parseJSONML = require('./parser').parseJSONML;

module.exports = function (node){

    if(!node || !node._jsonml.length) return '';

    var html = [];

    parseJSONML(JSON.parse(node.toString()), function(e){

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

};

function attributesToString(attr){

    var attribute = '';

    for(var key in attr){

        attribute += ' ' + key;

        if(attr[key]) attribute+= '="' + attr[key] + '"';

    }

    return attribute;

}

},{"./parser":11}],5:[function(require,module,exports){
var util = require('./util'),
    parse = require('./parser/parse'),
    compile = require('./compiler/compile'),
    transclude = require('./compiler/transclude'),
    node = require('./node'),
    html = require('./html'),
    Observer = require('./observer'),
    Batch = require('./batch');

module.exports = {
    util: util,
    parse: parse,
    compile: compile,
    transclude: transclude,
    html: html,
    node: node,
    Observer: Observer,
    Batch: Batch
};

},{"./batch":1,"./compiler/compile":2,"./compiler/transclude":3,"./html":4,"./node":7,"./observer":10,"./parser/parse":12,"./util":14}],6:[function(require,module,exports){
var util = require('../util'),
    Node = require('./node'),
    Text = require('./text'),
    is = util.is,
    each = util.each,
    match = util.match,
    inherit = util.inherit;

function Element(value){

    Node.call(this, value);

    this._parent = null;

    this._children = [];

}

Element.value = {

    name: '',

    attributes: {}

};

inherit(Element, Node, {

    name:{

        get: function(){

            return this._value.name;

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

            return this._children;

        },

        set: function(children){

            this._children = children;

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

                this.append(new Text({value:value}));

            }

        }

    },

    parent: {

        get: function(){

            return this._parent;

        },

        set: function(parent){

            //remove from previous parent first
            this._parent = parent;

        }

    }

});

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

                return match(child._value, query);

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

Element.prototype.remove = function(){

    if(this.parent) return this.parent.children.splice(this.parent.children.indexOf(this), 1);

};

Element.prototype.append = function(node){

    node.parent = this;
    return this.children.push(node);

};

Element.prototype.prepend = function(node){

    node.parent = this;
    return this.children.unshift(node);

};

Element.prototype.before = function(node){

    if(this.parent){

        node.parent = this.parent;
        return this.parent.children.splice(this.parent.children.indexOf(this), 0, node);

    }

};

Element.prototype.after = function(node){

    if(this.parent){

        node.parent = this.parent;
        return this.parent.children.splice(this.parent.children.indexOf(this)+1, 0, node);

    }

};

module.exports = Element;

},{"../util":14,"./node":8,"./text":9}],7:[function(require,module,exports){
var Text = require('./text'),
    Element = require('./element');

module.exports = {

    text: function(value){

        return new Text({value: value});

    },

    element: function(name, attributes){

        if(!name) throw new Error('failed to create element, name required');

        return new Element({

            name: name,

            attributes: attributes || {}

        });

    }

};

},{"./element":6,"./text":9}],8:[function(require,module,exports){
var util = require('../util'),
    Signals = require('../signals'),
    extend = util.extend,
    clone = util.clone,
    each = util.each;

function Node(value){

    this._value = extend(Object.create(this.constructor.value), value);
    this._documentNode = null;
    this._transclude = null;
    this._compiled = false;
    this._events = {};
    this._jsonml = [];

}

Node.value = {};

Node.prototype = {

    _event: function(name){

        var signals;

        if(!this._events[name]) {

            signals = new Signals();

            if(this._compiled){

                this._events.add(name, signals);

            }else{

                this._events[name] = signals;

            }

        }else{

            signals = this._events[name];

        }

        return signals;

    },

    _dispatch: function(name, e){

        this._event(name).dispatch(e);

    },

    on: function(name, callback){

        return this._event(name).queue(callback, this);

    },

    off: function(name, signal){

        if(this._events[name]) {

            if(signal) {

                this._events[name].remove(signal);

            }else{

                this._events[name].remove();

            }

            if(!this._events[name].count){

                if(this._compiled){

                    this._events.delete(name);

                }else{

                    delete this._events[name];

                }

            }

        }else{

            //remove ALL THE EVENTS

        }

    },

    clone: function(deep){

        var cloned = new this.constructor(clone(this._value));

        if(deep && this.children){

            each(this.children, function(child){

                cloned.append(child.clone(true));

            });

        }

        each(this._events, function(signals, event){

            signals.each(function(signal){

                cloned.on(event, signal.binding);

            });

        });

        return cloned;

    },

    render: function(){

        return this._documentNode;

    },

    valueOf: function(){

        return this._value;

    },

    toJSON: function(){

        return this._jsonml;

    },

    toString: function(){

        return JSON.stringify(this._jsonml);

    }

};

module.exports = Node;

},{"../signals":13,"../util":14}],9:[function(require,module,exports){
var util = require('../util'),
    Node = require('./node'),
    inherit = util.inherit;

function Text(value){

    Node.call(this, value);
    this._parent = null;

}

Text.value = {

    value: ''

};

inherit(Text, Node, {

    value: {

        get: function(){

            return this._value.value;

        },

        set: function(value){

            this._value.value = value;

        }

    },

    parent: {

        get: function(){

            return this._parent;

        },

        set: function(parent){

            //remove from previous parent first
            this._parent = parent;

        }

    }

});

Text.prototype.remove = function(){

    if(this.parent) return this.parent.children.splice(this.parent.children.indexOf(this), 1);

};

Text.prototype.toString = function(){

    return this._value.value;

};

module.exports = Text;

},{"../util":14,"./node":8}],10:[function(require,module,exports){
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

    each(mutationRecord.object._observers, function mutationDispatchIterator(observer){

        observer[signals].dispatch(mutationRecord);

    });

}

function mutate(mutationRecord, m){

    dispatch(mutationRecord, 'transforms');

    m(mutationRecord);

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

function arrayMutation(m){

    if(m.object._recursive){

        each(m.transformed, function(val){

            observable(val, true);

            observeEach(m.object._observers, val, true);

        });

    }

    //if anything is removed need to clean up _observers

    Array.prototype[m.type].apply(m.object, m.transformed);

}

function objectAddMutation(m){

    if(m.object._recursive){

        observable(m.transformed, true);

        observeEach(m.object._observers, m.transformed, true);

    }

    define(m.object, m.name, defineAccessors({}, m.name, m.transformed));

}

function objectDeleteMutation(m){

    if(m.object[m.name]._observers) {

        each(m.object[m.name]._observers, function(observer){

            observer.unobserve(m.object[m.name]);

        });

    }

    delete m.object[m.name];

}

function defineAccessors(descriptor, prop, value){

    return (descriptor[prop] = {

        get: function(){return value;},

        set: function(newValue){

            //create the mutation method in this closure to retain value param ref :)
            mutate(mutation({

                name: prop,
                object: this,
                type: 'update',
                oldValue: value,
                transformed: newValue

            }), function objectSetMutation(m){

                if(m.object._recursive){

                    observable(m.transformed, true);

                    observeEach(m.object._observers, m.transformed, true);

                }

                value = m.transformed;

            });

            //if old value was an object clean up observers

        },

        enumerable: true,

        configurable: true

    });

}

function observableArray(descriptor){

    each(arrayMutatorMethods, function arrayMutatorMethodIterator(method){

        descriptor[method] = {

            value: function(){

                var mutationRecord = mutation({
                        object: this,
                        type: method,
                        transformed: Array.prototype.slice.call(arguments)
                    }),
                    args = mutationRecord.transformed;

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

                //mutationRecord.transformed = args;

                mutate(mutationRecord, arrayMutation);

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

                }), objectAddMutation);

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

                }), objectDeleteMutation);

            }

        }

    });

}

function observable(target, recursive){

    var props, descriptor;

    if(is(target, 'array') || is(target, 'object')){

        props = configurableProperties(target);

        if(is(target._observers, 'undefined')){

            descriptor = {

                _observers: {

                    value: []

                },

                _recursive: {

                    value: false,

                    configurable: true

                }

            };

            if(is(target, 'array') || !is(target.length, 'undefined')){

                observableArray(descriptor);

            }else{

                observableObject(descriptor);

                each(props, function(prop){

                    defineAccessors(descriptor, prop, target[prop]);

                });

            }

            defines(target, descriptor);

        }

        //target was either observable or is now observable
        if(target._recursive === false && recursive){

            Object.defineProperty(target, '_recursive', {

                value: true

            });

            each(props, function(prop){

                observable(target[prop], true);

            });

        }

    }

    return target;

}

function limit(callback, query){

    return function limitMutation(mutation){

        if(match(mutation, query)) callback.call(this, mutation);

    };

}

function configurableProperties(target){

    var props = [];

    each(Object.getOwnPropertyNames(target), function(prop){

        if(Object.getOwnPropertyDescriptor(target, prop).configurable) props.push(prop);

    });

    return props;

}

function observe(observer, target, recursive){

    if(!target || is(target._observers, 'undefined')) return;

    if(!observer.observing(target)){

        target._observers.push(observer);
        observer._observed.push(target);

    }

    if(recursive){

        each(configurableProperties(target), function(prop){

            observe(observer, target[prop], true);

        });

    }


}

function observeEach(observers, target, recursive){

    if(!target || is(target._observers, 'undefined')) return;

    each(observers, function observeEachIterator(observer){

        observe(observer, target, recursive);

    });

}

function Observer(){

    this.observers = new Signals();
    this.transforms = new Signals();
    this._observed = [];

}

Observer.prototype = {

    observe: function(target, recursive, callback){

        if(!target) return;

        observable(target, recursive);

        observe(this, target, recursive);

        if(callback){

            return this.observers.add(limit(callback, {object: target}), target);

        }

    },

    transform: function(target, recursive, callback){

        this.observe(target, recursive);

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

Observer.observable = observable;

Observer.observe = function(target, recursive, callback){

    var observer = new Observer();

    observer.observe(target, recursive, callback);

    return observer;

};

Observer.transform = function(target, recursive, callback){

    var observer = new Observer();

    observer.transform(target, recursive, callback);

    return observer;

};

Observer.unobserve = function(target){

    if(target._observers){

        each(target._observers, function(observer){

            observer.unobserve(target);

        });

    }

};

module.exports = Observer;

},{"./signals":13,"./util":14}],11:[function(require,module,exports){
var util = require('../util'),
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

function isWhitespace(str){

    //tab, line feed, carriage return, and space
    return !(/[^\t\n\r ]/.test(str));

}

function clean(source){

    //removes tabs, line feeds, carriage returns, and any more than 2 or greater spaces
    return source.toString().replace(/[\t\n\r]|\s{2,}/g,'');

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

        if(isWhitespace(source.nodeValue) || !clean(source.nodeValue).length) return;

        return callback(eventValueObject({

            type: 'text',

            textNode: source,

            value: clean(source.nodeValue)

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
    //source = source.toString().replace(/\n/g,'').replace(/\r/g,'');
    source = clean(source);

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

},{"../util":14}],12:[function(require,module,exports){
var is = require('../util').is,
    node = require('../node'),
    parser = require('./index');

module.exports = function parse(source){

    var method,
        parsed,
        DOMNode;

    if(is(source, 'string')){

        method = parser.parseHTML;

    }else if(source.nodeName){

        if(document.contains(source)){

            DOMNode = source; //retain for transcluding
            source = source.cloneNode(true); //going to be doing some heavy reads...

        }

        method = parser.parseDOM;

    }else{

        method = parser.parseJSONML;

    }

    method(source, function(e){

        switch(e.type){

            case 'text':

                //if parsed is undefined create fragment and append to that - nix
                if(!parsed){

                    parsed = node.text(e.value); //will break if more

                }else{

                    parsed.append(node.text(e.value));

                }

            break;

            case 'start':

                if(parsed) {

                    parsed.append(node.element(e.name, e.attributes));
                    parsed = parsed.children[parsed.children.length - 1];

                }else{

                    parsed = node.element(e.name, e.attributes);

                }

            break;

            case 'end':

                if(e.void){

                    parsed.append(node.element(e.name, e.attributes));

                }else{

                    if(parsed.parent) parsed = parsed.parent;
                    //scenario where text is last event so we don't have a parent

                }

            break;

        }

    });

    source = null;

    if(DOMNode) parsed._transclude = DOMNode;

    return parsed;

};

},{"../node":7,"../util":14,"./index":11}],13:[function(require,module,exports){
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

    index: function(signal){

        return this._signals.indexOf(signal);

    },

    remove: function(signal){

        if(!signal){

            this._signals = [];
            return;

        }

        //can add the same function with different context or priority
        //so pass signal ref returned by add
        var i = this.index(signal);

        if(i !== -1){

            this._signals.splice(i, 1);

        }

        return i;

    },

    each: function(fn){

        each.call(this, this._signals, fn);

    }

};

Object.defineProperty(Signals.prototype, 'count', {

    get: function(){

        return this._signals.length;

    }

});

Signals.signal = Signal;

module.exports = Signals;

},{"./util":14}],14:[function(require,module,exports){
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

    clone: function(obj){

        var clone = Object.create(null);

        for(var key in obj){

            clone[key] = util.is(obj[key], 'object') ? util.clone(obj[key]) : obj[key];

        }

        return clone;

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

},{}]},{},[5])(5)
});
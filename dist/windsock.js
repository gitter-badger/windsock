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

},{"./util":12}],2:[function(require,module,exports){
var util = require('./util'),
    Batch = require('./batch'),
    //Observer = require('./observer'),
    Text = require('./node/Text'),
    Element = require('./node/element'),
    each = util.each,
    is = util.is;

function addEvent(){

    var node = this;

    each(Array.prototype.slice.call(arguments), function(event){

        node._documentNode.addEventListener(event, function compiledNodeDispatch(e){

            node._dispatch(event, e);

        });

    });


}

function removeEvent(event){

    var node = this;

    node._documentNode.removeEventListener(event);

}

function compile(node){

    if(node instanceof Element){

        node._documentNode = document.createElement(node.name);

        if(node.attributes) {

            each(node.attributes, function(val, key){

                node._documentNode.setAttribute(key, val);

            });

        }

        node.observe('attributes', function(mutation){

            switch(mutation.type){
                case 'add':
                case 'update':
                    this._documentNode.setAttribute(mutation.name, mutation.object[mutation.name]);
                break;
                case 'delete':
                    this._documentNode.removeAttribute(mutation.name);
                break;
            }

        });

        node.observe('children', function(mutation){

            switch(mutation.type){

                case 'push':

                    each.call(this, mutation.transformed, function(n){

                        this._documentNode.appendChild(n._documentNode);

                    });

                break;

                case 'slice':

                    

                break;
            }

        });

    }else if(node instanceof Text){

        node._documentNode = document.createTextNode(node.value);

        //scope this callback to node as context not node.value
        node.observe(function(mutation){

            if(mutation.name === 'value'){

                node._batch.add(function(){

                    node._documentNode.textContent = mutation.object.value;

                });

            }

        });

    }

    if(node.children){

        each(node.children, function(n){

            node._documentNode.appendChild(compile(n)._documentNode);

        });

    }

    if(!is(node.events, 'empty')) addEvent.apply(node, Object.keys(node.events));

    node.observe('events', function(mutation){

        switch(mutation.type){

            case 'add':
                addEvent.call(this, mutation.name);
            break;
            case 'delete':
                removeEvent.call(this, mutation.name);
            break;

        }

    });

    node._batch = new Batch();

    node._compiled = true;

    return node;

}

module.exports = {

    compile: function(node){

        return compile(node);

    },

    transclude: function(node){

        //one off action, nullifies transclude

        var parent = node._transclude.parentNode;

        parent.insertBefore(node._documentNode, node._transclude);

        parent.removeChild(node._transclude);

        node._transclude = null;

    }
};

},{"./batch":1,"./node/Text":3,"./node/element":4,"./util":12}],3:[function(require,module,exports){
var util = require('../util'),
    Node = require('./node'),
    inherit = util.inherit;

function Text(value){

    Node.call(this, {

        value: value || ''

    });

    this.observe(function(mutation){

        if(mutation.name === 'value') this._jsonml = mutation.object[mutation.name];

    });

    this._jsonml = this._value.value;

}

inherit(Text, Node);

Text.prototype.append = function(value){

    this._value.value = this._value.value + value;

};

Text.prototype.prepend = function(value){

    this._value.value = value + this._value.value;

};

Text.prototype.find = function(query){

    return this._value.indexOf(query);

};

Text.prototype.valueOf = function(){

    return this._value.value;

};

Text.prototype.toString = function(){

    return this._value.value;

};

module.exports = Text;

},{"../util":12,"./node":7}],4:[function(require,module,exports){
var util = require('../util'),
    Fragment = require('./fragment'),
    is = util.is,
    inherit = util.inherit;

function Element(value){

    Fragment.call(this, {

        name: value.name,

        attributes: value.attributes || {},

        children: value.children || []

    });

    this._jsonml.unshift(this.name);

    if(!is(this.attributes, 'empty')) this._jsonml.splice(1, 0, this.attributes);

    //any change to attributes or children will kick off observers
    this.observe('attributes', function(mutation){

        if(is(mutation.object, 'empty') && is(this._jsonml[1], 'object')){

            this._jsonml.splice(1, 1);

        }else if(this._jsonml[1] !== mutation.object){

            this._jsonml.splice(1, 0, mutation.object);

        }

    }); //returns attribute signal

    this.observe('children', function(mutation){

        var children = is(this.attributes, 'empty') ? this._jsonml.splice(1) : this._jsonml.splice(2);

        Array.prototype[mutation.type].apply(children, mutation.transformed);

        //this is slow, need iterative push
        Array.prototype.push.apply(this._jsonml, children);

    }); //returns children signal

}

inherit(Element, Fragment, {

    name:{

        get: function(){

            return this._value.name;

        },

        set: function(name){

            this._value.name = name;

        },

        enumerable: true

    },

    attributes:{

        get: function(){

            return this._value.attributes;

        },

        set: function(attributes){

            this._value.attributes = attributes;

        },

        enumerable: true

    }

});

module.exports = Element;

},{"../util":12,"./fragment":5}],5:[function(require,module,exports){
var util = require('../util'),
    Node = require('./node'),
    Text = require('./text'),
    each = util.each,
    extend = util.extend,
    inherit = util.inherit;

function Fragment(value){

    Node.call(this, extend({

        children: []

    }, value));

    // Object.defineProperties(this._value.children, {
    //
    //     observe: {
    //         value: function(fn){
    //             if(!this._observer){
    //                 this._observer = Observer.observe(this, false, fn);
    //             }else{
    //                 this._observer
    //             }
    //         }
    //     }
    //
    // });

    //move this and observers for jsonml off to an extension
    if(this._value.children.length){

        //faster than concat and Array.p.push.apply
        for(var i = 0, l = this._value.children.length; i < l; i++){

            this._jsonml.push(this._value.children[i]);

        }

    }

    // Observer.observe(this._value.children, false)
    //         .observers.add(function(mutation){
    //
    //             Array.prototype[mutation.type].apply(this._jsonml, mutation.transformed);
    //
    //         }, this);

}

inherit(Fragment, Node, {

    children:{

        get: function(){

            return this._value.children;

        },

        set: function(children){

            this._value.children = children;

        },

        enumerable: true

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

        },

        enumerable: true

    }

});

module.exports = Fragment;

},{"../util":12,"./node":7,"./text":8}],6:[function(require,module,exports){
var Text = require('./text'),
    Element = require('./element'),
    Fragment = require('./fragment');

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

    },

    fragment: function(){

        return new Fragment({

            children: Array.prototype.slice.call(arguments)

        });

    }

};

},{"./element":4,"./fragment":5,"./text":8}],7:[function(require,module,exports){
var util = require('../util'),
    Signals = require('../signals'),
    Observer = require('../observer'),
    is = util.is,
    extend = util.extend,
    match = util.match,
    each = util.each;

function Node(value){

    this._events = {};

    this._observers = {

        value: new Observer(),

        events: new Observer()

    };

    this._value = extend({

        value: null,
        parent: null,
        data: {}

    }, value);

    this._observers.value.observe(this._value);

    this._observers.events.observe(this._events);

    this._observer('data');

    this._jsonml = [];

    this._compiled = false;

    this._batch = null;

    this._transclude = null;

    this._documentNode = null;

}

Node.prototype = {

    _event: function(name){

        if(!this._events[name]) this._events.add(name, new Signals());
        return this._events[name];

    },

    _observer: function(prop){

        if(is(this._value[prop], 'undefined') && is(this._observers[prop], 'undefined')) return;

        //assume the key is an observable object on this._value
        if(!this._observers[prop]) {

            this._observers[prop] = new Observer();
            this._observers[prop].observe(this._value[prop], true);

        }

        return this._observers[prop];

    },

    _dispatch: function(name, e){

        this._event(name).dispatch(e);

    },

    on: function(name, callback){

        return this._event(name).queue(callback, this);

    },

    off: function(name, signal){

        if(this._events[name]) {

            if(signal) return this._events[name].remove(signal);
            this._events.delete(name);

        }

    },

    observe: function(prop, fn){

        if(is(prop, 'function')) return this._observers.value.observers.queue(prop, this);

        return this._observer(prop).observers.queue(fn, this);

    },

    transform: function(prop, fn){

        if(is(prop, 'function')) return this._observers.value.transforms.queue(prop, this);

        return this._observer(prop).transforms.queue(fn, this);

    },

    remove: function(){

        if(this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);

    },

    append: function(node){

        node.parent = this;
        this.children.push(node);


    },

    prepend: function(node){

        node.parent = this;
        this.children.unshift(node);

    },

    before: function(node){

        if(this.parent){

            node.parent = this.parent;
            this.parent.children.splice(this.parent.children.indexOf(this), 0, node);

        }

    },

    after: function(node){

        if(this.parent){

            node.parent = this.parent;
            this.parent.children.splice(this.parent.children.indexOf(this)+1, 0, node);

        }

    },

    find: function(query){

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

    },

    clone: function(events){

        var clone = new this.constructor(this.valueOf());

        if(events){

            each(this.events, function(signals, event){

                signals.each(function(signal){

                    clone.on(event, signal.binding);

                });

            });

        }

        if(clone.children){

            each(clone.children, function(child, i){

                clone.children.splice(i, 1, child.clone());

            });

        }

        return clone;

    },

    valueOf: function(){

        return this._value;

    },

    toJSON: function(){

        return this._jsonml;

    },

    toString: function(){

        //fragments aren't valid jsonml
        return JSON.stringify(this._jsonml);

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

    data: {

        get: function(){

            return this._value.data;

        },

        set: function(data){

            this._value.data = data;

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

    events:{

        get:function(){

            return this._events;

        },

        enumerable: true

    }

});

module.exports = Node;

},{"../observer":9,"../signals":11,"../util":12}],8:[function(require,module,exports){
module.exports=require(3)
},{"../util":12,"./node":7,"/Users/bensawyer/projects/sandbox/windsock/src/node/Text.js":3}],9:[function(require,module,exports){
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

                mutate(mutationRecord, function(){

                    if(this.object._recursive) each(this.transformed, observable);

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
            //not fully implemented. should do: when updating an existing observed object
            //with a new object and the observers are recursive, make that object oversable and clone the observer list
            value: !is(recursive, 'boolean') ? false : recursive,
            configurable: true,
            writable: true

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

    //it's possible to:
    //var o = new Observer(), o.observers.add(fn), o.observe(targetA), o.observe(targetB)
    //fn will be dispatched for both targets
    //passing a callback to observe or transform will limit it to that object
    observe: function(target, recursive, callback){

        if(!target) return;

        observable(target, recursive);

        if(!this.observing(target)){

            target._observers.push(this);
            this._observed.push(target);

        }

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

},{"./signals":11,"./util":12}],10:[function(require,module,exports){
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

},{"./util":12}],11:[function(require,module,exports){
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

},{"./util":12}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
var util = require('./util'),
    node = require('./node'),
    parser = require('./parser'),
    compiler = require('./compiler'),
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

        //either always return a fragment
        //only allow a single parent element source
        //try to figure out if fragment child length is one return that

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

            var n;

            switch(e.type){

                case 'text':

                    n = node.text(e.value);
                    //if parsed is undefined create fragment and append to that - nix
                    if(!parsed){

                        parsed = n; //will break if more

                    }else{

                        parsed.append(n);

                    }

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
                        //scenario where text is last event so we don't have a parent

                    }

                break;

            }

            n = null;

        });

        source = null;

        if(DOMNode) parsed._documentNode = DOMNode;

        return parsed;

    },

    compile: function(node){

        var transclude = node._documentNode,
            clone = node.clone(true);
        compiler.compile(clone);
        clone._transclude = transclude;
        return clone;

    },

    render: function(node){

        //because node at this point is atleast one clone deep off the original
        //subsequent clones of the original will still have a reference to the original dom element
        //even if it has been removed by transclude
        //this is a memory bug
        return compiler.transclude(node);

    },

    jsonml: function(node){

        return JSON.stringify(node);

    },

    html: function(node){

        if(!node || !node._jsonml.length) return '';

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

},{"./compiler":2,"./node":6,"./parser":10,"./util":12}]},{},[13])(13)
});
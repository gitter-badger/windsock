!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.windsock=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var util = require('./util'),
    paint = util.paint,
    cancelPaint = util.cancelPaint;

var id,
    requested,
    running,
    queue;

function done(){
    id = null;
    requested = false;
    running = false;
    queue = [];
}

function run(){
    running = true;
    for(var i = 0; i < queue.length; i++){
        queue[i].call();
    }
    done();
}

done();

exports.cancel = function cancel(){
    cancelPaint(id);
    done();
};

exports.add = function add(fn){
    queue.push(fn);
    if(!requested) {
        id = paint(run);
        requested = true;
    }
    return id;
};

},{"./util":15}],2:[function(require,module,exports){
var compiler = require('./index'),
    Observer = require('../observer');

module.exports = function compile(template){
    var clone = template.clone(true);
    clone._transclude = template._transclude;
    template._transclude = null;
    compileNode(clone);
    if(clone.children) compileNodes(clone.children);
    return clone;
};

function compileNode(node){
    node._observer = new Observer(node);
    compiler.compileJSONML(node);
    if(typeof document !== 'undefined') compiler.compileDOM(node);
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

},{"../observer":11,"./index":4}],3:[function(require,module,exports){
var parseJSONML = require('../parser').parseJSONML;

//parse jsonml to html string
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

},{"../parser":12}],4:[function(require,module,exports){
var util = require('../util'),
    Text = require('../node/text'),
    Element = require('../node/element'),
    batch = require('../batch'),
    partial = util.partial,
    each = util.each,
    is = util.is;

function observeJSONMLText(mutation, observer){
    if(mutation.name === 'value' && mutation.object.value !== mutation.oldValue){
        observer.root._jsonml = mutation.object.value;
    }
}

function observeJSONMLELementAttributes(mutation, observer){
    var attributes = observer.root.attributes;
    if(mutation.name !== 'attributes' && mutation.object === observer.root.attributes) return;
    if(is(attributes, 'empty') && is(observer.root._jsonml[1], 'object')){
        observer.root._jsonml.splice(1, 1);
    }else if(observer.root._jsonml[1] !== attributes){
        observer.root._jsonml.splice(1, 0, attributes);
    }
}

function observeJSONMLElementChildren(mutation, observer){
    var children = is(observer.root._value.attributes, 'empty') ? observer.root._jsonml.splice(1) : observer.root._jsonml.splice(2);
    Array.prototype[mutation.type].apply(children, mutation.transformed);
    for(var i = 0, l = children.length; i < l; i++){
        observer.root._jsonml.push(children[i]);
    }
}

function textContent(node, value){
    node.textContent = value;
}

function setAttribute(node, key, value){
    node.setAttribute(key, value);
}

function removeChild(node){
    node.parentNode.removeChild(node);
}

function appendChild(node, child){
    node.appendChild(child);
}

function insertBefore(parent, node, ref){
    parent.insertBefore(node, ref);
}

function observeDOMTextValue(mutation, observer){
    if(mutation.name === 'value' && mutation.object.value !== mutation.oldValue){
        batch.add(partial(textContent, observer.root._documentNode, mutation.object.value));
    }
}

function observeDOMElementAttributes(mutation, observer){
    if(mutation.name === 'attributes'){
        //handle adding or deleting attributes
    }else if(mutation.object === observer.root.attributes){
        if(observer.root.attributes[mutation.name] !== mutation.oldValue){
            batch.add(partial(setAttribute, observer.root._documentNode, mutation.name, mutation.object[mutation.name]));
        }
    }
}

function observeDOMElementChildren(mutation, observer){
    var node = observer.root._documentNode;
    //splice is used for before, after, and remove
    //remove() on compiled node is observed on parent and child is destroyed first
    switch(mutation.type){
        case 'splice':
            if(mutation.oldValue){
                each(mutation.oldValue, function batchRemoveChild(child){
                    batch.add(partial(removeChild, child._documentNode));
                });
            }
            if(mutation.transformed.length === 3){
                //childNodes returns live list of child nodes. we need this because like unshift
                //the virtual node.children has already been manipulated
                batch.add(partial(insertBefore, node, mutation.transformed[2]._documentNode, node.childNodes[mutation.name]));
            }
        break;
        case 'push':
            each(mutation.transformed, function batchAppendChild(child){
                batch.add(partial(appendChild, node, child._documentNode));
            });
        break;
        case 'unshift':
            each(mutation.transformed, function(child){
                //have to use elements first child because its already been unshifted to _children array
                batch.add(partial(insertBefore, node, child._documentNode, node.firstChild));
            });
        break;
    }
}

function observeDOMElementEvents(mutation, observer){
    if(mutation.type === 'add'){
        //double closure on observer.root ref here...
        observer.root._documentNode.addEventListener(mutation.name, dispatchEventListener(observer.root, mutation.name));
    }else if(mutation.type === 'delete'){
        observer.root._documentNode.removeEventListener(mutation.name);
    }
}

function compileJSONML(node){
    if(node instanceof Text){
        node._jsonml = node.value;
        node._observer.observe(node._value, false, observeJSONMLText);
    }else if(node instanceof Element){
        node._jsonml = Array.prototype.slice.call(node._children);
        node._jsonml.unshift(node._value.name);
        if(!is(node._value.attributes, 'empty')) node._jsonml.splice(1, 0, node._value.attributes);
        node._observer.observe(node._value, false, observeJSONMLELementAttributes);
        node._observer.observe(node._value.attributes, false, observeJSONMLELementAttributes);
        node._observer.observe(node._children, false, observeJSONMLElementChildren);
    }else{
        throw new Error('failed to compile node, not an instance of Text or Element');
    }
    node._observer.observe(node._events, false, observeDOMElementEvents);
    for(var evt in node._events){
        node._documentNode.addEventListener(evt, dispatchEventListener(node, evt));
    }
}

function compileDOM(node){
    if(node instanceof Text){
        node._documentNode = document.createTextNode(node._value.value);
        node._observer.observe(node._value, false, observeDOMTextValue);
    }else if(node instanceof Element){
        node._documentNode = document.createElement(node._value.name);
        for(var key in node._value.attributes){
            node._documentNode.setAttribute(key, node._value.attributes[key]);
        }
        node._observer.observe(node._value, false, observeDOMElementAttributes);
        node._observer.observe(node._value.attributes, false, observeDOMElementAttributes);
        node._observer.observe(node._children, false, observeDOMElementChildren);
    }else{
        throw new Error('failed to compile node, not an instance of Text or Element');
    }
    if(node.parent) node.parent._documentNode.appendChild(node._documentNode);
}

function dispatchEventListener(n, evt){
    return function eventListenerClosure(e){
        n._dispatch(evt, e);
    };
}

exports.compileDOM = compileDOM;
exports.compileJSONML = compileJSONML;

},{"../batch":1,"../node/element":7,"../node/text":10,"../util":15}],5:[function(require,module,exports){
module.exports = function transclude(template, target){
    var parent;
    target = target || template._transclude;
    parent = target.parentNode;
    for(var i = 0, l = template._children.length; i < l; i++){
        parent.insertBefore(template._children[i]._documentNode, target);
    }
    parent.removeChild(target);
    template._transclude = null;
};

},{}],6:[function(require,module,exports){
var util = require('./util'),
    parse = require('./parser/parse'),
    compile = require('./compiler/compile'),
    transclude = require('./compiler/transclude'),
    html = require('./compiler/html'),
    node = require('./node'),
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

},{"./batch":1,"./compiler/compile":2,"./compiler/html":3,"./compiler/transclude":5,"./node":8,"./observer":11,"./parser/parse":13,"./util":15}],7:[function(require,module,exports){
var util = require('../util'),
    Node = require('./node'),
    Text = require('./text'),
    is = util.is,
    each = util.each,
    match = util.match,
    inherit = util.inherit;

function parseQuery(query){

    var predicate;

    if(is(query, 'function')) return query;

    if(is(query, 'string')){

        predicate = function(child){

            return child.name === query;

        };

    }else if(is(query, 'object')){

        predicate = function(child){

            return match(child.attributes, query);

        };

    }else{

        throw new Error('failed to parse query, type not supported');

    }

    return predicate;

}

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

            return this.filter(function(child){

                return child instanceof Text;

            }).join('');

        },

        set: function(value){

            if(this.text.length){

                var textNodes = this.filter(function(child){

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

//pre-order traversal returns first result or undefined
Element.prototype.find = function(query){

    var predicate = parseQuery(query),
        result;

    each(this._children, function(child, i, children, halt){

        if(predicate(child)){

            result = child;

        }else if(!is(child.children, 'undefined') && child.children.length){

            result = child.find(predicate);

        }

        if(result) return halt;

    });

    return result;

};

//pre-order traversal returns a flat list result or empty array
Element.prototype.filter = function(query){

    var predicate = parseQuery(query),
        result = [];

    each(this._children, function(child){

        if(predicate(child)) result.push(child);

        if(!is(child.children, 'undefined') && child.children.length) result = result.concat(child.filter(predicate));

    });

    return result;

};

Element.prototype.destroy = function(){

    while(this._children.length){

        this._children[this._children.length-1].destroy();

    }

    this.remove();
    this._destroy();

};

Element.prototype.append = function(node){

    node.parent = this;
    return this._children.push(node);

};

Element.prototype.prepend = function(node){

    node.parent = this;
    return this._children.unshift(node);

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

},{"../util":15,"./node":9,"./text":10}],8:[function(require,module,exports){
var Text = require('./text'),
    Element = require('./element');

//node factory
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

},{"./element":7,"./text":10}],9:[function(require,module,exports){
var util = require('../util'),
    Signals = require('../signals'),
    extend = util.extend,
    clone = util.clone,
    is = util.is;

function Node(value){
    this._value = extend(Object.create(this.constructor.value), value);
    this._observer = null;
    this._documentNode = null;
    this._transclude = null;
    this._compiled = false;
    this._events = {};
    this._jsonml = [];
}

Node.value = {};

Node.prototype = {
    _destroy: function(){
        //remove all events which are observed and then removed from _documentNode
        this.off();
        if(this._compiled){

            //batch.cancel(this._batch);

            if(!is(this._documentNode.parentNode, 'undefined')) this._documentNode.parentNode.removeChild(this._documentNode);

            this._observer.unobserve();

            this._compiled = false;

        }

        this._documentNode = null;
        this._transclude = null;
        this._jsonml = null;
        //loop this._value properties and nullify
    },

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
        var events = Array.prototype.slice.call(arguments,0,1);
        if(!events.length) events = Object.keys(this._events);
        if(signal){
            this._events[name].remove(signal);
            if(this._events[name].count) return;
        }
        for(var i = 0, l = events.length; i < l; i++){
            this._events[events[i]].remove();
            if(this._compiled){
                this._events.delete(events[i]);
            }else{
                delete this._events[events[i]];
            }
        }
    },
    clone: function(deep){
        var cloned = new this.constructor(clone(this._value));
        if(deep && this._children){
            for(var i = 0, l = this._children.length; i < l; i++){
                cloned.append(this._children[i].clone(true));
            }
        }
        return cloned;
    },
    remove: function(){
        var _this = this;
        if(this.parent){
            if(this._compiled){

                this.parent.on('batch', function(){
                    _this.destroy();
                });
                this.parent.children.splice(this.parent.children.indexOf(this), 1); //shouldn't matter the batch is on the parent, make sure to destroy children first
                //Array.prototype.splice.call(this.parent.children, this.parent.children.indexOf(this), 1);
                //doesn't kick off observers so jsonml will not be modified...

            }else{
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
            }
            this.parent = null;
        }
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

},{"../signals":14,"../util":15}],10:[function(require,module,exports){
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

Text.prototype.destroy = function(){

    this.remove();
    this._destroy();

};

Text.prototype.toString = function(){

    return this._value.value;

};

module.exports = Text;

},{"../util":15,"./node":9}],11:[function(require,module,exports){
var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    bind = util.bind,
    each = util.each,
    merge = util.merge,
    extend = util.extend;

var define = Object.defineProperty,
    defines = Object.defineProperties,
    ARRAY_MUTATOR_METHODS = [
        'fill',
        'pop',
        'push',
        'reverse',
        'shift',
        'sort',
        'splice',
        'unshift'
    ];

function dispatchTransforms(mutationRecord, observer){
    observer.transforms.dispatch(mutationRecord, observer);
}

function dispatchObservers(mutationRecord, observer){
    observer.observers.dispatch(mutationRecord, observer);
}

function dispatch(mutationRecord, method){
    for(var i = 0, l = mutationRecord.object._observers.length; i < l; i++){
        method(mutationRecord, mutationRecord.object._observers[i]);
    }
}

function dispatchMutation(mutationRecord, mutate){
    dispatch(mutationRecord, dispatchTransforms);
    mutate(mutationRecord);
    dispatch(mutationRecord, dispatchObservers);
}

function mutationObject(obj){
    return merge({
        name: null,
        object: null,
        type: null,
        oldValue: null,
        transformed: null
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

            //create the mutationObject method in this closure to retain value param ref :)
            dispatchMutation(mutationObject({

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

    each(ARRAY_MUTATOR_METHODS, function arrayMutatorMethodIterator(method){

        descriptor[method] = {

            value: function arrayMutationClosure(){

                var mutationRecord = mutationObject({
                        object: this,
                        type: method,
                        transformed: Array.prototype.slice.call(arguments)
                    }),
                    args = mutationRecord.transformed;

                switch(method){

                    case 'fill':

                        mutationRecord.name = args[1];
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

                dispatchMutation(mutationRecord, arrayMutation);

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

                dispatchMutation(mutationObject({

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

                dispatchMutation(mutationObject({

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

function limit(callback, target){
    return function limitMutationDispatch(mutation, observer){
        if(mutation.object === target) callback.call(this, mutation, observer);
    };
}

function Observer(root){
    this.observers = new Signals();
    this.transforms = new Signals();
    this._observed = [];
    //define a shared root object to pass to all observers/transforms
    this.root = root;
}

Observer.prototype = {
    observe: function(target, recursive, callback){
        if(!target) return;
        observable(target, recursive);
        observe(this, target, recursive);
        if(callback) return this.observers.add(limit(callback, target));
    },
    transform: function(target, recursive, callback){
        if(!target) return;
        this.observe(target, recursive);
        if(callback) return this.transforms.queue(limit(callback, target));
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

            //each(this._observed, remove);
            while(this._observed.length > 0){

                remove(this._observed[this._observed.length - 1]);

            }

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

},{"./signals":14,"./util":15}],12:[function(require,module,exports){
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

},{"../util":15}],13:[function(require,module,exports){
var is = require('../util').is,
    node = require('../node'),
    parser = require('./index');

module.exports = function parse(source){
    //parse jsonml array, html string, or document element
    var parseMethod,
        template = node.element('template'),
        clone;

    if(is(source, 'string')){
        parseMethod = parser.parseHTML;
    }else if(source.nodeName){
        if(document.contains(source)){

            template._transclude = source; //retain for transcluding
            clone = source.cloneNode(true); //going to be doing some heavy reads... not a noticeable perf diff

        }

        parseMethod = parser.parseDOM;

    }else{
        parseMethod = parser.parseJSONML;
    }
    parseMethod(clone || source, function(e){
        switch(e.type){
            case 'text':
                template.append(node.text(e.value));
            break;
            case 'start':
                template.append(node.element(e.name, e.attributes));
                template = template.children[template.children.length - 1];
            break;
            case 'end':
                if(e.void){
                    template.append(node.element(e.name, e.attributes));
                }else{
                    if(template.parent) template = template.parent;
                }
            break;
        }
    });
    source = null;
    return template;
};

},{"../node":8,"../util":15,"./index":12}],14:[function(require,module,exports){
function Signal(fn, context, priority){
    this.binding = fn;
    this.context = context;
    this.priority = typeof priority !== 'undefined' ? priority : 0;
}

Signal.prototype = {
    invoke: function(args){
        if(this.binding) return this.binding.apply(this.context, args);
    }
};

function Signals(){
    this._signals = [];
}

Signals.prototype = {
    dispatch: function(){
        var args = Array.prototype.slice.call(arguments);
        for(var i = 0, l = this._signals.length; i < l; i++){
            this._signals[i].invoke(args);
        }
    },
    add: function(fn, context, priority){
        var signal = new Signal(fn, context, priority),
            i = 0;
        while(i < this._signals.length){
            if(signal.priority <= this._signals[i].priority) break;
            i++;
        }
        this._signals.splice(i, 0, signal);
        return signal;
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
        var i = this.index(signal);
        if(i !== -1){
            this._signals.splice(i, 1);
        }
        return i;
    }
};

Object.defineProperty(Signals.prototype, 'count', {
    get: function(){
        return this._signals.length;
    }
});

Signals.signal = Signal;

module.exports = Signals;

},{}],15:[function(require,module,exports){
var paint, cancelPaint, tick = (typeof process !== 'undefined' && process.nextTick) ? process.nextTick : setTimeout;

if(typeof window !== 'undefined' && window.requestAnimationFrame){
    paint = window.requestAnimationFrame;
    cancelPaint = window.cancelAnimationFrame;
}else{
    paint = setTimeout;
    cancelPaint = clearTimeout;
}

var util = {
    tick: function(fn){
        return tick(fn, 0);
    },
    paint: function(fn){
        return paint(fn, 0);
    },
    cancelPaint: function(id){
        return cancelPaint(id);
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
    traverse: function(list, fn){
        //in order synchronous traversal
        util.each.call(this, list, function traversalIterator(result){
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
    extend: function(obj){
        //adds enumerable properties to object, returns that object
        for(var i = 1, l = arguments.length; i < l; i++){
            for(var key in arguments[i]){
                obj[key] = arguments[i][key];
            }
        }
        return obj;
    },
    merge: function(obj){
        //overwrites enumerable properties inlcuding prototype chain
        var args = Array.prototype.slice.call(arguments, 1);
        for(var i = 0, l = args.length; i < l; i++){
            for(var key in obj){
                if(typeof args[i][key] !== 'undefined') obj[key] = args[i][key];
            }
        }
        return obj;
    },
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
        util.each(query, function matchIterator(val, key){
            if(list[key] !== val) matched = false;
        });
        return matched;
    },
    partial: function(fn){
        var args = Array.prototype.slice.call(arguments, 1);
        return function partial(){
            fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
        };
    },

    bind: function(fn, context){

        var args = Array.prototype.slice.call(arguments, 2);

        return function bindClosure(){

            return fn.apply(context, args.concat(Array.prototype.slice.call(arguments)));

        };

    },

    clone: function(obj){
        var clone = Object.create(null),
            keys = Object.keys(obj);
        for(var i = 0, l = keys.length; i < l; i++){
            clone[keys[i]] = util.is(obj[keys[i]], 'object') ? util.clone(obj[keys[i]]) : obj[keys[i]];
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

    capitalize: function(str){
        //Uppercase first letter
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    isEmpty: function(obj){
        //converts the operands to numbers then applies strict comparison
        return Object.keys(obj).length === 0;
    },
    noop: function(){}
};

module.exports = util;

},{}]},{},[6])(6)
});
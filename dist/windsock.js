(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.windsock = factory());
}(this, function () { 'use strict';

    var babelHelpers = {};

    babelHelpers.classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    babelHelpers.createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    babelHelpers.get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);

      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);

        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    };

    babelHelpers.inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };

    babelHelpers.possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    babelHelpers;

    var paint;
    var cancelPaint;
    var tick = typeof process !== 'undefined' && process.nextTick ? process.nextTick : setTimeout;
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        paint = window.requestAnimationFrame;
        cancelPaint = window.cancelAnimationFrame;
    } else {
        paint = setTimeout;
        cancelPaint = clearTimeout;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function is(target, type) {
        switch (type) {
            case 'empty':
                return Object.keys(target).length === 0;
            case 'undefined':
                return typeof target === 'undefined';
            case 'null':
                return target === null;
            default:
                return Object.prototype.toString.call(target) === '[object ' + capitalize(type) + ']';
        }
    }

    function extend(obj) {
        for (var i = 1, l = arguments.length; i < l; i++) {
            //enumerable including prototype
            for (var key in arguments[i]) {
                obj[key] = arguments[i][key];
            }
        }
        return obj;
    }

    function _clone(obj) {
        var clone = {};
        Object.keys(obj).forEach(function (key) {
            clone[key] = is(obj[key], 'object') ? clone(obj[key]) : obj[key];
        });
        return clone;
    }

    function match(target, query) {
        for (var key in query) {
            if (target[key] !== query[key]) {
                return false;
            }
        }
        return true;
    }

    function noop() {}

var util = Object.freeze({
        get paint () { return paint; },
        get cancelPaint () { return cancelPaint; },
        tick: tick,
        capitalize: capitalize,
        is: is,
        extend: extend,
        clone: _clone,
        match: match,
        noop: noop
    });

    var Node = function () {
        function Node() {
            babelHelpers.classCallCheck(this, Node);

            this.compiled = false;
            this.transclude = undefined;
            this.DOMNode = undefined;
            this.observers = [];
            this.bindings = [];
        }

        babelHelpers.createClass(Node, [{
            key: 'destroy',
            value: function destroy() {
                this.compiled = false;
                this.transclude = undefined;
                this.DOMNode = undefined;
                while (this.observers.length) {
                    this.observers.pop().disconnect();
                }
                this.bindings = [];
            }
        }, {
            key: 'clone',
            value: function clone() {
                var node = new Node();
                node.transclude = this.transclude;
                node.bindings = this.bindings;
                return node;
            }
        }, {
            key: 'toJSON',
            value: function toJSON() {
                return this.jsonml;
            }
        }, {
            key: 'valueOf',
            value: function valueOf() {
                return JSON.stringify(this);
            }
        }, {
            key: 'toString',
            value: function toString() {
                return this.html;
            }
        }, {
            key: 'jsonml',
            get: function get() {
                return '';
            }
        }, {
            key: 'html',
            get: function get() {
                return '';
            }
        }]);
        return Node;
    }();

    var Text = function (_Node) {
        babelHelpers.inherits(Text, _Node);

        function Text(value) {
            babelHelpers.classCallCheck(this, Text);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Text).call(this));

            _this.value = {
                textContent: value
            };
            defineAttributesParent(_this, _this.value);
            _this.parent = undefined;
            return _this;
        }

        babelHelpers.createClass(Text, [{
            key: 'destroy',
            value: function destroy() {
                babelHelpers.get(Object.getPrototypeOf(Text.prototype), 'destroy', this).call(this);
                if (!is(this.parent, 'undefined')) {
                    this.remove();
                }
            }
        }, {
            key: 'clone',
            value: function clone() {
                var node = new Text(this.value.textContent);
                node.transclude = this.transclude;
                node.bindings = this.bindings;
                return node;
            }
        }, {
            key: 'remove',
            value: function remove() {
                if (is(this.parent, 'undefined')) {
                    throw new Error('Failed to remove node');
                }
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
                this.parent = undefined;
            }
        }, {
            key: 'jsonml',
            get: function get() {
                return this.value.textContent;
            }
        }, {
            key: 'html',
            get: function get() {
                return this.value.textContent;
            }
        }, {
            key: 'text',
            get: function get() {
                return this.value.textContent;
            },
            set: function set(value) {
                this.value.textContent = value;
            }
        }]);
        return Text;
    }(Node);

    function defineAttributesParent(instance) {
        var value = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        Object.defineProperty(value, 'parent', {
            value: instance,
            enumerable: false,
            writable: false,
            configurable: false
        });
        return value;
    }

    var Fragment = function (_Node) {
        babelHelpers.inherits(Fragment, _Node);

        function Fragment() {
            babelHelpers.classCallCheck(this, Fragment);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Fragment).call(this));

            _this.children = defineChildrenParent(_this);
            return _this;
        }

        babelHelpers.createClass(Fragment, [{
            key: 'destroy',
            value: function destroy() {
                babelHelpers.get(Object.getPrototypeOf(Fragment.prototype), 'destroy', this).call(this);
                var i = this.children.length;
                while (i) {
                    i--;
                    this.children[i].destroy();
                }
            }
        }, {
            key: 'clone',
            value: function clone() {
                var deep = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

                var fragment = new Fragment();
                if (deep && this.children.length) {
                    this.children.forEach(function (child) {
                        fragment.append(child.clone(true));
                    });
                }
                fragment.transclude = this.transclude;
                fragment.bindings = this.bindings;
                return fragment;
            }
        }, {
            key: 'append',
            value: function append(node) {
                if (this.compiled !== node.compiled) {
                    throw new Error('Node compiled value does not match');
                }
                if (!is(node.parent, 'undefined')) {
                    node.remove();
                }
                node.parent = this;
                this.children.push(node);
            }
        }, {
            key: 'prepend',
            value: function prepend(node) {
                if (this.compiled !== node.compiled) {
                    throw new Error('Node compiled value does not match');
                }
                if (!is(node.parent, 'undefined')) {
                    node.remove();
                }
                node.parent = this;
                this.children.unshift(node);
            }
        }, {
            key: 'insert',
            value: function insert(node, i) {
                if (this.compiled !== node.compiled) {
                    throw new Error('Node compiled value does not match');
                }
                if (!is(node.parent, 'undefined')) {
                    node.remove();
                }
                node.parent = this;
                this.children.splice(i, 0, node);
            }
        }, {
            key: 'find',
            value: function find(query) {
                //pre-order traversal returns first result or undefined
                var predicate = parseQuery(query),
                    result = undefined;
                for (var i = 0, l = this.children.length; i < l; i++) {
                    if (predicate(this.children[i])) {
                        return this.children[i];
                    } else if (!is(this.children[i].find, 'undefined')) {
                        result = this.children[i].find(predicate);
                        if (!is(result, 'undefined')) {
                            return result;
                        }
                    }
                }
            }
        }, {
            key: 'filter',
            value: function filter(query) {
                //pre-order traversal returns a flat list result or empty array
                var predicate = parseQuery(query),
                    result = [];
                for (var i = 0, l = this.children.length; i < l; i++) {
                    if (predicate(this.children[i])) {
                        result.push(this.children[i]);
                    }
                    if (!is(this.children[i].find, 'undefined')) {
                        result = result.concat(this.children[i].find(predicate));
                    }
                }
                return result;
            }
        }, {
            key: 'text',
            value: function text() {
                return this.filter(textFilter).join('');
            }
        }, {
            key: 'jsonml',
            get: function get() {
                throw new Error('Cannot convert to jsonml');
            }
        }, {
            key: 'html',
            get: function get() {
                return this.children.map(function (child) {
                    return child.html;
                }).join('');
            }
        }]);
        return Fragment;
    }(Node);

    function defineChildrenParent(instance) {
        var children = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        Object.defineProperty(children, 'parent', {
            value: instance,
            enumerable: false,
            writable: false,
            configurable: false
        });
        return children;
    }

    function nodeNamePredicate(query, child) {
        if (child instanceof Text || child instanceof Fragment) {
            return false;
        }
        return child.name === query;
    }

    function nodeAttributePredicate(query, child) {
        if (child instanceof Text || child instanceof Fragment) {
            return false;
        }
        return match(child.attributes, query);
    }

    function parseQuery(query) {
        if (is(query, 'function')) {
            return query;
        } else if (is(query, 'string')) {
            return nodeNamePredicate.bind(null, query);
        } else if (is(query, 'object')) {
            return nodeAttributePredicate.bind(null, query);
        }
        throw new Error('specified query type not supported');
    }

    function textFilter(node) {
        return node instanceof Text;
    }

    var Element = function (_Fragment) {
        babelHelpers.inherits(Element, _Fragment);

        function Element(name) {
            var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var empty = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
            babelHelpers.classCallCheck(this, Element);

            if (!name) {
                throw new Error('Failed to instantiate Element invalid name specified');
            }

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Element).call(this));

            _this.name = name;
            _this.attributes = defineAttributesParent$1(_this, attributes);
            _this.empty = empty;
            return _this;
        }

        babelHelpers.createClass(Element, [{
            key: 'destroy',
            value: function destroy() {
                babelHelpers.get(Object.getPrototypeOf(Element.prototype), 'destroy', this).call(this);
                if (!is(this.parent, 'undefined')) {
                    this.remove();
                }
                this.attributes = defineAttributesParent$1(this);
                this.empty = false;
            }
        }, {
            key: 'clone',
            value: function clone() {
                var deep = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

                var element = new Element(this.name, _clone(this.attributes));
                if (deep && this.children.length) {
                    this.children.forEach(function (child) {
                        element.append(child.clone(true));
                    });
                }
                element.transclude = this.transclude;
                element.bindings = this.bindings;
                return element;
            }
        }, {
            key: 'remove',
            value: function remove() {
                if (is(this.parent, 'undefined')) {
                    throw new Error('Failed to remove node');
                }
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
                this.parent = undefined;
            }
        }, {
            key: 'jsonml',
            get: function get() {
                var jsonml = [];
                jsonml.push(this.name);
                if (is(this.attributes, 'empty') === false) {
                    jsonml.push(_clone(this.attributes));
                }
                for (var i = 0, l = this.children.length; i < l; i++) {
                    jsonml.push(this.children[i].jsonml);
                }
                return jsonml;
            }
        }, {
            key: 'html',
            get: function get() {
                var _this2 = this;

                var html = [],
                    attrKeys = Object.keys(this.attributes);
                html.push('<' + this.name);
                if (attrKeys.length) {
                    html.push(' ');
                    html = html.concat(attrKeys.map(function (key) {
                        if (_this2.attributes[key]) {
                            key += '="' + _this2.attributes[key] + '"';
                        }
                        return key;
                    }));
                }
                if (this.empty) {
                    html.push('/>');
                } else {
                    html.push('>');
                    for (var i = 0, l = this.children.length; i < l; i++) {
                        html.push(this.children[i].html);
                    }
                    html.push('</' + this.name + '>');
                }
                return html.join('');
            }
        }]);
        return Element;
    }(Fragment);

    function defineAttributesParent$1(instance) {
        var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        Object.defineProperty(attributes, 'parent', {
            value: instance,
            enumerable: false,
            writable: false,
            configurable: false
        });
        return attributes;
    }



    var vdom = Object.freeze({
    	Node: Node,
    	Text: Text,
    	Fragment: Fragment,
    	Element: Element
    });

    var Transform = function () {
        function Transform() {
            //just an interface

            babelHelpers.classCallCheck(this, Transform);
        }

        babelHelpers.createClass(Transform, [{
            key: "bind",
            value: function bind() {}
        }, {
            key: "update",
            value: function update() {}
        }]);
        return Transform;
    }();

    var TextTransform = function (_Transform) {
        babelHelpers.inherits(TextTransform, _Transform);

        function TextTransform() {
            babelHelpers.classCallCheck(this, TextTransform);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(TextTransform).call(this));
        }

        babelHelpers.createClass(TextTransform, [{
            key: 'bind',
            value: function bind(node, value) {
                node.value.textContent = value.toString();
            }
        }, {
            key: 'update',
            value: function update(node, record) {
                var parent = undefined;
                if (record.newValue !== record.oldValue) {
                    switch (record.method) {
                        case 'delete':
                            parent = node.parent;
                            node.remove();
                            node.parent = parent;
                            break;
                        case 'add':
                            if (node.parent) {
                                node.parent.append(node);
                            }
                        case 'set':
                            node.value.textContent = record.newValue.toString();
                            break;
                    }
                }
            }
        }]);
        return TextTransform;
    }(Transform);

    var IfTransform = function (_Transform) {
        babelHelpers.inherits(IfTransform, _Transform);

        function IfTransform() {
            babelHelpers.classCallCheck(this, IfTransform);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(IfTransform).call(this));
        }

        babelHelpers.createClass(IfTransform, [{
            key: 'bind',
            value: function bind(node, value) {
                var parent = undefined,
                    index = undefined;
                if (!!value === false && node.parent) {
                    parent = node.parent;
                    node.index = parent.children.indexOf(node);
                    node.remove();
                    node.parent = parent;
                }
            }
        }, {
            key: 'update',
            value: function update(node, record) {
                var parent = undefined,
                    index = undefined;
                if (record.newValue !== record.oldValue && node.parent) {
                    if (!!record.newValue) {
                        node.parent.insert(node, node.index);
                    } else {
                        parent = node.parent;
                        node.index = parent.children.indexOf(node);
                        node.remove();
                        node.parent = parent;
                    }
                }
            }
        }]);
        return IfTransform;
    }(Transform);



    var transforms = Object.freeze({
    	TextTransform: TextTransform,
    	IfTransform: IfTransform
    });

    var ARRAY_MUTATOR_METHODS = ['fill', 'pop', 'push', 'shift', 'splice', 'unshift'];

    var Observer = function () {
        function Observer(callback) {
            babelHelpers.classCallCheck(this, Observer);

            if (is(callback, 'undefined')) {
                throw new Error('Failed to instantiate missing callback');
            }
            if (!is(callback, 'function')) {
                throw new Error('Invalid callback specified');
            }
            this.callback = callback;
            this._target = undefined;
            this._config = undefined;
        }

        babelHelpers.createClass(Observer, [{
            key: 'observe',
            value: function observe(target) {
                var config = arguments.length <= 1 || arguments[1] === undefined ? { recursive: false } : arguments[1];

                var observerList;
                if (!isObservable(target)) {
                    throw new Error('Failed to observe not a valid target');
                }
                if (is(config.recursive, 'undefined')) {
                    throw new Error('Invalid config specified');
                }
                observerList = new ObserverList();
                observerList.add(this);
                this._target = target;
                this._config = config;
                observable(target, observerList);
            }
        }, {
            key: 'disconnect',
            value: function disconnect() {
                if (this._target) {
                    if (this._config.recursive) {
                        disconnectRecursiveObserver(this._target, this);
                    }
                    this._target._observers.remove(this);
                }
                this._target = undefined;
                this._config = undefined;
            }
        }]);
        return Observer;
    }();

    var MutationRecord = function MutationRecord(config) {
        babelHelpers.classCallCheck(this, MutationRecord);

        this.type = config.type; //prop or array indicies
        this.target = config.target; //parent object||array
        this.method = config.method; //add,delete,update||push,pop,splice,etc.
        this.args = config.args;
        this.newValue = config.newValue; //newly transformed value
        this.oldValue = config.oldValue; //the old value(s)
    };

    var ObserverList = function () {
        function ObserverList() {
            var observers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
            babelHelpers.classCallCheck(this, ObserverList);

            this.observers = observers;
        }

        babelHelpers.createClass(ObserverList, [{
            key: 'dispatch',
            value: function dispatch(record) {
                if (!record instanceof MutationRecord) {
                    throw new Error('Invalid record specified');
                }
                this.observers.forEach(function (observer) {
                    observer.callback(record);
                });
            }
        }, {
            key: 'exists',
            value: function exists(observer) {
                return this.observers.indexOf(observer) !== -1;
            }
        }, {
            key: 'add',
            value: function add(observer) {
                return this.observers.push(observer);
            }
        }, {
            key: 'remove',
            value: function remove(observer) {
                var index = this.observers.indexOf(observer);
                if (index !== -1) {
                    this.observers.splice(index, 1);
                }
                return index;
            }
        }, {
            key: 'recursive',
            value: function recursive() {
                return this.observers.filter(function (observer) {
                    return observer._config.recursive;
                });
            }
        }, {
            key: 'recursiveExists',
            value: function recursiveExists() {
                for (var i = 0, l = this.observers.length; i < l; i++) {
                    if (this.observers[i]._config.recursive) {
                        return true;
                    }
                }
                return false;
            }
        }], [{
            key: 'recursive',
            value: function recursive(list) {
                //factory method for creating a new observer list
                //from an existing observer list where the observers are recursive
                //because this isn't exposed we don't really have to throw here
                if (!list instanceof ObserverList) {
                    throw new Error('Invalid list specified');
                }
                return new ObserverList(list.recursive());
            }
        }]);
        return ObserverList;
    }();

    function observable(target, observerList) {
        var recursive = ObserverList.recursive(observerList),
            properties = configurableProperties(target),
            descriptor;
        if (target._observers) {
            //populate current observerlist with new observers
            //from observerlist
            observerList.observers.forEach(function (observer) {
                if (!target._observers.exists(observer)) {
                    target._observers.add(observer);
                }
            });
        } else {
            descriptor = {
                _observers: {
                    value: observerList,
                    configurable: false
                }
            };
            properties.forEach(function (prop) {
                defineAccessors(prop, target[prop], descriptor);
            });
            if (is(target, 'array')) {
                defineObservableArrayMutations(target, descriptor);
            } else {
                defineObservableObjectMutations(target, descriptor);
            }
            Object.defineProperties(target, descriptor);
        }
        if (recursive.observers.length) {
            for (var i = 0, l = properties.length; i < l; i++) {
                if (isObservable(target[properties[i]])) {
                    observable(target[properties[i]], recursive);
                }
            }
        }
    }

    function defineObservableObjectMutations(target) {
        var descriptor = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        descriptor.add = {
            value: function addOperationClosure(prop, value) {
                addObjectProperty(this, prop, value);
            }
        };
        descriptor.delete = {
            value: function deleteOperationClosure(prop) {
                deleteObjectProperty(this, prop);
            }
        };
    }

    function defineObservableArrayMutations(target) {
        var descriptor = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var _loop = function _loop(i, l) {
            descriptor[ARRAY_MUTATOR_METHODS[i]] = {
                value: function arrayOperationClosure() {
                    mutateArray({
                        args: Array.prototype.slice.call(arguments),
                        method: ARRAY_MUTATOR_METHODS[i],
                        target: this
                    });
                }
            };
        };

        for (var i = 0, l = ARRAY_MUTATOR_METHODS.length; i < l; i++) {
            _loop(i, l);
        }
    }

    function isObservable(target) {
        return is(target, 'array') || is(target, 'object');
    }

    function configurableProperties(target) {
        //getOwnPropertyNames enumerable or not excluding prototype
        return Object.getOwnPropertyNames(target).filter(function (name) {
            return Object.getOwnPropertyDescriptor(target, name).configurable;
        });
    }

    function defineAccessors(prop, value) {
        var descriptor = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        descriptor[prop] = {
            get: function get() {
                return value;
            },
            set: function set(newValue) {
                var record = new MutationRecord({
                    type: prop,
                    target: this,
                    method: 'set',
                    oldValue: value,
                    newValue: newValue,
                    args: []
                });
                if (this._observers.recursiveExists() && isObservable(newValue)) {
                    observable(newValue, ObserverList.recursive(this._observers));
                }
                if (value && value._observers) {
                    disconnectRecursiveObservers(this, value._observers);
                }
                value = newValue;
                this._observers.dispatch(record);
            },
            enumerable: true,
            configurable: true
        };
        return descriptor;
    }

    function addObjectProperty(target, prop, newValue) {
        if (!is(target[prop], 'undefined')) {
            throw new Error('Failed to add ' + prop + ' already defined');
        }
        var record = new MutationRecord({
            type: prop,
            target: target,
            method: 'add',
            oldValue: target[prop],
            newValue: newValue,
            args: Array.prototype.slice.call(arguments, 1)
        });
        if (target._observers.recursiveExists() && isObservable(newValue)) {
            observable(newValue, ObserverList.recursive(target._observers));
        }
        Object.defineProperties(target, defineAccessors(prop, newValue));
        target._observers.dispatch(record);
    }

    function deleteObjectProperty(target, prop) {
        if (is(target[prop], 'undefined')) {
            throw new Error('Failed to delete ' + prop + ' does not exist');
        }
        var record = new MutationRecord({
            type: prop,
            target: target,
            method: 'delete',
            oldValue: target[prop],
            newValue: undefined,
            args: Array.prototype.slice.call(arguments, 1)
        });
        if (target[prop] && target[prop]._observers) {
            disconnectRecursiveObservers(target, target[prop]._observers);
        }
        delete target[prop];
        target._observers.dispatch(record);
    }

    function mutateArray(options) {
        var target = options.target,
            args = options.args,
            method = options.method,
            record = new MutationRecord({
            type: undefined,
            target: target,
            method: method,
            oldValue: undefined,
            newValue: undefined,
            args: args
        });
        switch (method) {
            case 'fill':
                record.type = args.splice(1);
                record.oldValue = target.slice(args[1], args[2]);
                break;
            case 'pop':
                record.type = target.length - 1;
                record.oldValue = target.slice(target.length - 1);
                break;
            case 'push':
                record.type = target.length;
                record.newValue = args;
                break;
            case 'shift':
                record.type = 0;
                record.oldValue = target.slice(0, 1);
                break;
            case 'unshift':
                record.type = 0;
                record.newValue = args;
                break;
            case 'splice':
                record.type = args[0];
                if (args[1]) {
                    record.oldValue = target.slice(args[0], args[0] + args[1]);
                }
                record.newValue = args.slice(2);
                break;
        }
        if (target._observers.recursiveExists()) {
            record.newValue.forEach(function (val) {
                if (isObservable(val)) {
                    observable(val, ObserverList.recursive(target._observers));
                }
            });
        }
        if (record.oldValue) {
            record.oldValue.forEach(function (val) {
                if (val && val._observers) {
                    disconnectRecursiveObservers(target, val._observers);
                }
            });
        }
        Array.prototype[method].apply(target, options.args);
        target._observers.dispatch(record);
    }

    function disconnectRecursiveObserver(target, observer) {
        configurableProperties(target).forEach(function (prop) {
            disconnectRecursiveObserver(target[prop], observer);
            if (target[prop]._observers) {
                target[prop]._observers.remove(observer);
            }
        });
    }

    function disconnectRecursiveObservers(target, observerList) {
        target._observers.recursive().forEach(function (observer) {
            observerList.remove(observer);
        });
    }

    var ARRAY_MUTATOR_METHODS$1 = ['fill', 'pop', 'push', 'shift', 'splice', 'unshift'];

    var Observer$1 = function () {
        function Observer(callback) {
            babelHelpers.classCallCheck(this, Observer);

            if (is(callback, 'undefined')) {
                throw new Error('Failed to instantiate missing callback');
            }
            if (!is(callback, 'function')) {
                throw new Error('Invalid callback specified');
            }
            this.callback = callback;
            this._target = undefined;
            this._config = undefined;
        }

        babelHelpers.createClass(Observer, [{
            key: 'observe',
            value: function observe(target) {
                var config = arguments.length <= 1 || arguments[1] === undefined ? { recursive: false } : arguments[1];

                var observerList;
                if (!isObservable$1(target)) {
                    throw new Error('Failed to observe not a valid target');
                }
                if (is(config.recursive, 'undefined')) {
                    throw new Error('Invalid config specified');
                }
                observerList = new ObserverList$1();
                observerList.add(this);
                this._target = target;
                this._config = config;
                observable$1(target, observerList);
            }
        }, {
            key: 'disconnect',
            value: function disconnect() {
                if (this._target) {
                    if (this._config.recursive) {
                        disconnectRecursiveObserver$1(this._target, this);
                    }
                    this._target._observers.remove(this);
                }
                this._target = undefined;
                this._config = undefined;
            }
        }]);
        return Observer;
    }();

    var MutationRecord$1 = function MutationRecord(config) {
        babelHelpers.classCallCheck(this, MutationRecord);

        this.type = config.type; //prop or array indicies
        this.target = config.target; //parent object||array
        this.method = config.method; //add,delete,update||push,pop,splice,etc.
        this.args = config.args;
        this.newValue = config.newValue; //newly transformed value
        this.oldValue = config.oldValue; //the old value(s)
    };

    var ObserverList$1 = function () {
        function ObserverList() {
            var observers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
            babelHelpers.classCallCheck(this, ObserverList);

            this.observers = observers;
        }

        babelHelpers.createClass(ObserverList, [{
            key: 'dispatch',
            value: function dispatch(record) {
                if (!record instanceof MutationRecord$1) {
                    throw new Error('Invalid record specified');
                }
                this.observers.forEach(function (observer) {
                    observer.callback(record);
                });
            }
        }, {
            key: 'exists',
            value: function exists(observer) {
                return this.observers.indexOf(observer) !== -1;
            }
        }, {
            key: 'add',
            value: function add(observer) {
                return this.observers.push(observer);
            }
        }, {
            key: 'remove',
            value: function remove(observer) {
                var index = this.observers.indexOf(observer);
                if (index !== -1) {
                    this.observers.splice(index, 1);
                }
                return index;
            }
        }, {
            key: 'recursive',
            value: function recursive() {
                return this.observers.filter(function (observer) {
                    return observer._config.recursive;
                });
            }
        }, {
            key: 'recursiveExists',
            value: function recursiveExists() {
                for (var i = 0, l = this.observers.length; i < l; i++) {
                    if (this.observers[i]._config.recursive) {
                        return true;
                    }
                }
                return false;
            }
        }], [{
            key: 'recursive',
            value: function recursive(list) {
                //factory method for creating a new observer list
                //from an existing observer list where the observers are recursive
                //because this isn't exposed we don't really have to throw here
                if (!list instanceof ObserverList) {
                    throw new Error('Invalid list specified');
                }
                return new ObserverList(list.recursive());
            }
        }]);
        return ObserverList;
    }();

    function observable$1(target, observerList) {
        var recursive = ObserverList$1.recursive(observerList),
            properties = configurableProperties$1(target),
            descriptor;
        if (target._observers) {
            //populate current observerlist with new observers
            //from observerlist
            observerList.observers.forEach(function (observer) {
                if (!target._observers.exists(observer)) {
                    target._observers.add(observer);
                }
            });
        } else {
            descriptor = {
                _observers: {
                    value: observerList,
                    configurable: false
                }
            };
            properties.forEach(function (prop) {
                defineAccessors$1(prop, target[prop], descriptor);
            });
            if (is(target, 'array')) {
                defineObservableArrayMutations$1(target, descriptor);
            } else {
                defineObservableObjectMutations$1(target, descriptor);
            }
            Object.defineProperties(target, descriptor);
        }
        if (recursive.observers.length) {
            for (var i = 0, l = properties.length; i < l; i++) {
                if (isObservable$1(target[properties[i]])) {
                    observable$1(target[properties[i]], recursive);
                }
            }
        }
    }

    function defineObservableObjectMutations$1(target) {
        var descriptor = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        descriptor.add = {
            value: function addOperationClosure(prop, value) {
                addObjectProperty$1(this, prop, value);
            }
        };
        descriptor.delete = {
            value: function deleteOperationClosure(prop) {
                deleteObjectProperty$1(this, prop);
            }
        };
    }

    function defineObservableArrayMutations$1(target) {
        var descriptor = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var _loop = function _loop(i, l) {
            descriptor[ARRAY_MUTATOR_METHODS$1[i]] = {
                value: function arrayOperationClosure() {
                    mutateArray$1({
                        args: Array.prototype.slice.call(arguments),
                        method: ARRAY_MUTATOR_METHODS$1[i],
                        target: this
                    });
                }
            };
        };

        for (var i = 0, l = ARRAY_MUTATOR_METHODS$1.length; i < l; i++) {
            _loop(i, l);
        }
    }

    function isObservable$1(target) {
        return is(target, 'array') || is(target, 'object');
    }

    function configurableProperties$1(target) {
        //getOwnPropertyNames enumerable or not excluding prototype
        return Object.getOwnPropertyNames(target).filter(function (name) {
            return Object.getOwnPropertyDescriptor(target, name).configurable;
        });
    }

    function defineAccessors$1(prop, value) {
        var descriptor = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        descriptor[prop] = {
            get: function get() {
                return value;
            },
            set: function set(newValue) {
                var record = new MutationRecord$1({
                    type: prop,
                    target: this,
                    method: 'set',
                    oldValue: value,
                    newValue: newValue,
                    args: []
                });
                if (this._observers.recursiveExists() && isObservable$1(newValue)) {
                    observable$1(newValue, ObserverList$1.recursive(this._observers));
                }
                if (value && value._observers) {
                    disconnectRecursiveObservers$1(this, value._observers);
                }
                value = newValue;
                this._observers.dispatch(record);
            },
            enumerable: true,
            configurable: true
        };
        return descriptor;
    }

    function addObjectProperty$1(target, prop, newValue) {
        if (!is(target[prop], 'undefined')) {
            throw new Error('Failed to add ' + prop + ' already defined');
        }
        var record = new MutationRecord$1({
            type: prop,
            target: target,
            method: 'add',
            oldValue: target[prop],
            newValue: newValue,
            args: Array.prototype.slice.call(arguments, 1)
        });
        if (target._observers.recursiveExists() && isObservable$1(newValue)) {
            observable$1(newValue, ObserverList$1.recursive(target._observers));
        }
        Object.defineProperties(target, defineAccessors$1(prop, newValue));
        target._observers.dispatch(record);
    }

    function deleteObjectProperty$1(target, prop) {
        if (is(target[prop], 'undefined')) {
            throw new Error('Failed to delete ' + prop + ' does not exist');
        }
        var record = new MutationRecord$1({
            type: prop,
            target: target,
            method: 'delete',
            oldValue: target[prop],
            newValue: undefined,
            args: Array.prototype.slice.call(arguments, 1)
        });
        if (target[prop] && target[prop]._observers) {
            disconnectRecursiveObservers$1(target, target[prop]._observers);
        }
        delete target[prop];
        target._observers.dispatch(record);
    }

    function mutateArray$1(options) {
        var target = options.target,
            args = options.args,
            method = options.method,
            record = new MutationRecord$1({
            type: undefined,
            target: target,
            method: method,
            oldValue: undefined,
            newValue: undefined,
            args: args
        });
        switch (method) {
            case 'fill':
                record.type = args.splice(1);
                record.oldValue = target.slice(args[1], args[2]);
                break;
            case 'pop':
                record.type = target.length - 1;
                record.oldValue = target.slice(target.length - 1);
                break;
            case 'push':
                record.type = target.length;
                record.newValue = args;
                break;
            case 'shift':
                record.type = 0;
                record.oldValue = target.slice(0, 1);
                break;
            case 'unshift':
                record.type = 0;
                record.newValue = args;
                break;
            case 'splice':
                record.type = args[0];
                if (args[1]) {
                    record.oldValue = target.slice(args[0], args[0] + args[1]);
                }
                record.newValue = args.slice(2);
                break;
        }
        if (target._observers.recursiveExists()) {
            record.newValue.forEach(function (val) {
                if (isObservable$1(val)) {
                    observable$1(val, ObserverList$1.recursive(target._observers));
                }
            });
        }
        if (record.oldValue) {
            record.oldValue.forEach(function (val) {
                if (val && val._observers) {
                    disconnectRecursiveObservers$1(target, val._observers);
                }
            });
        }
        Array.prototype[method].apply(target, options.args);
        target._observers.dispatch(record);
    }

    function disconnectRecursiveObserver$1(target, observer) {
        configurableProperties$1(target).forEach(function (prop) {
            disconnectRecursiveObserver$1(target[prop], observer);
            if (target[prop]._observers) {
                target[prop]._observers.remove(observer);
            }
        });
    }

    function disconnectRecursiveObservers$1(target, observerList) {
        target._observers.recursive().forEach(function (observer) {
            observerList.remove(observer);
        });
    }

    var Bind = function () {
        function Bind(traverse, transform) {
            babelHelpers.classCallCheck(this, Bind);

            this.traversal = traversalMethod(traverse);
            this.transform = transform;
        }

        babelHelpers.createClass(Bind, [{
            key: 'render',
            value: function render(nodes, data) {
                var binding = {
                    data: data,
                    instance: this
                };
                if (is(nodes, 'array')) {
                    for (var i = 0, l = nodes.length; i < l; i++) {
                        nodeBinding(nodes[i], binding);
                    }
                } else {
                    nodeBinding(nodes, binding);
                }
            }
        }, {
            key: 'compile',
            value: function compile(node, binding) {
                //called when the node is compiled
            }
        }]);
        return Bind;
    }();

    function nodeBinding(node, binding) {
        var instance = binding.instance,
            valueObject = instance.traversal(binding.data, node);

        //call transform.bind with node and value determined by traversal?
        instance.transform.bind(node, binding);
        node.bindings.push(binding);
    }

    function traversalMethod(traverse) {
        if (is(traverse, 'function')) {
            return traverse;
        } else if (is(traverse, 'string')) {
            return keypathTraversal.bind(null, traverse);
        }
    }

    function keypathTraversal(keypath, data, node) {
        var keys = keypath.split('.'),
            key = keys.slice(-1)[0],
            parent = undefined,
            value = data;
        while (keys.length) {
            parent = value;
            value = resolveKeypath(value, keys);
        }
        return {
            key: key,
            parent: parent,
            value: value
        };
    }

    function resolveKeypath(target, keypath) {
        var key = keypath.shift();
        if (typeof target[key] === 'undefined') {
            throw new Error('Failed to resolve \'' + key + '\' on target');
        }
        return target[key];
    }

    var Signal = function () {
        function Signal() {
            babelHelpers.classCallCheck(this, Signal);

            this.listeners = [];
        }

        babelHelpers.createClass(Signal, [{
            key: "add",
            value: function add(listener) {
                this.listeners.push(listener);
            }
        }, {
            key: "remove",
            value: function remove(listener) {
                if (listener) {
                    return this.listeners.splice(this.listeners.indexOf(listener), 1);
                }
                this.listeners = [];
            }
        }, {
            key: "dispatch",
            value: function dispatch() {
                var _this = this;

                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return this.listeners.map(function (listener) {
                    return listener.apply(_this, args);
                });
            }
        }]);
        return Signal;
    }();

    var Store = function () {
        function Store() {
            var _this = this;

            var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
            var mutations = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            babelHelpers.classCallCheck(this, Store);

            this._state = state;
            this._mutations = {};
            Object.keys(mutations).forEach(function (name) {
                _this._mutations[name] = new Signal();
                _this._mutations[name].add(mutations[name]);
            });
        }

        babelHelpers.createClass(Store, [{
            key: 'dispatch',
            value: function dispatch(name) {
                var mutation = this._mutations[name];
                if (!mutation) {
                    throw new Error(name + ' mutation does not exist');
                }

                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                mutation.dispatch(this.state, args);
            }
        }]);
        return Store;
    }();

    var VOID_TAGS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

    var IGNORE_TAGS = ['script'];

    function isVoid(name) {
        for (var i = 0, l = VOID_TAGS.length; i < l; i++) {
            if (VOID_TAGS[i] === name) return true;
        }
        return false;
    }

    function isWhitespace(str) {
        //tab, line feed, carriage return, and space
        return !/[^\t\n\r ]/.test(str);
    }

    function clean(source) {
        //removes tabs, line feeds, carriage returns, and any more than 2 or greater spaces
        return source.toString().replace(/[\t\n\r]|\s{2,}/g, '');
    }

    function hasChildren(source, callback) {
        if (source.hasChildNodes()) {
            var childNodes = source.childNodes;
            for (var i = 0, l = childNodes.length; i < l; i++) {
                parseDOM(childNodes[i], callback);
            }
        }
    }

    function parseTag(tag) {
        var evt = {},
            reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)=["']([^"']+)["'])/g,
            match = tag.match(reg);
        if (match.length > 1) evt.attributes = {};
        for (var i = 0, l = match.length; i < l; i++) {
            var keyVal = match[i].split('=');
            if (i === 0) {
                //evt.name = keyVal[0].replace('/','').replace('>','').trim();
                evt.name = keyVal[0].replace(/[\/>]/g, '').trim();
            } else if (keyVal.length > 1) {
                evt.attributes[keyVal[0].trim()] = keyVal[1].replace(/["'>]/g, '').trim();
            } else {
                evt.attributes[keyVal[0].replace(/[>]/g, '').trim()] = null;
            }
        }
        return evt;
    }

    //cloneNode prior to avoid heavy dom reads
    function parseDOM(source, callback) {
        var evt;
        if (IGNORE_TAGS.indexOf(source.nodeName.toLowerCase()) !== -1) return;
        if (source instanceof DocumentFragment) {
            hasChildren(source, callback);
            return;
        }
        if (source.nodeType === 3) {
            if (isWhitespace(source.nodeValue) || !clean(source.nodeValue).length) return;
            return callback({
                type: 'text',
                textNode: source,
                value: clean(source.nodeValue)
            });
        }
        evt = {
            documentElement: source,
            name: source.nodeName.toLowerCase(),
            void: isVoid(source.nodeName.toLowerCase())
        };

        if (source.attributes.length) {
            evt.attributes = {};
            source.attributes.forEach(function (attribute) {
                evt.attributes[attribute.name] = attribute.value;
            });
        }
        evt.type = 'start';
        if (!evt.void) callback(evt);
        hasChildren(source, callback);
        if (evt.attributes && !evt.void) delete evt.attributes;
        evt.type = 'end';
        callback(evt);
    }

    function parseHTML(source, callback) {
        var endOfTagIndex, startTag, evt;
        //nodejs buffer and remove all line breaks aka dirty
        //source = source.toString().replace(/\n/g,'').replace(/\r/g,'');
        source = clean(source);
        while (source) {
            var nextTagIndex = source.indexOf('<');
            if (nextTagIndex >= 0) {
                //start element exists in string
                //need to convert content to evt
                if (nextTagIndex > 0) {
                    callback({
                        type: 'text',
                        value: source.substring(0, nextTagIndex)
                    });
                }
                //set html string to index of new element to end
                source = source.substring(nextTagIndex);
                endOfTagIndex = source.indexOf('>') + 1;
                startTag = source.substring(0, endOfTagIndex);
                evt = parseTag(startTag);
                //if not xhtml void tag check tagname for html5 valid void tags
                evt.void = source[startTag.length - 2] === '/' || isVoid(evt.name);
                if (startTag[1] === '!') {
                    //comment, ignore?
                    endOfTagIndex = source.indexOf('-->') + 1;
                } else if (startTag[1] === '/' || evt.void) {
                    //void tag or end tag. start is never called for void tags
                    evt.type = 'end';
                    callback(evt);
                } else {
                    //start tag
                    evt.type = 'start';
                    callback(evt);
                }
                // substring to end of tag
                source = source.substring(endOfTagIndex);
            } else {
                callback({
                    type: 'text',
                    value: source
                });
                source = null;
            }
        }
    }

    function parseJSONML(source, callback) {
        var index = 1,
            evt;
        if ((is(source[0], 'array') || is(source[0], 'object')) && typeof source[0].length !== 'undefined') {
            parseJSONML(source[0], callback);
        } else {
            evt = {
                name: source[0],
                void: isVoid(source[0]),
                type: 'start'
            };
            if (source.length > 1 && source[1].toString() === '[object Object]') {
                index++;
                //copy primitave values to new object
                evt.attributes = extend({}, source[1]);
            }
            if (!evt.void) callback(evt);
        }

        while (index < source.length) {
            if (is(source[index], 'string') || source[index].value) {
                callback({
                    type: 'text',
                    value: source.value || source[index]
                });
            } else {
                parseJSONML(source[index], callback);
            }
            index++;
        }
        if (typeof evt === 'undefined') return;
        if (evt.attributes && !evt.void) delete evt.attributes;
        evt.type = 'end';
        callback(evt);
    }

    function parse(source) {
        var template = new Fragment(),
            transclude;
        if (is(source, 'string')) {
            parseHTML(source, callback);
        } else if (source.nodeName) {
            if (document.contains(source)) {
                transclude = source;
                parseDOM(source.cloneNode(true), callback);
            } else {
                parseDOM(source, callback);
            }
        } else {
            parseJSONML(source, callback);
        }
        function callback(evt) {
            var element;
            switch (evt.type) {
                case 'text':
                    template.append(new Text(evt.value));
                    break;
                case 'start':
                    element = new Element(evt.name, evt.attributes);
                    template.append(element);
                    template = element;
                    break;
                case 'end':
                    if (evt.void) {
                        element = new Element(evt.name, evt.attributes, evt.void);
                        template.append(element);
                    } else {
                        if (template.parent) {
                            template = template.parent;
                        }
                    }
                    break;
            }
        }
        template = template.children.length === 1 ? template.children[0] : template;
        template.transclude = transclude;
        return template;
    }

    var id = undefined;
    var requested = undefined;
    var running = undefined;
    var queue = undefined;
    function done() {
        id = null;
        requested = false;
        running = false;
        queue = [];
    }

    done();

    function run() {
        running = true;
        for (var i = 0; i < queue.length; i++) {
            queue[i].call();
        }
        done();
    }

    function add(fn) {
        queue.push(fn);
        if (!requested) {
            id = paint(run);
            requested = true;
        }
        return id;
    };

    var NAMESPACE_URI = {
        html: 'http://www.w3.org/1999/xhtml',
        svg: 'http://www.w3.org/2000/svg',
        xlink: 'http://www.w3.org/1999/xlink'
    };

    function xmlNamespace(node) {
        while (node) {
            if (node.DOMNode) {
                return node.DOMNode.namespaceURI;
            }
            if (node.name === 'svg') {
                return NAMESPACE_URI.svg;
            }
            node = node.parent instanceof Element ? node.parent : false;
        }
        return NAMESPACE_URI.html;
    }

    function attrNamespace(name) {
        var i = name.indexOf(':'),
            ns = null;
        if (i >= 0) {
            ns = NAMESPACE_URI[name.substring(0, i)] || null;
        }
        return ns;
    }

    function textNodeMutationCallback(record) {
        if (record.type === 'textContent' && record.oldValue !== record.newValue) {
            add(function () {
                record.target.parent.DOMNode.textContent = record.newValue;
            });
        }
    }

    function attributeMutationCallback(record) {
        var node = undefined;
        if (record.oldValue === record.newValue) {
            return;
        }
        node = record.target.parent;
        switch (record.method) {
            case 'delete':
                add(function () {
                    node.DOMNode.removeAttributeNS(attrNamespace(record.type), record.type);
                });
                break;
            case 'add':
            case 'set':
                add(function () {
                    node.DOMNode.setAttributeNS(attrNamespace(record.type), record.type, record.newValue);
                });
                break;
        }
    }

    function childrenMutationCallback(record) {
        var DOMNode = record.target.parent.DOMNode;
        switch (record.method) {
            case 'push':
                record.newValue.forEach(function (child) {
                    add(function () {
                        DOMNode.appendChild(child.DOMNode);
                    });
                });
                break;
            case 'unshift':
                record.newValue.forEach(function (child) {
                    add(function () {
                        DOMNode.insertBefore(child.DOMNode, DOMNode.firstChild);
                    });
                });
                break;
            case 'splice':
                if (record.oldValue && record.oldValue.length) {
                    add(function () {
                        DOMNode.removeChild(record.oldValue[0].DOMNode);
                    });
                }
                if (record.args.length === 3) {
                    add(function () {
                        DOMNode.insertBefore(record.newValue[0].DOMNode, DOMNode.childNodes[record.type]);
                    });
                }
                break;
        }
    }

    function compileDOM(node) {
        var textObserver = undefined,
            attributeObserver = undefined,
            childrenObserver = undefined;
        if (node instanceof Text) {
            node.DOMNode = document.createTextNode(node.value.textContent);
            textObserver = new Observer(textNodeMutationCallback);
            textObserver.observe(node.value);
            node.observers.push(textObserver);
        } else if (node instanceof Element) {
            node.DOMNode = document.createElementNS(xmlNamespace(node), node.name);
            Object.keys(node.attributes).forEach(function (key) {
                node.DOMNode.setAttributeNS(attrNamespace(key), key, node.attributes[key]);
            });
            attributeObserver = new Observer(attributeMutationCallback);
            childrenObserver = new Observer(childrenMutationCallback);
            attributeObserver.observe(node.attributes);
            childrenObserver.observe(node.children);
            node.observers.push(attributeObserver);
            node.observers.push(childrenObserver);
        } else if (node instanceof Fragment) {
            node.DOMNode = document.createDocumentFragment();
            childrenObserver = new Observer(childrenMutationCallback);
            childrenObserver.observe(node.children);
            node.observers.push(childrenObserver);
        } else {
            throw new Error('Unspecified node instance');
        }
        if (node.parent) {
            node.parent.DOMNode.appendChild(node.DOMNode);
        }
    }

    function compileBindings(node) {
        for (var i = 0, l = node.bindings.length; i < l; i++) {
            node.bindings[i].instance.compile(node, node.bindings[i]);
        }
    }

    function compile(template) {
        if (!template instanceof Node) {
            throw new Error('Template param must be of type Node');
        }
        if (template.compiled === true) {
            throw new Error('Specified template is already compiled');
        }
        var clone = template.clone(true);
        compileNode(clone);
        return clone;
    }

    function compileNode(node) {
        if (typeof document !== 'undefined') {
            compileDOM(node);
        }
        compileBindings(node);
        node.compiled = true;
        if (node.children) {
            node.children.forEach(compileNode);
        }
    }

    function clone(node) {
        var deep = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        var clone = undefined;
        if (!node instanceof Node) {
            throw new Error('Node param must be of type Node');
        }
        clone = node.clone(deep);
        if (node.compiled === true) {
            clone = compile(clone);
        }
        return clone;
    }

    function transclude(node, target) {
        if (typeof document === 'undefined') {
            throw new Error('transclude requires a document');
        }
        if (!node.transclude && !target) {
            throw new Error('unspecified transclusion target');
        }
        target = node.transclude || target;
        target.parentNode.insertBefore(node.DOMNode, target);
        target.parentNode.removeChild(target);
        node.transclude = undefined;
    }

    var index = {
        version: '0.1.14',
        util: util,
        vdom: vdom,
        transforms: transforms,
        Observer: Observer,
        Transform: Transform,
        Bind: Bind,
        Store: Store,
        parse: parse,
        compile: compile,
        clone: clone,
        transclude: transclude
    };

    return index;

}));
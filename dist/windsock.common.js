'use strict';

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
        for (var key in arguments[i]) {
            obj[key] = arguments[i][key];
        }
    }
    return obj;
}

function clone(obj) {
    var c = {};
    Object.keys(obj).forEach(function cloneKeyIterator(key) {
        c[key] = is(obj[key], 'object') ? clone(obj[key]) : obj[key];
    });
    return c;
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
    clone: clone,
    match: match,
    noop: noop
});

function parse$1(str) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var params = {},
        decode = options.decode || decodeURIComponent;
    if (!is(str, 'string')) {
        throw new Error('Parameter must be a string');
    }
    str = options.query ? normalize(str) : str;
    str.split('&').forEach(function paramParseMap(pair) {
        if (!pair) return;
        pair = pair.split('=');
        params[decode(pair[0])] = pair.length === 1 ? null : decode(pair[1]);
    });
    return params;
}

function format$1(params) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var str = void 0,
        encode = options.encode || encodeURIComponent;
    if (!is(params, 'object')) {
        throw new Error('Parameter must be an object');
    }
    str = Object.keys(params).map(function paramFormatMap(key) {
        var val = params[key] ? '=' + encode(params[key]) : '';
        return encode(key) + val;
    }).join('&');
    return str.length ? options.query ? '?' + str : str : '';
}

function normalize(query) {
    if (!is(query, 'string')) {
        throw new Error('Parameter must be a string');
    }
    if (query.indexOf('?') === 0) {
        query = query.replace('?', '');
    }
    return query;
}

var query = Object.freeze({
    parse: parse$1,
    format: format$1,
    normalize: normalize
});

function parse$2(path) {
    var params = {};
    if (!is(path, 'string')) {
        throw new Error('Parameter must be a string');
    }
    path = normalize$1(path);
    path && path.split('/').forEach(function pathParseMap(slug, i) {
        if (slug.indexOf(':') === 0 && slug.length > 1) {
            params[slug.replace(':', '')] = i;
        }
    });
    return params;
}

function format$2(path, params) {
    if (!is(params, 'object')) {
        throw new Error('Parameter must be an object');
    }
    for (var key in params) {
        var val = params[key];
        val = val.toString ? val.toString() : '';
        path = path.replace((val.length ? ':' : '/:') + key, val);
    }
    return path;
}

function normalize$1(path) {
    if (!is(path, 'string')) {
        throw new Error('Parameter must be a string');
    }
    return path.replace(/^\/|\/$/g, '');
}

var path = Object.freeze({
    parse: parse$2,
    format: format$2,
    normalize: normalize$1
});

var a = void 0;

if (typeof document !== 'undefined') {
    a = document.createElement('a');
}

function parse(str) {
    if (!a) {
        throw new Error('Unable to parse in enviorment');
    }
    if (!is(str, 'string')) {
        throw new Error('Parameter must be a string');
    }
    a.href = str;
    return {
        protocol: a.protocol || null,
        host: a.host || null,
        port: a.port || null,
        hostname: a.hostname || null,
        hash: a.hash || null,
        search: a.search || null,
        query: parse$1(a.search, { query: true }),
        pathname: a.pathname || null,
        path: parse$2(a.pathname),
        href: a.href
    };
}

function format(obj) {
    var protocol = void 0,
        host = void 0,
        pathname = void 0,
        search = void 0,
        params = void 0,
        hash = void 0;
    if (!a) {
        throw new Error('Unable to format in enviorment');
    }
    if (!is(obj, 'object')) {
        throw new Error('Parameter must be an object');
    }
    protocol = obj.protocol || '';
    host = obj.host || '';
    pathname = format$2(obj.pathname, obj.path);
    search = obj.search || '';
    params = format$1(obj.query, { query: true });
    hash = obj.hash || '';
    //plan to actually look at protocol
    return protocol + '//' + host + pathname + (params || search) + hash;
}

var url = Object.freeze({
    query: query,
    path: path,
    parse: parse,
    format: format
});

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
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

var get = function get(object, property, receiver) {
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

var inherits = function (subClass, superClass) {
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

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var queue = [];
var active = [];
var states = {};
var config = {
    hash: undefined,
    root: undefined,
    reactivate: undefined,
    otherwise: undefined,
    post: undefined
};
var listener = void 0;
var request = void 0;
var routing = void 0;
var re = void 0;
var i = void 0;
function reset() {
    started() && stop();
    while (queue.length) {
        queue.pop();
    }
    while (active.length) {
        active.pop();
    }
    Object.keys(states).forEach(function (p) {
        return delete states[p];
    });
    config.hash = true;
    config.root = 'root';
    config.reactivate = false;
    config.otherwise = undefined;
    config.post = undefined;
    listener = undefined;
    request = undefined;
    routing = false;
    re = [];
    i = undefined;
}

reset();

function register(p) {
    var h = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (invalid(p)) {
        throw new Error('invalid path');
    }
    if (!is(h, 'object')) {
        throw new Error('parameter must be an object');
    }
    p = prefix(p);
    if (!states[p]) {
        states[p] = [h];
    } else {
        states[p].push(h);
    }
    return states[p];
}

function go(p) {
    var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var prefixed = void 0,
        segments = void 0,
        req = void 0;
    if (invalid(p)) {
        throw new Error('Invalid path format');
    }
    if (invalidParams(p, params.path)) {
        throw new Error('Invalid params for path ' + p);
    }
    prefixed = prefix(p);
    segments = states[prefixed] || is(config.otherwise, 'undefined') ? prefixed.split('/') : prefix(config.otherwise).split('/');
    params.requested = p;
    params.query = params.query || {};
    req = new Request(segments, params);
    queue.push(req);
    if (!routing) {
        tick(next);
    }
    return req.promise;
}

function start() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var hash = _ref.hash;
    var root = _ref.root;
    var reactivate = _ref.reactivate;
    var otherwise = _ref.otherwise;
    var post = _ref.post;

    config.hash = is(hash, 'undefined') ? config.hash : hash;
    config.root = is(root, 'undefined') ? config.root : root;
    config.reactivate = is(reactivate, 'undefined') ? config.reactivate : reactivate;
    config.otherwise = is(otherwise, 'undefined') || invalid(otherwise) ? config.otherwise : otherwise;
    config.post = is(post, 'undefined') || !is(post, 'function') ? config.post : post;
    listen(function listenCallback(evt) {
        var pathname = normalize$1(config.hash ? location.hash.replace('#', '') : location.pathname),
            p = resolve(pathname),
            params = void 0;
        if (p) {
            p = p.slice(1).join('/');
            pathname = pathname.split('/');
            params = {
                path: parse$2(p),
                query: parse$1(location.search, {
                    query: true
                }),
                replace: true,
                event: evt
            };
            for (var key in params.path) {
                params.path[key] = pathname[params.path[key]];
            }
            !invalid(p) && go(p, params);
        }
    });
    listener && listener();
}

function stop() {
    listen();
}

function started() {
    return !!listener;
}

var Request = function () {
    function Request(segments) {
        var _this = this;

        var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        classCallCheck(this, Request);

        if (!segments) {
            throw new Error('unspecified segments');
        }
        if (!is(segments, 'array')) {
            throw new Error('segments must be an array');
        }
        this.segments = segments;
        this.requested = params.requested;
        this.resolved = undefined;
        this.target = undefined;
        this.previous = params.previous;
        this.path = params.path;
        this.query = params.query;
        this.replace = params.replace;
        this.event = params.event;
        this.promise = new Promise(function (res, rej) {
            _this.resolve = res;
            _this.reject = rej;
        });
    }

    createClass(Request, [{
        key: 'toString',
        value: function toString() {
            var p = this.segments.slice(1).join('/'),
                pathname = this.path ? format$2(p, this.path) : p,
                search = this.query ? format$1(this.query, {
                query: true
            }) : '';
            return pathname + search;
        }
    }]);
    return Request;
}();

function listen(fn) {
    var evt = void 0;
    if (typeof window === 'undefined') {
        return;
    }
    evt = config.hash ? 'hashchange' : 'popstate';
    if (!fn) {
        if (!listener) {
            throw new Error('router no started');
        }
        typeof window !== 'undefined' && window.removeEventListener(evt, listener);
        listener = undefined;
    } else {
        if (listener) {
            throw new Error('router already started');
        }
        listener = fn;
        window.addEventListener(evt, listener);
    }
}

function prefix(p) {
    return '' + config.root + (p ? '/' + p : '');
}

function resolve(pathname) {
    var match = {
        literal: 0,
        variable: 0
    },
        resolved = void 0;
    pathname = prefix(pathname).split('/');
    Object.keys(states).forEach(function (p) {
        var slugs = p.split('/'),
            result = void 0;
        if (slugs.length > pathname.length) {
            return;
        }
        result = compare(slugs, pathname);
        //if compare returns 0, just throw it out
        if (result.literal === 0) {
            return;
        }
        if (result.literal > match.literal || result.literal === match.literal && result.variable > match.variable) {
            match = result;
            resolved = p;
        }
    });
    if (resolved) {
        resolved = resolved.split('/');
        resolved = resolved.concat(pathname.slice(resolved.length));
    }
    return resolved;
}

function compare(p, pathname) {
    var result = {
        literal: 0,
        variable: 0
    };
    for (var n = 0, l = p.length; n < l; n++) {
        if (p[n].indexOf(':') === 0) {
            result.variable++;
        } else {
            if (p[n] !== pathname[n]) {
                result.literal = 0;
                return result;
            }
            result.literal++;
        }
    }
    return result;
}

function next() {
    var previous = void 0;
    if (queue.length) {
        routing = true;
        previous = request;
        request = queue.shift();
        request.previous = previous;
        parse$3();
    } else {
        routing = false;
    }
}

function parse$3() {
    i = 0;
    while (i < request.segments.length) {
        if (request.segments[i] !== active[i]) {
            deactivate();
            return;
        }
        i++;
    }
    deactivate();
}

function deactivate() {
    var state = void 0;
    if (active.length - i > 0) {
        state = states[active.join('/')];
        if (state) {
            request.target = active.slice(1).join('/');
            series(state.map(function (h) {
                return h.deactivate || noop;
            })).then(function () {
                active.pop();
                deactivate();
            }).catch(function (e) {
                request.reject(e);
                tick(next);
            });
        } else {
            active.pop();
            deactivate();
        }
    } else {
        reactivateRequest() ? reactivate() : activate();
    }
}

function reactivateRequest() {
    var prev = request.previous;
    if (config.reactivate || request.segments.length === 1) {
        return true;
    }
    if (prev) {
        return request.requested === prev.requested && (!match(request.query, prev.query) || !match(prev.query, request.query));
    }
    return false;
}

function reactivate() {
    var state = void 0;
    if (re.length < active.length) {
        re = active.slice(0, re.length + 1);
        state = states[re.join('/')];
        if (state) {
            request.target = active.slice(1).join('/');
            series(state.map(function (h) {
                return h.activate || noop;
            })).then(reactivate).catch(function (e) {
                request.reject(e);
                re = [];
                tick(next);
            });
            return;
        }
    }
    re = [];
    activate();
}

function activate() {
    var state = void 0;
    if (active.length < request.segments.length) {
        active.push(request.segments[active.length]);
        state = states[active.join('/')];
        if (state) {
            request.target = active.slice(1).join('/');
            series(state.map(function (h) {
                return h.activate || noop;
            })).then(activate).catch(function (e) {
                request.reject(e);
                tick(next);
            });
        } else {
            activate();
        }
    } else {
        request.resolved = request.toString();
        if (typeof window !== 'undefined') {
            if (request.replace) {
                typeof window.history !== 'undefined' && window.history.replaceState({}, '', (config.hash ? '#/' : '/') + request.resolved);
            } else {
                typeof window.history !== 'undefined' && window.history.pushState({}, '', (config.hash ? '#/' : '/') + request.resolved);
            }
        }
        request.resolve(request);
        config.post && config.post(request);
        tick(next);
    }
}

function series(fns) {
    return fns.reduce(function (promise, fn) {
        return promise.then(function () {
            return fn(request);
        });
    }, Promise.resolve());
}

function invalid(p) {
    return (/^\/|[^#]\/$/.test(p)
    );
}

function invalidParams(p, obj) {
    var pathMap = parse$2(p),
        keys = Object.keys(pathMap);
    if (keys.length && (is(obj, 'undefined') || !is(obj, 'object'))) {
        return true;
    }
    for (var key in pathMap) {
        if (is(obj[key], 'undefined')) {
            return true;
        }
    }
    return false;
}



var router = Object.freeze({
    reset: reset,
    register: register,
    go: go,
    start: start,
    stop: stop,
    started: started,
    Request: Request
});

var Signal = function () {
    function Signal() {
        classCallCheck(this, Signal);

        this.listeners = [];
    }

    createClass(Signal, [{
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

var Node = function () {
    function Node() {
        classCallCheck(this, Node);

        this.compiled = false;
        this.transclude = undefined;
        this.DOMNode = undefined;
        this.observers = [];
        this.bindings = {};
        this.events = defineEventsParent(this);
    }

    createClass(Node, [{
        key: 'destroy',
        value: function destroy() {
            var _this = this;

            this.compiled = false;
            this.transclude = undefined;
            paint(function () {
                _this.DOMNode = undefined;
            });
            while (this.observers.length) {
                this.observers.pop().disconnect();
            }
            for (var key in this.bindings) {
                this.bindings[key].observer.disconnect();
                delete this.bindings[key];
            }
            for (var evt in this.events) {
                this.events[evt].remove();
                delete this.events[evt];
            }
        }
    }, {
        key: 'clone',
        value: function clone() {
            return Node.clone(new Node(), this);
        }
    }, {
        key: 'on',
        value: function on(evt, callback) {
            var capture = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            if (!this.events[evt]) {
                if (this.compiled) {
                    this.events.add(evt, new Signal());
                } else {
                    this.events[evt] = new Signal();
                    this.events[evt].capture = capture;
                }
            }
            this.events[evt].add(callback);
        }
    }, {
        key: 'off',
        value: function off(evt, callback) {
            this.events[evt].remove(callback);
            if (!this.events[evt]) {
                delete this.events[evt];
            }
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
    }], [{
        key: 'clone',
        value: function clone(target, instance) {
            var deep = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            target.transclude = instance.transclude;
            for (var key in instance.bindings) {
                target.bindings[key] = instance.bindings[key];
            }
            if (deep) {
                for (var evt in instance.events) {
                    target.events[evt] = new Signal();
                    target.events[evt].capture = instance.events[evt].capture;
                    target.events[evt].listeners = instance.events[evt].listeners.slice();
                }
            }
        }
    }]);
    return Node;
}();

function defineEventsParent(instance) {
    var events = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    Object.defineProperty(events, 'parent', {
        value: instance,
        enumerable: false,
        writable: false,
        configurable: false
    });
    return events;
}

var Text = function (_Node) {
    inherits(Text, _Node);

    function Text(value) {
        classCallCheck(this, Text);

        var _this = possibleConstructorReturn(this, Object.getPrototypeOf(Text).call(this));

        _this.value = {
            textContent: value
        };
        defineAttributesParent(_this, _this.value);
        _this.parent = undefined;
        return _this;
    }

    createClass(Text, [{
        key: 'destroy',
        value: function destroy() {
            get(Object.getPrototypeOf(Text.prototype), 'destroy', this).call(this);
            if (!is(this.parent, 'undefined')) {
                this.remove();
            }
        }
    }, {
        key: 'clone',
        value: function clone() {
            var node = new Text(this.value.textContent);
            Node.clone(node, this);
            return node;
        }
    }, {
        key: 'remove',
        value: function remove() {
            if (is(this.parent, 'undefined')) {
                throw new Error('Failed to remove node');
            }
            this.parent.children.splice(this.index(), 1);
            this.parent = undefined;
        }
    }, {
        key: 'index',
        value: function index() {
            if (is(this.parent, 'undefined')) {
                return -1;
            }
            return this.parent.children.indexOf(this);
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
    inherits(Fragment, _Node);

    function Fragment() {
        classCallCheck(this, Fragment);

        var _this = possibleConstructorReturn(this, Object.getPrototypeOf(Fragment).call(this));

        _this.children = defineChildrenParent(_this);
        return _this;
    }

    createClass(Fragment, [{
        key: 'destroy',
        value: function destroy() {
            get(Object.getPrototypeOf(Fragment.prototype), 'destroy', this).call(this);
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
                this.children.forEach(function fragmenChildCloneIterator(child) {
                    fragment.append(child.clone(true));
                });
            }
            Node.clone(fragment, this, deep);
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
                result = void 0;
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
                if (!is(this.children[i].filter, 'undefined')) {
                    result = result.concat(this.children[i].filter(predicate));
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
            return this.children.map(fragmentChildHtmlMapper).join('');
        }
    }]);
    return Fragment;
}(Node);

function fragmentChildHtmlMapper(child) {
    return child.html;
}

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
    return child.name && child.name === query;
}

function nodeAttributePredicate(query, child) {
    if (!child.attributes) {
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
    inherits(Element, _Fragment);

    function Element(name) {
        var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var empty = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        classCallCheck(this, Element);

        if (!name) {
            throw new Error('Failed to instantiate Element invalid name specified');
        }

        var _this = possibleConstructorReturn(this, Object.getPrototypeOf(Element).call(this));

        _this.name = name;
        _this.attributes = defineAttributesParent$1(_this, clone(attributes));
        _this.empty = empty;
        return _this;
    }

    createClass(Element, [{
        key: 'destroy',
        value: function destroy() {
            get(Object.getPrototypeOf(Element.prototype), 'destroy', this).call(this);
            if (!is(this.parent, 'undefined')) {
                this.remove();
            }
            this.attributes = defineAttributesParent$1(this);
            this.empty = false;
        }
    }, {
        key: 'clone',
        value: function clone$$() {
            var deep = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var element = new Element(this.name, clone(this.attributes));
            if (deep && this.children.length) {
                this.children.forEach(function (child) {
                    element.append(child.clone(true));
                });
            }
            Node.clone(element, this, deep);
            return element;
        }
    }, {
        key: 'remove',
        value: function remove() {
            if (is(this.parent, 'undefined')) {
                throw new Error('Failed to remove node');
            }
            this.parent.children.splice(this.index(), 1);
            this.parent = undefined;
        }
    }, {
        key: 'index',
        value: function index() {
            if (is(this.parent, 'undefined')) {
                return -1;
            }
            return this.parent.children.indexOf(this);
        }
    }, {
        key: 'jsonml',
        get: function get() {
            var jsonml = [];
            jsonml.push(this.name);
            if (is(this.attributes, 'empty') === false) {
                jsonml.push(clone(this.attributes));
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
    }, {
        key: 'class',
        get: function get() {
            if (is(this.classList, 'undefined')) {
                this.classList = new ClassList(this.attributes, this.compiled);
            }
            return this.classList;
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

var ClassList = function () {
    function ClassList(attributes, compiled) {
        classCallCheck(this, ClassList);

        this.compiled = compiled;
        this.attributes = attributes;
    }

    createClass(ClassList, [{
        key: 'toggle',
        value: function toggle(str) {
            if (invalidClassName(str)) {
                throw new Error('Invalid classname \'' + str + '\' passed to toggle method');
            }
            this.contains(str) ? this.remove(str) : this.add(str);
        }
    }, {
        key: 'add',
        value: function add(str) {
            if (invalidClassName(str)) {
                throw new Error('Invalid classname \'' + str + '\' passed to add method');
            }
            if (!this.contains(str)) {
                if (is(this.attributes.class, 'undefined') && this.compiled) {
                    this.attributes.add('class', str);
                    return;
                }
                if (is(this.attributes.class, 'string') && this.attributes.class.length) {
                    str = this.attributes.class + ' ' + str;
                }
                this.attributes.class = str;
            }
        }
    }, {
        key: 'remove',
        value: function remove(str) {
            var i = void 0;
            if (invalidClassName(str)) {
                throw new Error('Invalid classname \'' + str + '\' passed to remove method');
            }
            i = this.index(str);
            if (i !== -1) {
                if (this.attributes.class.length > str.length) {
                    str = i === 0 ? str + ' ' : ' ' + str;
                }
                this.attributes.class = this.attributes.class.replace(str, '');
            }
        }
    }, {
        key: 'contains',
        value: function contains(str) {
            if (invalidClassName(str)) {
                throw new Error('Invalid classname \'' + str + '\' passed to contains method');
            }
            return this.index(str) !== -1;
        }
    }, {
        key: 'index',
        value: function index(str) {
            if (invalidClassName(str)) {
                throw new Error('Invalid classname \'' + str + '\' passed to index method');
            }
            return this.attributes.class ? this.attributes.class.split(' ').indexOf(str) : -1;
        }
    }]);
    return ClassList;
}();

function invalidClassName(str) {
    return (/\s/.test(str)
    );
}

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
        reg = /(([\w\-:]+([\s]|[\/>]))|([\w\-:]+)=["']([^"']+)["'])/g,
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
        Array.prototype.forEach.call(source.attributes, function nodeAttributeIterator(attribute) {
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

function parse$4(source) {
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

var ARRAY_MUTATOR_METHODS = ['fill', 'pop', 'push', 'shift', 'splice', 'unshift'];

var Observer = function () {
    function Observer(callback) {
        classCallCheck(this, Observer);

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

    createClass(Observer, [{
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
    classCallCheck(this, MutationRecord);

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
        classCallCheck(this, ObserverList);

        this.observers = observers;
    }

    createClass(ObserverList, [{
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

var queue$1 = [];

var id = void 0;
var requested = void 0;
function done() {
    id = null;
    requested = false;
    queue$1.length = 0;
}

done();

function run() {
    for (var i = 0; i < queue$1.length; i++) {
        queue$1[i].call();
    }
    done();
}

function add(fn) {
    queue$1.push(fn);
    if (!requested) {
        id = paint(run);
        requested = true;
    }
    return id;
};

var ARRAY_MUTATOR_METHODS$1 = ['fill', 'pop', 'push', 'shift', 'splice', 'unshift'];

var Observer$1 = function () {
    function Observer(callback) {
        classCallCheck(this, Observer);

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

    createClass(Observer, [{
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
    classCallCheck(this, MutationRecord);

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
        classCallCheck(this, ObserverList);

        this.observers = observers;
    }

    createClass(ObserverList, [{
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
    function Bind() {
        var transform = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var _ref$recursive = _ref.recursive;
        var recursive = _ref$recursive === undefined ? false : _ref$recursive;
        var _ref$parsed = _ref.parsed;
        var parsed = _ref$parsed === undefined ? false : _ref$parsed;
        classCallCheck(this, Bind);

        if (is(transform, 'function')) {
            this.transform = {
                bind: transform,
                update: transform
            };
        } else {
            this.transform = transform;
        }
        this.recursive = recursive;
        this.parsed = parsed;
    }

    createClass(Bind, [{
        key: 'render',
        value: function render(node, target) {
            var keypath = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

            var targetMap = void 0;
            if (node.compiled) {
                throw new Error('Requires an uncompiled node');
            }
            targetMap = keypathTraversal(target, keypath);
            if (is(node, 'array')) {
                for (var i = 0, l = node.length; i < l; i++) {
                    renderNode(node[i], this, targetMap);
                }
            } else {
                renderNode(node, this, targetMap);
            }
        }
    }], [{
        key: 'observer',
        value: function observer(node, binding) {
            var target = binding.target,
                instance = binding.instance,
                observer = void 0;
            if (is(target.value, 'object') || is(target.value, 'array')) {
                observer = new Observer$1(function objectBindObserverCallback(mutation) {
                    instance.transform.update && instance.transform.update(node, binding, mutation);
                });
                observer.observe(target.value);
            } else {
                observer = new Observer$1(function targetBindObserverCallback(mutation) {
                    if (mutation.type === target.key) {
                        target.value = target.parent[target.key];
                        instance.transform.update && instance.transform.update(node, binding, mutation);
                    }
                });
                observer.observe(target.parent);
            }
            binding.observer = observer;
        }
    }]);
    return Bind;
}();

function renderNode(node, instance, target) {
    var bindMap = instance.transform.bind && instance.transform.bind(node, target),
        binding = void 0;
    bindMap = bindMap || {
        node: node,
        prop: 'node'
    };
    binding = bindMap.node.bindings[bindMap.prop];
    if (binding) {
        console.warn('Removing \'' + bindMap.prop + '\' binding from node');
        binding.instance.transform.unbind && binding.instance.transform.unbind(bindMap.node, binding);
        binding.observer.disconnect();
    }
    bindMap.node.bindings[bindMap.prop] = {
        template: node,
        target: target,
        instance: instance,
        observer: undefined
    };
    Bind.observer(bindMap.node, bindMap.node.bindings[bindMap.prop], instance.recursive);
}

function keypathTraversal(target, keypath) {
    var keys = keypath.toString().split('.'),
        key = keys.slice(-1)[0],
        parent = target,
        value = target;
    if (keypath !== '') {
        while (keys.length) {
            parent = value;
            value = resolveKeypath(value, keys);
        }
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

var NAMESPACE_URI = {
    html: 'http://www.w3.org/1999/xhtml',
    svg: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink',
    xmlns: 'http://www.w3.org/1999/xlink'
};

function xmlNamespace(node) {
    while (node) {
        if (node.DOMNode) {
            return node.DOMNode.namespaceURI;
        }
        if (node.name.indexOf('svg') === 0) {
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
        add(function batchedTextNodeMutation() {
            record.target.parent.DOMNode.textContent = record.newValue;
        });
    }
}

function attributeMutationCallback(record) {
    var node = void 0;
    if (record.oldValue === record.newValue) {
        return;
    }
    node = record.target.parent;
    switch (record.method) {
        case 'delete':
            add(function batchedAttributeDeleteMutation() {
                node.DOMNode.removeAttributeNS(attrNamespace(record.type), record.type);
            });
            break;
        case 'add':
        case 'set':
            add(function batchedAttributeSetMutation() {
                node.DOMNode.setAttributeNS(attrNamespace(record.type), record.type, record.newValue);
            });
            break;
    }
}

function childrenMutationCallback(record) {
    var DOMNode = record.target.parent.DOMNode;
    switch (record.method) {
        case 'push':
            record.newValue.forEach(function childrenMutationValueIterator(child) {
                add(function batchedChildrenPushMutation() {
                    DOMNode.appendChild(child.DOMNode);
                });
            });
            break;
        case 'pop':
            if (record.oldValue && record.oldValue.length) {
                add(function batchedChildrenRemoveMutation() {
                    DOMNode.removeChild(record.oldValue[0].DOMNode);
                });
            }
            break;
        case 'unshift':
            record.newValue.forEach(function childrenMutationValueIterator(child) {
                add(function batched() {
                    DOMNode.insertBefore(child.DOMNode, DOMNode.firstChild);
                });
            });
            break;
        case 'splice':
            if (record.oldValue && record.oldValue.length) {
                add(function batchedChildrenRemoveMutation() {
                    DOMNode.removeChild(record.oldValue[0].DOMNode);
                });
            }
            if (record.args.length === 3) {
                add(function batchedChildrenInsertMutation() {
                    DOMNode.insertBefore(record.newValue[0].DOMNode, DOMNode.childNodes[record.type]);
                });
            }
            break;
    }
}

function eventMutationCallback(record) {
    var node = record.target.parent;
    if (record.method === 'add') {
        node.DOMNode.addEventListener(record.type, dispatchEventListener(node, record.type));
    } else if (record.method === 'delete') {
        node.DOMNode.removeEventListener(record.type);
    }
}

function compileDOM(node) {
    var textObserver = void 0,
        attributeObserver = void 0,
        childrenObserver = void 0,
        eventObserver = void 0;
    if (node instanceof Text) {
        node.DOMNode = document.createTextNode(node.value.textContent);
        textObserver = new Observer(textNodeMutationCallback);
        textObserver.observe(node.value);
        node.observers.push(textObserver);
    } else if (node instanceof Element) {
        node.DOMNode = document.createElementNS(xmlNamespace(node), node.name);
        Object.keys(node.attributes).forEach(function compileNodeAttributeIterator(key) {
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
    eventObserver = new Observer(eventMutationCallback);
    eventObserver.observe(node.events);
    node.observers.push(eventObserver);
    for (var evt in node.events) {
        node.DOMNode.addEventListener(evt, dispatchEventListener(node, evt));
    }
    if (node.parent) {
        node.parent.DOMNode.appendChild(node.DOMNode);
    }
}

function compileBindings(node) {
    Object.keys(node.bindings).forEach(function mapClonedBindings(key) {
        var binding = node.bindings[key];
        binding.instance.transform.compile && binding.instance.transform.compile(node, binding);
        node.bindings[key] = {
            template: binding.template,
            target: binding.target,
            instance: binding.instance,
            observer: undefined
        };
        if (!binding.instance.parsed) {
            binding.observer.disconnect();
        }
        Bind.observer(node, node.bindings[key]);
    });
}

function dispatchEventListener(node, evt) {
    return function eventListenerClosure(e) {
        node.events[evt].dispatch(e, node);
    };
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
    node.compiled = true;

    if (node.children) {
        node.children.forEach(compileNode);
    }
    compileBindings(node);
}

function clone$1(node) {
    var deep = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var clone = void 0;
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

var Store = function () {
    function Store() {
        var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _this = this;

        var mutations = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var post = arguments[2];
        classCallCheck(this, Store);

        this.state = state;
        this.mutations = {};
        this.post = post;
        Object.keys(mutations).forEach(function (name) {
            _this.mutations[name] = new Signal();
            _this.mutations[name].add(mutations[name]);
        });
    }

    createClass(Store, [{
        key: 'dispatch',
        value: function dispatch() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var name = args.shift(),
                mutation = this.mutations[name];
            if (!mutation) {
                throw new Error(name + ' mutation does not exist');
            }
            mutation.dispatch.apply(mutation, [this.state].concat(args));
            this.post && this.post.apply(this, [name, this.state].concat(args));
        }
    }]);
    return Store;
}();

var location$1 = typeof window !== 'undefined' && window.location || undefined;
var origin = !is(location$1, 'undefined') ? parse(location$1.href) : {};
function request$1(request) {
    request.crossOrigin = origin.protocol !== request.url.protocol || origin.host !== request.url.host;
    return request;
}

function request$2(request) {
    if (is(request.data, 'object') && request.urlencode) {
        request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        request.data = format$1(request.data);
    }
    if (is(request.data, 'formData')) {
        delete request.headers['Content-Type'];
    }
    if (is(request.data, 'object')) {
        //need to also do this for formdata
        request.data = JSON.stringify(request.data);
    }
    return request;
}

function response(response) {
    try {
        response.data = response.data && JSON.parse(response.data);
    } catch (e) {
        console.warn(e);
    }
    return response;
}

var t = void 0;

function request$3(request) {
    if (request.timeout) {
        t = setTimeout(function httpTimeoutInterceptor() {
            request.abort();
        }, request.timeout);
    }
    return request;
}

function response$1(response) {
    clearTimeout(t);
    return response;
}

function request$4(request) {
    if (request.override && /^(PUT|PATCH|DELETE)$/i.test(request.method)) {
        request.headers['X-HTTP-Method-Override'] = request.method;
        request.method = 'POST';
    }
}

function request$5(request) {
    var headers = {
        'Accept': 'application/json, text/plain, */*'
    };
    if (!request.crossOrigin) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    if (/^(PUT|POST|PATCH|DELETE)$/i.test(request.method)) {
        headers['Content-Type'] = 'application/json';
    }
    request.method = request.method.toUpperCase();
    request.headers = extend(headers, request.headers);
    if (is(request.data, 'object') && request.method === 'GET') {
        extend(request.url.query, request.data);
        delete request.data;
    }
    return request;
}

function xhr(request) {
    return new Promise(function xhrPromiseExecutor(resolve) {
        var client = new XMLHttpRequest(),
            response = {
            request: request
        },
            abort = function abort() {
            client.abort();
            request.aborted = true;
        },
            handler = function handler() {
            response.data = client.responseText;
            response.status = client.status;
            response.statusText = client.statusText;
            response.headers = client.getAllResponseHeaders();
            resolve(response);
        };
        request.abort = abort;
        client.timeout = 0;
        client.onload = handler;
        client.onabort = handler;
        client.onerror = handler;
        client.ontimeout = noop;
        client.onprogress = noop;
        client.open(request.method, request.url, true);
        for (var key in request.headers) {
            client.setRequestHeader(key, request.headers[key]);
        }
        client.send(request.data);
    });
}

function client (request) {
    var client = request.client || xhr;
    return Promise.resolve(client(request)).then(function requestFulfilled(response) {
        response.ok = response.status >= 200 && response.status < 300;
        return response;
    });
}

var Http = function () {
    function Http() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        classCallCheck(this, Http);

        this.urlencode = !!config.urlencode;
        this.override = !!config.override;
        this.timeout = config.timeout || 0;
        this.headers = config.headers || {};
        this._url = parse(config.url || '');
    }

    createClass(Http, [{
        key: 'GET',
        value: function GET(data) {
            return Http.method(this, 'GET', data);
        }
    }, {
        key: 'POST',
        value: function POST(data) {
            return Http.method(this, 'POST', data);
        }
    }, {
        key: 'PUT',
        value: function PUT(data) {
            return Http.method(this, 'PUT', data);
        }
    }, {
        key: 'PATCH',
        value: function PATCH(data) {
            return Http.method(this, 'PATCH', data);
        }
    }, {
        key: 'DELETE',
        value: function DELETE(data) {
            return Http.method(this, 'DELETE', data);
        }
    }, {
        key: 'url',
        get: function get() {
            return format(this._url);
        }
    }, {
        key: 'query',
        get: function get() {
            return this._url.query;
        },
        set: function set(obj) {
            this._url.query = obj;
        }
    }, {
        key: 'path',
        get: function get() {
            return this._url.path;
        },
        set: function set(obj) {
            this._url.path = obj;
        }
    }], [{
        key: 'method',
        value: function method(http, _method) {
            var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            return Http.request({
                urlencode: http.urlencode,
                override: http.override,
                timeout: http.timeout,
                headers: clone(http.headers),
                url: http._url,
                data: data,
                method: _method
            });
        }
    }, {
        key: 'request',
        value: function request(_request) {
            Http.interceptors.request.dispatch(_request);
            _request.url = format(_request.url);
            return client(_request).then(function clientRequestFulfilled(response) {
                Http.interceptors.response.dispatch(response);
                return response.ok ? response : Promise.reject(response);
            });
        }
    }]);
    return Http;
}();

Http.interceptors = {
    request: new Signal(),
    response: new Signal()
};

Http.interceptors.request.add(request$3);
Http.interceptors.request.add(request$4);
Http.interceptors.request.add(request$2);
Http.interceptors.request.add(request$5);
Http.interceptors.request.add(request$1);
Http.interceptors.response.add(response$1);
Http.interceptors.response.add(response);

var Component = function () {
    function Component() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref$root = _ref.root;
        var root = _ref$root === undefined ? true : _ref$root;
        var _ref$components = _ref.components;
        var components = _ref$components === undefined ? {} : _ref$components;
        var _ref$selectors = _ref.selectors;
        var selectors = _ref$selectors === undefined ? '' : _ref$selectors;
        var _ref$template = _ref.template;
        var template = _ref$template === undefined ? '' : _ref$template;
        classCallCheck(this, Component);

        if (!is(components, 'object')) {
            throw new Error('Invalid components type must be an object map');
        }
        if (!is(template, 'string') && !is(template, 'object')) {
            throw new Error('Invalid selectors type must be a string or object');
        }
        if (!is(template, 'string') && !is(template, 'function')) {
            throw new Error('Invalid template type must be a string or function');
        }

        this.root = root;
        this.components = {};
        this.selectors = selectors;
        this.template = template;

        init(this, components);
    }

    createClass(Component, null, [{
        key: 'selector',
        value: function selector(component, type) {
            if (is(component.selectors, 'string')) {
                return component.selectors;
            }
            if (component.selectors[type]) {
                return component.selectors[type];
            }
            if (component.selectors.name) {
                return component.selectors.name;
            }
            throw new Error('Failed to resolve selector ' + type);
        }
    }, {
        key: 'query',
        value: function query(component, DOMNode) {
            var sources = DOMNode.querySelectorAll(Component.selector(component, 'name'));

            sources = Array.prototype.slice.call(sources);
            sources.forEach(function componentQueryIterator(node) {
                var child = void 0;
                //read-only hook
                component.query && component.query(node, component);
                for (var name in component.components) {
                    child = component.components[name];
                    Component.query(child, node);
                }
            });
            return sources;
        }
    }, {
        key: 'parse',
        value: function parse(component, sources) {
            //a root node will call this with (component, [DOMNodes])
            //subsequent children will invoke this method with already parsed sources
            var templates = [],
                child = void 0,
                selector = void 0,
                results = void 0;

            sources.forEach(function componentParseIterator(node) {
                var template = void 0;

                if (component.template) {
                    template = is(component.template, 'function') ? component.template(node, component) : clone$1(component.template, true);
                    if (component.root) {
                        template.transclude = node;
                    } else {
                        node.parent.insert(template, node.index());
                        //could append to parent instead or replace
                        node.destroy();
                    }
                } else {
                    template = component.root ? parse$4(node) : node;
                }

                //read or write as well as replace
                template = component.parse && component.parse(template, component, node) || template;
                templates.push(template);

                for (var name in component.components) {
                    child = component.components[name];
                    selector = Component.selector(child, 'name');
                    results = template.filter(selector);
                    Component.parse(child, results);
                }
            });

            return templates;
        }
    }, {
        key: 'compile',
        value: function compile$$(component, templates) {
            var compiled = [],
                child = void 0,
                selector = void 0,
                results = void 0;

            templates.forEach(function componenetCompileIterator(template) {
                var compiledNode = template.compiled ? template : compile(template);
                //read or write but do not replace
                component.compile && component.compile(compiledNode, component, template);
                compiled.push(compiledNode);

                for (var name in component.components) {
                    child = component.components[name];
                    selector = Component.selector(child, 'compile');
                    results = compiledNode.filter(selector);
                    Component.compile(child, results);
                }
            });

            return compiled;
        }
    }]);
    return Component;
}();

function init(component, components) {
    var sources = void 0,
        parsed = void 0,
        compiled = void 0;

    if (is(component.template, 'string')) {
        component.template = parse$4(component.template);
    }

    for (var name in components) {
        component.components[name] = new components[name]({
            root: false,
            selectors: name
        });
    }

    if (component.root) {
        if (typeof document !== 'undefined') {
            sources = Component.query(component, document);
        } else {
            if (!component.root instanceof Node) {
                throw new Error('Unspecified virtual root node');
            }
            sources = [component.root];
        }

        parsed = Component.parse(component, sources);
        compiled = Component.compile(component, parsed);

        if (typeof document !== 'undefined') {
            compiled.forEach(transclude);
        } else {
            component.parsed = parsed;
            component.compiled = compiled;
        }
    }
}

exports.util = util;
exports.url = url;
exports.router = router;
exports.parse = parse$4;
exports.compile = compile;
exports.clone = clone$1;
exports.transclude = transclude;
exports.Signal = Signal;
exports.Observer = Observer;
exports.Store = Store;
exports.Http = Http;
exports.Text = Text;
exports.Fragment = Fragment;
exports.Element = Element;
exports.Bind = Bind;
exports.Component = Component;
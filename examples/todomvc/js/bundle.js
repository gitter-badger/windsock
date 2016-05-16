var paint;
var cancelPaint;
if(typeof window !== 'undefined' && window.requestAnimationFrame){
    paint = window.requestAnimationFrame;
    cancelPaint = window.cancelAnimationFrame;
}else{
    paint = setTimeout;
    cancelPaint = clearTimeout;
}

function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function is(target, type){
    switch(type){
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

function extend(obj){
    for(let i = 1, l = arguments.length; i < l; i++){
        //enumerable including prototype
        for(let key in arguments[i]){
            obj[key] = arguments[i][key];
        }
    }
    return obj;
}

function clone(obj){
    var c = {};
    Object.keys(obj)
        .forEach((key)=>{
            c[key] = is(obj[key], 'object') ? clone(obj[key]) : obj[key];
        });
    return c;
}

function match(target, query){
    for(var key in  query){
        if(target[key] !== query[key]){
            return false;
        }
    }
    return true;
}

function noop(){}

class Signal{
    constructor(){
        this.listeners = [];
    }
    add(listener){
        this.listeners.push(listener);
    }
    remove(listener){
        if(listener){
            return this.listeners.splice(this.listeners.indexOf(listener),1);
        }
        this.listeners = [];
    }
    dispatch(...args){
        return this.listeners.map((listener)=>{
            return listener.apply(this, args);
        });
    }
}

class Node{
    constructor(){
        this.compiled = false;
        this.transclude = undefined;
        this.DOMNode = undefined;
        this.observers = [];
        this.bindings = {};
        this.events = defineEventsParent(this);
    }
    get jsonml(){
        return '';
    }
    get html(){
        return '';
    }
    destroy(){
        this.compiled = false;
        this.transclude = undefined;
        paint(()=>{
            this.DOMNode = undefined;
        });
        while(this.observers.length){
            this.observers.pop().disconnect();
        }
        for(let key in this.bindings){
            this.bindings[key].observer.disconnect();
            delete this.bindings[key];
        }
        for(let evt in this.events){
            this.events[evt].remove();
            delete this.events[evt];
        }
    }
    clone(){
        return Node.clone(new Node(), this);
    }
    on(evt, callback){
        if(!this.events[evt]){
            if(this.compiled){
                this.events.add(evt, new Signal());
            }else{
                this.events[evt] = new Signal();
            }
        }
        this.events[evt].add(callback);
    }
    off(evt, callback){
        this.events[evt].remove(callback);
        if(!this.events[evt]){
            delete this.events[evt];
        }
    }
    toJSON(){
        return this.jsonml;
    }
    valueOf(){
        return JSON.stringify(this);
    }
    toString(){
        return this.html;
    }
    static clone(target, instance, deep = false){
        target.transclude = instance.transclude;
        for(let key in instance.bindings){
            target.bindings[key] = instance.bindings[key];
        }
        if(deep){
            for(let evt in instance.events){
                target.events[evt] = new Signal();
                target.events[evt].listeners = instance.events[evt].listeners.slice();
            }
        }
    }
}

function defineEventsParent(instance, events = {}){
    Object.defineProperty(events, 'parent', {
        value: instance,
        enumerable: false,
        writable: false,
        configurable: false
    });
    return events;
}

class Text extends Node{
    constructor(value){
        super();
        this.value = {
            textContent: value
        };
        defineAttributesParent(this, this.value);
        this.parent = undefined;
    }
    get jsonml(){
        return this.value.textContent;
    }
    get html(){
        return this.value.textContent;
    }
    get text(){
        return this.value.textContent;
    }
    set text(value){
        this.value.textContent = value;
    }
    destroy(){
        super.destroy();
        if(!is(this.parent, 'undefined')){
            this.remove();
        }
    }
    clone(){
        let node = new Text(this.value.textContent);
        Node.clone(node, this);
        return node;
    }
    remove(){
        if(is(this.parent, 'undefined')){
            throw new Error('Failed to remove node');
        }
        this.parent.children.splice(this.index(), 1);
        this.parent = undefined;
    }
    index(){
        if(is(this.parent, 'undefined')){
            return -1;
        }
        return this.parent.children.indexOf(this);
    }
}

function defineAttributesParent(instance, value = {}){
    Object.defineProperty(value, 'parent', {
        value: instance,
        enumerable: false,
        writable: false,
        configurable: false
    });
    return value;
}

class Fragment extends Node{
    constructor(){
        super();
        this.children = defineChildrenParent(this);
    }
    get jsonml(){
        throw new Error('Cannot convert to jsonml');
    }
    get html(){
        return this.children
            .map((child)=>{
                return child.html;
            })
            .join('');
    }
    destroy(){
        super.destroy();
        let i = this.children.length;
        while(i){
            i--;
            this.children[i].destroy();
        }
    }
    clone(deep = false){
        let fragment = new Fragment();
        if(deep && this.children.length){
            this.children.forEach((child)=>{
                fragment.append(child.clone(true));
            });
        }
        Node.clone(fragment, this, deep);
        return fragment;
    }
    append(node){
        if(this.compiled !== node.compiled){
            throw new Error('Node compiled value does not match');
        }
        if(!is(node.parent, 'undefined')){
            node.remove();
        }
        node.parent = this;
        this.children.push(node);
    }
    prepend(node){
        if(this.compiled !== node.compiled){
            throw new Error('Node compiled value does not match');
        }
        if(!is(node.parent, 'undefined')){
            node.remove();
        }
        node.parent = this;
        this.children.unshift(node);
    }
    insert(node, i){
        if(this.compiled !== node.compiled){
            throw new Error('Node compiled value does not match');
        }
        if(!is(node.parent, 'undefined')){
            node.remove();
        }
        node.parent = this;
        this.children.splice(i, 0, node);
    }
    find(query){
        //pre-order traversal returns first result or undefined
        let predicate = parseQuery(query),
            result;
        for(var i = 0, l = this.children.length; i < l; i++){
            if(predicate(this.children[i])){
                return this.children[i];
            }else if(!is(this.children[i].find, 'undefined')){
                result = this.children[i].find(predicate);
                if(!is(result, 'undefined')){
                    return result;
                }
            }
        }
    }
    filter(query){
        //pre-order traversal returns a flat list result or empty array
        let predicate = parseQuery(query),
            result = [];
        for(var i = 0, l = this.children.length; i < l; i++){
            if(predicate(this.children[i])){
                result.push(this.children[i]);
            }
            if(!is(this.children[i].filter, 'undefined')){
                result = result.concat(this.children[i].filter(predicate));
            }
        }
        return result;
    }
    text(){
        return this.filter(textFilter).join('');
    }
}

function defineChildrenParent(instance, children = []){
    Object.defineProperty(children, 'parent', {
        value: instance,
        enumerable: false,
        writable: false,
        configurable: false
    });
    return children;
}

function nodeNamePredicate(query, child){
    return child.name && child.name === query;
}

function nodeAttributePredicate(query, child){
    if(!child.attributes){
        return false;
    }
    return match(child.attributes, query);
}

function parseQuery(query){
    if(is(query, 'function')){
        return query;
    }else if(is(query, 'string')){
        return nodeNamePredicate.bind(null, query);
    }else if(is(query, 'object')){
        return nodeAttributePredicate.bind(null, query);
    }
    throw new Error('specified query type not supported');
}

function textFilter(node){
    return node instanceof Text;
}

class Element extends Fragment{
    constructor(name, attributes = {}, empty = false){
        if(!name){
            throw new Error('Failed to instantiate Element invalid name specified');
        }
        super();
        this.name = name;
        this.attributes = defineAttributesParent$1(this, attributes);
        this.empty = empty;
    }
    get jsonml(){
        var jsonml = [];
        jsonml.push(this.name);
        if(is(this.attributes, 'empty') === false){
            jsonml.push(clone(this.attributes));
        }
        for(let i = 0, l = this.children.length; i < l; i++){
            jsonml.push(this.children[i].jsonml);
        }
        return jsonml;
    }
    get html(){
        var html = [],
            attrKeys = Object.keys(this.attributes);
        html.push(`<${this.name}`);
        if(attrKeys.length){
            html.push(' ');
            html = html.concat(attrKeys.map((key)=>{
                if(this.attributes[key]){
                    key += `="${this.attributes[key]}"`;
                }
                return key;
            }));
        }
        if(this.empty){
            html.push('/>');
        }else{
            html.push('>');
            for(let i = 0, l = this.children.length; i < l; i++){
                html.push(this.children[i].html);
            }
            html.push(`</${this.name}>`);
        }
        return html.join('');
    }
    destroy(){
        super.destroy();
        if(!is(this.parent, 'undefined')){
            this.remove();
        }
        this.attributes = defineAttributesParent$1(this);
        this.empty = false;
    }
    clone(deep = false){
        let element = new Element(this.name, clone(this.attributes));
        if(deep && this.children.length){
            this.children.forEach((child)=>{
                element.append(child.clone(true));
            });
        }
        Node.clone(element, this, deep);
        return element;
    }
    remove(){
        if(is(this.parent, 'undefined')){
            throw new Error('Failed to remove node');
        }
        this.parent.children.splice(this.index(), 1);
        this.parent = undefined;
    }
    index(){
        if(is(this.parent, 'undefined')){
            return -1;
        }
        return this.parent.children.indexOf(this);
    }
}

function defineAttributesParent$1(instance, attributes = {}){
    Object.defineProperty(attributes, 'parent', {
        value: instance,
        enumerable: false,
        writable: false,
        configurable: false
    });
    return attributes;
}

function parse$1(str, options = {}){
    let params = {},
        decode = options.decode || decodeURIComponent;
    if(!is(str, 'string')){
        throw new Error('Parameter must be a string');
    }
    str = options.query ? normalize(str) : str;
    str.split('&')
        .forEach(function paramParseMap(pair){
            if(!pair) return;
            pair = pair.split('=');
            params[decode(pair[0])] = pair.length === 1 ? null : decode(pair[1]);
        });
    return params;
}

function format$1(params, options = {}){
    let str,
        encode = options.encode || encodeURIComponent;
    if(!is(params, 'object')){
        throw new Error('Parameter must be an object');
    }
    str = Object.keys(params)
        .map(function paramFormatMap(key){
            let val = params[key] ? '=' + encode(params[key]) : '';
            return encode(key) + val;
        })
        .join('&');
    return str.length ? (options.query ? '?' + str : str ) : '';
}

function normalize(query){
    if(!is(query, 'string')){
        throw new Error('Parameter must be a string');
    }
    if(query.indexOf('?') === 0){
        query = query.replace('?','');
    }
    return query;
}

function parse$2(path){
    let params = {};
    if(!is(path, 'string')){
        throw new Error('Parameter must be a string');
    }
    path = normalize$1(path);
    path && path.split('/')
        .forEach(function pathParseMap(slug, i){
            if(slug.indexOf(':') === 0 && slug.length > 1){
                params[slug.replace(':','')] = i;
            }
        });
    return params;
}

function format$2(path, params){
    if(!is(params, 'object')){
        throw new Error('Parameter must be an object');
    }
    for(let key in params){
        let val = params[key];
        val = val.toString ? val.toString() : '';
        path = path.replace((val.length ? ':': '/:') + key, val);
    }
    return path;
}

function normalize$1(path){
    if(!is(path, 'string')){
        throw new Error('Parameter must be a string');
    }
    if(path.indexOf('/') === 0){
        path = path.replace('/','');
    }
    return path;
}

let a;

if(typeof document !== 'undefined'){
    a = document.createElement('a');
}

function parse(str){
    if(!a){
        return url.parse(str);
    }
    if(!is(str, 'string')){
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
        query: parse$1(a.search, {query:true}),
        pathname: a.pathname || null,
        path: parse$2(a.pathname),
        href: a.href
    };
}

function format(obj){
    let protocol,
        host,
        pathname,
        search,
        params,
        hash;
    if(!a){
        return url.format(obj);
    }
    if(!is(obj, 'object')){
        throw new Error('Parameter must be an object');
    }
    protocol = obj.protocol || '';
    host = obj.host || '';
    pathname = format$2(obj.pathname, obj.path);
    search = obj.search || '';
    params = format$1(obj.query, {query:true});
    hash = obj.hash || '';
    //plan to actually look at protocol
    return protocol + '//' + host + pathname + (params || search) + hash;
}

const queue = [];
const active = [];
const states = {};
const config = {
        hash: true,
        root: '/'
    };
let request;
let routing = false;
let listener;
let i;
function register(p, h) {
    if (!is(h, 'object')) {
        throw new Error('parameter must be an object');
    }
    if (!states[p]) {
        states[p] = [h];
    } else {
        states[p].push(h);
    }
}

function go(p, params = {}) {
    let split = p.split('/');
    split.params = params;
    queue.push(split);
    if (!routing) {
        next();
    }
}

function start({
    hash = true,
    root = '/'
} = {}) {
    let evt = hash ? 'hashchange' : 'popstate';
    if (listener) {
        console.warn('router already started');
        return;
    }
    config.hash = hash;
    config.root = hash ? '#' : root;
    listener = (e) => {
        let pathname = normalize$1(config.hash ? location.hash : location.pathname).split('/'),
            p = resolve(pathname) || config.root,
            params;
        if (p) {
            params = {
                path: parse$2(p),
                query: parse$1(location.search, {
                    query: true
                }),
                replace: !config.hash,
                hashChange: config.hash,
                event: e
            };
            for (let key in params.path) {
                params.path[key] = pathname[params.path[key]];
            }
            go(p, params);
        }
    };
    window.addEventListener(evt, listener);
    listener();
}

function resolve(pathname) {
    let literal = 0,
        resolved;
    Object.keys(states)
        .forEach((p) => {
            let l = compare(p.split('/'), pathname);
            if (l > literal) {
                literal = l;
                resolved = p;
            }
        });
    return resolved;
}

function compare(p, pathname) {
    let literal = 0;
    if (p.length !== pathname.length) {
        return 0;
    }
    for (let n = 0, l = p.length; n < l; n++) {
        if (p[n].indexOf(':') === 0) {
            continue;
        }
        if (p[n] !== pathname[n]) {
            return 0;
        } else {
            literal++;
        }
    }
    return literal;
}

function next() {
    if (queue.length) {
        routing = true;
        request = queue.shift();
        parse$3();
    } else {
        routing = false;
    }
}

function parse$3() {
    i = 0;
    while (i < request.length) {
        if (request[i] !== active[i]) {
            deactivate();
            return;
        }
        i++;
    }
    deactivate();
}

function deactivate() {
    let state;
    if (active.length - i > 0) {
        console.log('deactivating: ' + active.join('/'));
        state = states[active.join('/')];
        if (state) {
            series(state.map(h => h.deactivate || noop))
                .then(() => {
                    active.pop();
                    deactivate();
                })
                .catch((e) => {
                    console.warn(e);
                    next();
                });
        } else {
            active.pop();
            deactivate();
        }
    } else {
        activate();
    }
}

function activate() {
    let state;
    if (active.length < request.length) {
        active.push(request[active.length]);
        console.log('activating: ' + active.join('/'));
        state = states[active.join('/')];
        if (state) {
            series(state.map(h => h.activate || noop))
                .then(activate)
                .catch((e) => {
                    console.warn(e);
                    next();
                });
        } else {
            activate();
        }
    } else {
        if (config.hash) {
            if (!request.params.hashChange) {
                if (request.params.replace) {
                    location.replace(normalize$2())
                } else {
                    location.hash = normalize$2();
                }
            }
        } else {
            if (request.params.replace) {
                history.replaceState({}, '', normalize$2());
            } else {
                history.pushState({}, '', normalize$2());
            }
        }
        next();
    }
}

function normalize$2() {
    let pathname = request.params.path ? format$2(active.join('/'), request.params.path) : active.join('/'),
        search = request.params.query ? format$1(request.params.query, {
            query: true
        }) : '';
    return config.root + pathname + search;
}

function series(fns) {
    return fns.reduce((promise, fn) => {
        return promise.then(() => {
            return fn(request.params);
        });
    }, Promise.resolve());
}

const ARRAY_MUTATOR_METHODS = [
    'fill',
    'pop',
    'push',
    'shift',
    'splice',
    'unshift'
];

class Observer{
    constructor(callback){
        if(is(callback, 'undefined')){
            throw new Error('Failed to instantiate missing callback');
        }
        if(!is(callback, 'function')){
            throw new Error('Invalid callback specified');
        }
        this.callback = callback;
        this._target = undefined;
        this._config = undefined;
    }
    observe(target, config = {recursive: false}){
        var observerList;
        if(!isObservable(target)){
            throw new Error('Failed to observe not a valid target');
        }
        if(is(config.recursive, 'undefined')){
            throw new Error('Invalid config specified');
        }
        observerList = new ObserverList();
        observerList.add(this);
        this._target = target;
        this._config = config;
        observable(target, observerList);
    }
    disconnect(){
        if(this._target){
            if(this._config.recursive){
                disconnectRecursiveObserver(this._target, this);
            }
            this._target._observers.remove(this);
        }
        this._target = undefined;
        this._config = undefined;
    }
}

class MutationRecord{
    constructor(config){
        this.type = config.type; //prop or array indicies
        this.target = config.target; //parent object||array
        this.method = config.method; //add,delete,update||push,pop,splice,etc.
        this.args = config.args;
        this.newValue = config.newValue; //newly transformed value
        this.oldValue = config.oldValue; //the old value(s)
    }
}

class ObserverList{
    constructor(observers = []){
        this.observers = observers;
    }
    dispatch(record){
        if(!record instanceof MutationRecord){
            throw new Error('Invalid record specified');
        }
        this.observers.forEach((observer)=>{
            observer.callback(record);
        });
    }
    exists(observer){
        return this.observers.indexOf(observer) !== -1;
    }
    add(observer){
        return this.observers.push(observer);
    }
    remove(observer){
        let index = this.observers.indexOf(observer);
        if(index !== -1){
            this.observers.splice(index, 1);
        }
        return index;
    }
    recursive(){
        return this.observers.filter((observer)=>{
            return observer._config.recursive;
        });
    }
    recursiveExists(){
        for(let i = 0, l = this.observers.length; i < l; i++){
            if(this.observers[i]._config.recursive){
                return true;
            }
        }
        return false;
    }
    static recursive(list){
        //factory method for creating a new observer list
        //from an existing observer list where the observers are recursive
        //because this isn't exposed we don't really have to throw here
        if(!list instanceof ObserverList){
            throw new Error('Invalid list specified');
        }
        return new ObserverList(list.recursive());
    }
}

function observable(target, observerList){
    var recursive = ObserverList.recursive(observerList),
        properties = configurableProperties(target),
        descriptor;
    if(target._observers){
        //populate current observerlist with new observers
        //from observerlist
        observerList.observers.forEach((observer)=>{
            if(!target._observers.exists(observer)){
                target._observers.add(observer);
            }
        });
    }else{
        descriptor = {
            _observers: {
                value: observerList,
                configurable: false
            }
        };
        properties.forEach((prop)=>{
            defineAccessors(prop, target[prop], descriptor);
        });
        if(is(target, 'array')){
            defineObservableArrayMutations(target, descriptor);
        }else{
            defineObservableObjectMutations(target, descriptor);
        }
        Object.defineProperties(target, descriptor);
    }
    if(recursive.observers.length){
        for(let i = 0, l = properties.length; i < l; i++){
            if(isObservable(target[properties[i]])){
                observable(target[properties[i]], recursive);
            }
        }
    }
}

function defineObservableObjectMutations(target, descriptor = {}){
    descriptor.add = {
        value: function addOperationClosure(prop, value){
            addObjectProperty(this, prop, value);
        }
    };
    descriptor.delete = {
        value: function deleteOperationClosure(prop){
            deleteObjectProperty(this, prop);
        }
    };
}

function defineObservableArrayMutations(target, descriptor = {}){
    for(let i = 0, l = ARRAY_MUTATOR_METHODS.length; i < l; i++){
        descriptor[ARRAY_MUTATOR_METHODS[i]] = {
            value: function arrayOperationClosure(){
                mutateArray({
                    args: Array.prototype.slice.call(arguments),
                    method: ARRAY_MUTATOR_METHODS[i],
                    target: this
                });
            }
        };
    }
}

function isObservable(target){
    return is(target, 'array') || is(target, 'object');
}

function configurableProperties(target){
    //getOwnPropertyNames enumerable or not excluding prototype
    return Object.getOwnPropertyNames(target)
        .filter((name)=>{
            return Object.getOwnPropertyDescriptor(target, name).configurable;
        });
}

function defineAccessors(prop, value, descriptor = {}){
    descriptor[prop] = {
        get: function(){return value;},
        set: function(newValue){
            var record = new MutationRecord({
                type: prop,
                target: this,
                method: 'set',
                oldValue: value,
                newValue: newValue,
                args: []
            });
            if(this._observers.recursiveExists() && isObservable(newValue)){
                observable(newValue, ObserverList.recursive(this._observers));
            }
            if(value && value._observers){
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

function addObjectProperty(target, prop, newValue){
    if(!is(target[prop], 'undefined')){
        throw new Error(`Failed to add ${prop} already defined`);
    }
    var record = new MutationRecord({
        type: prop,
        target: target,
        method: 'add',
        oldValue: target[prop],
        newValue: newValue,
        args: Array.prototype.slice.call(arguments, 1)
    });
    if(target._observers.recursiveExists() && isObservable(newValue)){
        observable(newValue, ObserverList.recursive(target._observers));
    }
    Object.defineProperties(target, defineAccessors(prop, newValue));
    target._observers.dispatch(record);
}

function deleteObjectProperty(target, prop){
    if(is(target[prop], 'undefined')){
        throw new Error(`Failed to delete ${prop} does not exist`);
    }
    var record = new MutationRecord({
        type: prop,
        target: target,
        method: 'delete',
        oldValue: target[prop],
        newValue: undefined,
        args: Array.prototype.slice.call(arguments, 1)
    });
    if(target[prop] && target[prop]._observers){
        disconnectRecursiveObservers(target, target[prop]._observers);
    }
    delete target[prop];
    target._observers.dispatch(record);
}

function mutateArray(options){
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
    switch(method){
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
            if(args[1]){
                record.oldValue = target.slice(args[0], args[0] + args[1]);
            }
            record.newValue = args.slice(2);
        break;
    }
    if(target._observers.recursiveExists()){
        record.newValue.forEach((val)=>{
            if(isObservable(val)){
                observable(val, ObserverList.recursive(target._observers));
            }
        });
    }
    if(record.oldValue){
        record.oldValue.forEach((val)=>{
            if(val && val._observers){
                disconnectRecursiveObservers(target, val._observers);
            }
        });
    }
    Array.prototype[method].apply(target, options.args);
    target._observers.dispatch(record);
}

function disconnectRecursiveObserver(target, observer){
    configurableProperties(target)
        .forEach((prop)=>{
            disconnectRecursiveObserver(target[prop], observer);
            if(target[prop]._observers){
                target[prop]._observers.remove(observer);
            }
        });
}

function disconnectRecursiveObservers(target, observerList){
    target._observers.recursive().forEach((observer)=>{
        observerList.remove(observer);
    });
}

class Store{
    constructor(state = {}, mutations = {}){
        this._state = state;
        this._mutations = {};
        Object.keys(mutations)
            .forEach((name)=>{
                this._mutations[name] = new Signal();
                this._mutations[name].add(mutations[name]);
            });
    }
    dispatch(...args){
        let name = args.shift(),
            mutation = this._mutations[name];
        if(!mutation){
            throw new Error(`${name} mutation does not exist`);
        }
        mutation.dispatch.apply(mutation, [this._state, ...args]);
    }
}

let location$1 = window && window.location || undefined;
let origin = !is(location$1, 'undefined') ? parse(location$1.href) : {};
function request$1(request){
    request.crossOrigin = (origin.protocol !== request.url.protocol || origin.host !== request.url.host);
    return request;
}

function request$2(request){
    if(is(request.data, 'object') && request.urlencode){
        request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        request.data = format$1(request.data);
    }
    if(is(request.data, 'formData')){
        delete request.headers['Content-Type'];
    }
    if(is(request.data, 'object')){
        //need to also do this for formdata
        request.data = JSON.stringify(request.data);
    }
    return request;
}

function response(response){
    try{
        response.data = JSON.parse(response.data);
    }catch(e){}
    return response;
}

let t;

function request$3(request){
    if(request.timeout){
        t = setTimeout(function httpTimeoutInterceptor(){
            request.abort();
        }, request.timeout);
    }
    return request;
}

function response$1(response){
    clearTimeout(t);
    return response;
}

function request$4(request){
    if(request.override && /^(PUT|PATCH|DELETE)$/i.test(request.method)){
        request.headers['X-HTTP-Method-Override'] = request.method;
        request.method = 'POST';
    }
}

function request$5(request){
    let headers = {
        'Accept': 'application/json, text/plain, */*'
    };
    if(!request.crossOrigin){
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    if(/^(PUT|POST|PATCH|DELETE)$/i.test(request.method)){
        headers['Content-Type'] = 'application/json';
    }
    request.method = request.method.toUpperCase();
    request.headers = extend(headers, request.headers);
    if(is(request.data, 'object') && request.method === 'GET'){
        extend(request.url.query, request.data);
        delete request.data;
    }
    return request;
}

function xhr(request){
    return new Promise(function xhrPromiseExecutor(resolve){
            let client = new XMLHttpRequest(),
                response = {
                    request: request
                },
                handler = function(){
                    response.data = client.responseText;
                    response.status = client.status;
                    response.statusText = client.statusText;
                    response.headers = client.getAllResponseHeaders();
                    resolve(response);
                };
            request.abort = client.abort;
            client.timeout = 0;
            client.onload = handler;
            client.onabort = handler;
            client.onerror = handler;
            client.ontimeout = noop;
            client.onprogress = noop;
            client.open(request.method, request.url, true);
            for(let key in request.headers){
                client.setRequestHeader(key, request.headers[key]);
            }
            client.send(request.data);
        });
}

function client(request){
    let client = request.client || xhr;
    return Promise.resolve(client(request))
        .then(function requestFulfilled(response){
            response.ok = response.status >= 200 && response.status < 300;
            return response;
        });
}

class Http{
    constructor(config = {}){
        this.urlencode = !!config.urlencode;
        this.override = !!config.override;
        this.timeout = config.timeout || 0;
        this.headers = config.headers || {};
        this._url = parse(config.url || '');
    }
    get url(){
        return format(this._url);
    }
    get params(){
        return this._url.query;
    }
    set params(obj){
        this._url.query = obj;
    }
    get path(){
        return this._url.path;
    }
    set path(obj){
        this._url.path = obj;
    }
    GET(data){
        return Http.method(this, 'GET', data);
    }
    POST(data){
        return Http.method(this, 'POST', data);
    }
    PUT(data){
        return Http.method(this, 'PUT', data);
    }
    PATCH(data){
        return Http.method(this, 'PATCH', data);
    }
    DELETE(data){
        return Http.method(this, 'DELETE', data);
    }
    static method(http, method, data = {}){
        return Http.request({
            urlencode: http.urlencode,
            override: http.override,
            timeout: http.timeout,
            headers: clone(http.headers),
            url: http._url,
            data: data,
            method: method
        });
    }
    static request(request){
        Http.interceptors.request.dispatch(request);
        //might not do this here
        request.url = format(request.url);
        return client(request)
            .then(function clientRequestFulfilled(response){
                Http.interceptors.response.dispatch(response);
                return response.ok ? response : Promise.reject(response);
            });
    }
}

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

const ARRAY_MUTATOR_METHODS$1 = [
    'fill',
    'pop',
    'push',
    'shift',
    'splice',
    'unshift'
];

class Observer$1{
    constructor(callback){
        if(is(callback, 'undefined')){
            throw new Error('Failed to instantiate missing callback');
        }
        if(!is(callback, 'function')){
            throw new Error('Invalid callback specified');
        }
        this.callback = callback;
        this._target = undefined;
        this._config = undefined;
    }
    observe(target, config = {recursive: false}){
        var observerList;
        if(!isObservable$1(target)){
            throw new Error('Failed to observe not a valid target');
        }
        if(is(config.recursive, 'undefined')){
            throw new Error('Invalid config specified');
        }
        observerList = new ObserverList$1();
        observerList.add(this);
        this._target = target;
        this._config = config;
        observable$1(target, observerList);
    }
    disconnect(){
        if(this._target){
            if(this._config.recursive){
                disconnectRecursiveObserver$1(this._target, this);
            }
            this._target._observers.remove(this);
        }
        this._target = undefined;
        this._config = undefined;
    }
}

class MutationRecord$1{
    constructor(config){
        this.type = config.type; //prop or array indicies
        this.target = config.target; //parent object||array
        this.method = config.method; //add,delete,update||push,pop,splice,etc.
        this.args = config.args;
        this.newValue = config.newValue; //newly transformed value
        this.oldValue = config.oldValue; //the old value(s)
    }
}

class ObserverList$1{
    constructor(observers = []){
        this.observers = observers;
    }
    dispatch(record){
        if(!record instanceof MutationRecord$1){
            throw new Error('Invalid record specified');
        }
        this.observers.forEach((observer)=>{
            observer.callback(record);
        });
    }
    exists(observer){
        return this.observers.indexOf(observer) !== -1;
    }
    add(observer){
        return this.observers.push(observer);
    }
    remove(observer){
        let index = this.observers.indexOf(observer);
        if(index !== -1){
            this.observers.splice(index, 1);
        }
        return index;
    }
    recursive(){
        return this.observers.filter((observer)=>{
            return observer._config.recursive;
        });
    }
    recursiveExists(){
        for(let i = 0, l = this.observers.length; i < l; i++){
            if(this.observers[i]._config.recursive){
                return true;
            }
        }
        return false;
    }
    static recursive(list){
        //factory method for creating a new observer list
        //from an existing observer list where the observers are recursive
        //because this isn't exposed we don't really have to throw here
        if(!list instanceof ObserverList$1){
            throw new Error('Invalid list specified');
        }
        return new ObserverList$1(list.recursive());
    }
}

function observable$1(target, observerList){
    var recursive = ObserverList$1.recursive(observerList),
        properties = configurableProperties$1(target),
        descriptor;
    if(target._observers){
        //populate current observerlist with new observers
        //from observerlist
        observerList.observers.forEach((observer)=>{
            if(!target._observers.exists(observer)){
                target._observers.add(observer);
            }
        });
    }else{
        descriptor = {
            _observers: {
                value: observerList,
                configurable: false
            }
        };
        properties.forEach((prop)=>{
            defineAccessors$1(prop, target[prop], descriptor);
        });
        if(is(target, 'array')){
            defineObservableArrayMutations$1(target, descriptor);
        }else{
            defineObservableObjectMutations$1(target, descriptor);
        }
        Object.defineProperties(target, descriptor);
    }
    if(recursive.observers.length){
        for(let i = 0, l = properties.length; i < l; i++){
            if(isObservable$1(target[properties[i]])){
                observable$1(target[properties[i]], recursive);
            }
        }
    }
}

function defineObservableObjectMutations$1(target, descriptor = {}){
    descriptor.add = {
        value: function addOperationClosure(prop, value){
            addObjectProperty$1(this, prop, value);
        }
    };
    descriptor.delete = {
        value: function deleteOperationClosure(prop){
            deleteObjectProperty$1(this, prop);
        }
    };
}

function defineObservableArrayMutations$1(target, descriptor = {}){
    for(let i = 0, l = ARRAY_MUTATOR_METHODS$1.length; i < l; i++){
        descriptor[ARRAY_MUTATOR_METHODS$1[i]] = {
            value: function arrayOperationClosure(){
                mutateArray$1({
                    args: Array.prototype.slice.call(arguments),
                    method: ARRAY_MUTATOR_METHODS$1[i],
                    target: this
                });
            }
        };
    }
}

function isObservable$1(target){
    return is(target, 'array') || is(target, 'object');
}

function configurableProperties$1(target){
    //getOwnPropertyNames enumerable or not excluding prototype
    return Object.getOwnPropertyNames(target)
        .filter((name)=>{
            return Object.getOwnPropertyDescriptor(target, name).configurable;
        });
}

function defineAccessors$1(prop, value, descriptor = {}){
    descriptor[prop] = {
        get: function(){return value;},
        set: function(newValue){
            var record = new MutationRecord$1({
                type: prop,
                target: this,
                method: 'set',
                oldValue: value,
                newValue: newValue,
                args: []
            });
            if(this._observers.recursiveExists() && isObservable$1(newValue)){
                observable$1(newValue, ObserverList$1.recursive(this._observers));
            }
            if(value && value._observers){
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

function addObjectProperty$1(target, prop, newValue){
    if(!is(target[prop], 'undefined')){
        throw new Error(`Failed to add ${prop} already defined`);
    }
    var record = new MutationRecord$1({
        type: prop,
        target: target,
        method: 'add',
        oldValue: target[prop],
        newValue: newValue,
        args: Array.prototype.slice.call(arguments, 1)
    });
    if(target._observers.recursiveExists() && isObservable$1(newValue)){
        observable$1(newValue, ObserverList$1.recursive(target._observers));
    }
    Object.defineProperties(target, defineAccessors$1(prop, newValue));
    target._observers.dispatch(record);
}

function deleteObjectProperty$1(target, prop){
    if(is(target[prop], 'undefined')){
        throw new Error(`Failed to delete ${prop} does not exist`);
    }
    var record = new MutationRecord$1({
        type: prop,
        target: target,
        method: 'delete',
        oldValue: target[prop],
        newValue: undefined,
        args: Array.prototype.slice.call(arguments, 1)
    });
    if(target[prop] && target[prop]._observers){
        disconnectRecursiveObservers$1(target, target[prop]._observers);
    }
    delete target[prop];
    target._observers.dispatch(record);
}

function mutateArray$1(options){
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
    switch(method){
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
            if(args[1]){
                record.oldValue = target.slice(args[0], args[0] + args[1]);
            }
            record.newValue = args.slice(2);
        break;
    }
    if(target._observers.recursiveExists()){
        record.newValue.forEach((val)=>{
            if(isObservable$1(val)){
                observable$1(val, ObserverList$1.recursive(target._observers));
            }
        });
    }
    if(record.oldValue){
        record.oldValue.forEach((val)=>{
            if(val && val._observers){
                disconnectRecursiveObservers$1(target, val._observers);
            }
        });
    }
    Array.prototype[method].apply(target, options.args);
    target._observers.dispatch(record);
}

function disconnectRecursiveObserver$1(target, observer){
    configurableProperties$1(target)
        .forEach((prop)=>{
            disconnectRecursiveObserver$1(target[prop], observer);
            if(target[prop]._observers){
                target[prop]._observers.remove(observer);
            }
        });
}

function disconnectRecursiveObservers$1(target, observerList){
    target._observers.recursive().forEach((observer)=>{
        observerList.remove(observer);
    });
}

class Bind{
    constructor(transform = {}, recursive = false){
        if(is(transform, 'function')){
            this.transform = {
                update: transform
            };
        }else{
            this.transform = transform;
        }
        this.recursive = recursive;
    }
    render(node, target, keypath = ''){
        let targetMap = keypathTraversal(target, keypath);
        if(is(node, 'array')){
            for(let i = 0, l = node.length; i < l; i++){
              renderNode(node[i], this, targetMap);
            }
        }else{
            renderNode(node, this, targetMap);
        }
    }
    static observer(node, binding){
        let target = binding.target,
            instance = binding.instance,
            observer;
        if(is(target.value, 'object') || is(target.value, 'array')){
            observer = new Observer$1((mutation)=>{
                instance.transform.update && instance.transform.update(node, binding, mutation);
            });
            observer.observe(target.value);
        }else{
            observer = new Observer$1((mutation)=>{
                if(mutation.type === target.key){
                    instance.transform.update && instance.transform.update(node, binding, mutation);
                }
            });
            observer.observe(target.parent);
        }
        binding.observer = observer;
    }
}

function renderNode(node, instance, target){
    let bindMap = instance.transform.bind && instance.transform.bind(node, target),
        binding;
    bindMap = bindMap || {
        node: node,
        prop: 'node'
    };
    binding = bindMap.node.bindings[bindMap.prop];
    if(binding){
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

function keypathTraversal(target, keypath){
    let keys = keypath.toString().split('.'),
        key = keys.slice(-1)[0],
        parent = target,
        value = target;
    if(keypath !== ''){
        while(keys.length){
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

function resolveKeypath(target, keypath){
    let key = keypath.shift();
    if(typeof target[key] === 'undefined'){
        throw new Error(`Failed to resolve '${key}' on target`);
    }
    return target[key];
}

const VOID_TAGS = [
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

const IGNORE_TAGS = [
    'script'
];

function isVoid(name){
    for(let i = 0, l = VOID_TAGS.length; i < l; i++){
        if(VOID_TAGS[i] === name) return true;
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

function hasChildren(source, callback){
    if(source.hasChildNodes()){
        var childNodes = source.childNodes;
        for (var i = 0, l = childNodes.length; i < l; i++) {
            parseDOM(childNodes[i], callback);
        }
    }
}

function parseTag(tag){
    var evt = {},
        reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)=["']([^"']+)["'])/g,
        match = tag.match(reg);
    if(match.length > 1) evt.attributes = {};
    for(let i = 0, l = match.length; i < l; i++){
        var keyVal = match[i].split('=');
        if(i === 0) {
            //evt.name = keyVal[0].replace('/','').replace('>','').trim();
            evt.name = keyVal[0].replace(/[\/>]/g, '').trim();
        }else if(keyVal.length > 1){
            evt.attributes[keyVal[0].trim()] = keyVal[1].replace(/["'>]/g, '').trim();
        }else{
            evt.attributes[keyVal[0].replace(/[>]/g, '').trim()] = null;
        }
    }
    return evt;
}

//cloneNode prior to avoid heavy dom reads
function parseDOM(source, callback){
    var evt;
    if(IGNORE_TAGS.indexOf(source.nodeName.toLowerCase()) !== -1) return;
    if(source instanceof DocumentFragment){
       hasChildren(source, callback);
       return;
    }
   if(source.nodeType === 3){
       if(isWhitespace(source.nodeValue) || !clean(source.nodeValue).length) return;
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

   if(source.attributes.length){
       evt.attributes = {};
       Array.prototype.forEach.call(source.attributes, (attribute)=>{
           evt.attributes[attribute.name] = attribute.value;
       });
   }
   evt.type = 'start';
   if(!evt.void) callback(evt);
   hasChildren(source, callback);
   if(evt.attributes && !evt.void) delete evt.attributes;
   evt.type = 'end';
   callback(evt);
}

function parseHTML(source, callback){
    var endOfTagIndex,
        startTag,
        evt;
    //nodejs buffer and remove all line breaks aka dirty
    //source = source.toString().replace(/\n/g,'').replace(/\r/g,'');
    source = clean(source);
    while(source){
        var nextTagIndex = source.indexOf('<');
        if(nextTagIndex >= 0){
            //start element exists in string
            //need to convert content to evt
            if(nextTagIndex > 0) {
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
            evt.void = (source[startTag.length - 2] === '/') || isVoid(evt.name);
            if(startTag[1] === '!'){
                //comment, ignore?
                endOfTagIndex = source.indexOf('-->') + 1;
            }else if(startTag[1] === '/' || evt.void){
                //void tag or end tag. start is never called for void tags
                evt.type = 'end';
                callback(evt);
            }else{
                //start tag
                evt.type = 'start';
                callback(evt);
            }
            // substring to end of tag
            source = source.substring(endOfTagIndex);
        }else{
            callback({
                type: 'text',
                value: source
            });
            source = null;
        }
    }
}

function parseJSONML(source, callback){
    var index = 1,
        evt;
    if((is(source[0], 'array') || is(source[0], 'object')) && typeof source[0].length !== 'undefined'){
        parseJSONML(source[0], callback);
    }else{
        evt = {
            name: source[0],
            void: isVoid(source[0]),
            type: 'start'
        };
        if(source.length > 1 && source[1].toString() === '[object Object]'){
            index++;
            //copy primitave values to new object
            evt.attributes = extend({}, source[1]);
        }
        if(!evt.void) callback(evt);
    }

    while(index < source.length){
        if(is(source[index], 'string') || source[index].value ){
            callback({
                type: 'text',
                value: source.value || source[index]
            });
        }else{
            parseJSONML(source[index], callback);
        }
        index++;
    }
    if(typeof evt === 'undefined') return;
    if(evt.attributes && !evt.void) delete evt.attributes;
    evt.type = 'end';
    callback(evt);
}

function parse$4(source){
    var template = new Fragment(),
        transclude;
    if(is(source, 'string')){
        parseHTML(source, callback);
    }else if(source.nodeName){
        if(document.contains(source)){
            transclude = source;
            parseDOM(source.cloneNode(true), callback);
        }else{
            parseDOM(source, callback);
        }
    }else{
        parseJSONML(source, callback);
    }
    function callback(evt){
        var element;
        switch(evt.type){
            case 'text':
                template.append(new Text(evt.value));
            break;
            case 'start':
                element = new Element(evt.name, evt.attributes);
                template.append(element);
                template = element;
            break;
            case 'end':
                if(evt.void){
                    element = new Element(evt.name, evt.attributes, evt.void);
                    template.append(element);
                }else{
                    if(template.parent){
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

const queue$1 = [];
let id;
let requested;
let running;
function done(){
    id = null;
    requested = false;
    running = false;
    queue$1.length = 0;
}

done();

function run(){
    running = true;
    for(var i = 0; i < queue$1.length; i++){
        queue$1[i].call();
    }
    done();
}

function add(fn){
    queue$1.push(fn);
    if(!requested) {
        id = paint(run);
        requested = true;
    }
    return id;
};

const NAMESPACE_URI = {
    html: 'http://www.w3.org/1999/xhtml',
    svg: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink'
};

function xmlNamespace(node){
    while(node){
        if(node.DOMNode){
            return node.DOMNode.namespaceURI;
        }
        if(node.name === 'svg'){
            return NAMESPACE_URI.svg;
        }
        node = node.parent instanceof Element ? node.parent : false;
    }
    return NAMESPACE_URI.html;
}

function attrNamespace(name){
    var i = name.indexOf(':'),
        ns = null;
    if(i >= 0){
        ns = NAMESPACE_URI[name.substring(0, i)] || null;
    }
    return ns;
}

function textNodeMutationCallback(record){
    if(record.type === 'textContent' && record.oldValue !== record.newValue){
        add(()=>{
            record.target.parent.DOMNode.textContent = record.newValue;
        });
    }
}

function attributeMutationCallback(record){
    let node;
    if(record.oldValue === record.newValue){
        return;
    }
    node = record.target.parent;
    switch(record.method){
        case 'delete':
            add(()=>{
                node.DOMNode.removeAttributeNS(attrNamespace(record.type), record.type);
            });
            break;
        case 'add':
        case 'set':
            add(()=>{
                node.DOMNode.setAttributeNS(attrNamespace(record.type), record.type, record.newValue);
            });
            break;
    }
}

function childrenMutationCallback(record){
    let DOMNode = record.target.parent.DOMNode;
    switch(record.method){
        case 'push':
            record.newValue.forEach((child)=>{
                add(()=>{
                    DOMNode.appendChild(child.DOMNode);
                });
            });
            break;
        case 'unshift':
            record.newValue.forEach((child)=>{
                add(()=>{
                    DOMNode.insertBefore(child.DOMNode, DOMNode.firstChild);
                });
            });
            break;
        case 'splice':
            if(record.oldValue && record.oldValue.length){
                add(()=>{
                    DOMNode.removeChild(record.oldValue[0].DOMNode);
                });
            }
            if(record.args.length === 3){
                add(()=>{
                    DOMNode.insertBefore(record.newValue[0].DOMNode, DOMNode.childNodes[record.type]);
                });
            }
            break;
    }
}

function eventMutationCallback(record){
    let node = record.target.parent;
    if(record.method === 'add'){
        node.DOMNode.addEventListener(record.type, dispatchEventListener(node, record.type));
    }else if(record.method === 'delete'){
        node.DOMNode.removeEventListener(record.type);
    }
}

function compileDOM(node){
    let textObserver,
        attributeObserver,
        childrenObserver,
        eventObserver;
    if(node instanceof Text){
        node.DOMNode = document.createTextNode(node.value.textContent);
        textObserver = new Observer(textNodeMutationCallback);
        textObserver.observe(node.value);
        node.observers.push(textObserver);
    }else if(node instanceof Element){
        node.DOMNode = document.createElementNS(xmlNamespace(node), node.name);
        Object.keys(node.attributes)
            .forEach((key)=>{
                node.DOMNode.setAttributeNS(attrNamespace(key), key, node.attributes[key]);
            });
        attributeObserver = new Observer(attributeMutationCallback);
        childrenObserver = new Observer(childrenMutationCallback);
        attributeObserver.observe(node.attributes);
        childrenObserver.observe(node.children);
        node.observers.push(attributeObserver);
        node.observers.push(childrenObserver);
    }else if(node instanceof Fragment){
        node.DOMNode = document.createDocumentFragment();
        childrenObserver = new Observer(childrenMutationCallback);
        childrenObserver.observe(node.children);
        node.observers.push(childrenObserver);
    }else{
        throw new Error('Unspecified node instance');
    }
    eventObserver = new Observer(eventMutationCallback);
    eventObserver.observe(node.events);
    node.observers.push(eventObserver);
    for(var evt in node.events){
        node.DOMNode.addEventListener(evt, dispatchEventListener(node, evt));
    }
    if(node.parent){
        node.parent.DOMNode.appendChild(node.DOMNode);
    }
}

function dispatchEventListener(node, evt){
    return function eventListenerClosure(e){
        node.events[evt].dispatch(e, node);
    };
}

function compileBindings(node){
    Object.keys(node.bindings)
        .forEach(function mapClonedBindings(key){
            let binding = node.bindings[key];
            binding.instance.transform.compile && binding.instance.transform.compile(node, binding);
            node.bindings[key] = {
                template: binding.template,
                target: binding.target,
                instance: binding.instance,
                observer: undefined
            };
            Bind.observer(node, node.bindings[key]);
        });
}

function compile(template){
    if(!template instanceof Node){
        throw new Error('Template param must be of type Node');
    }
    if(template.compiled === true){
        throw new Error('Specified template is already compiled');
    }
    let clone = template.clone(true);
    compileNode(clone);
    return clone;
}

function compileNode(node){
    if(typeof document !== 'undefined'){
        compileDOM(node);
    }
    node.compiled = true;
    compileBindings(node);
    if(node.children){
        node.children.forEach(compileNode);
    }
}

function transclude(node, target){
    if(typeof document === 'undefined'){
        throw new Error('transclude requires a document');
    }
    if(!node.transclude && !target){
        throw new Error('unspecified transclusion target');
    }
    target = node.transclude || target;
    target.parentNode.insertBefore(node.DOMNode, target);
    target.parentNode.removeChild(target);
    node.transclude = undefined;
}

function clone$1(node, deep = false){
    let clone;
    if(!node instanceof Node){
        throw new Error('Node param must be of type Node');
    }
    clone = node.clone(deep);
    if(node.compiled === true){
        clone = compile(clone);
    }
    return clone;
}

class Component{
    constructor(name, root){
        let components = this.constructor.components;
        this.name = name;
        this.root = root || document;
        this.components = {};
        this._template = undefined;
        this.sources = [];
        this.templates = [];
        this.compiled = [];
        if(components){
            for(let name in components){
                this.components[name] = new components[name](name, true);
            }
        }
        if(!root){
            this.query();
            this.parse();
            this.compile();
            this.compiled.forEach(transclude);
        }
    }
    query(root){
        root = root || this.root;
        let results = root.querySelectorAll(this.name);
        this.sources = this.sources.concat(Array.prototype.slice.call(results));
        this.sources.forEach((source)=>{
            for(let name in this.components){
                this.components[name].query(source);
            }
        });
    }
    template(){
        if(!this._template){
            this._template = parse$4(this.constructor.template);
        }
        return clone$1(this._template, true);
    }
    parse(templates){
        if(templates && this.constructor.template){
            templates = templates.map((template)=>{
                var templateClone = this.template();
                template.parent.insert(templateClone, template.index());
                template.destroy();
                return templateClone;
            });
        }
        templates = templates || this.sources.map((source)=>{
            let template;
            if(this.constructor.template){
                template = this.template();
                template.transclude = source;
            }else{
                template = parse$4(source);
            }
            return template;
        });
        this.templates = this.templates.concat(templates);
        this.templates.forEach((template)=>{
            for(let name in this.components){
                this.components[name].parse(template.filter(name));
            }
        });
    }
    compile(compiled){
        compiled = compiled || this.templates.map(compile);
        this.compiled = this.compiled.concat(compiled);
        this.compiled.forEach((vdom)=>{
            for(let name in this.components){
                this.components[name].compile(vdom.filter(name));
            }
        });
    }
}

Component.component = function(name, cls){
    if(Component.components[name]){
        console.warn(`Global ${name} component already exists`);
    }
    Component.components[name] = cls;
};

Component.components = {};

const TODOS = 'todos';
const state = {
          todos: getTodos(),
          active: 0,
          path: ''
      };
const NONE = 'display:none;';
const newTodo = {
          text: ''
      };
function getTodos(){
    let t = localStorage.getItem(TODOS);
    return t ? JSON.parse(t) : [];
}

const mutations = {
    route: function(state, path){
        state.path = path;
    },
    add: function(state, text){
        state.todos.push({
            text,
            completed: false
        });
        state.active++;
    },
    delete: function(){},
    toggle: function(state, index){
        if(index === true){
            //toggle all
        }else{
            state.todos[index].completed = !state.todos[index].completed;
            state.todos[index].completed ? state.active-- : state.active++;
        }
    },
    clear: function(state, index){
        if(index === true){
            while(state.todos.length){
                state.todos.splice(0,1);
            }
        }else{
            state.todos.splice(index, 1);
        }
    }
};

const store = new Store(state, mutations);

register('#', {
    activate: function(){
        store.dispatch('route', '');
    }
});

register('#/active', {
    activate: function() {
        store.dispatch('route', 'active');
    }
});

register('#/completed', {
    activate: function() {
        store.dispatch('route', 'completed');
    }
});

class If extends Bind{
    constructor(predicate, remove = false){
        let toggle = (node, binding)=>{
            this.predicate(node, binding) ? this.show(node) : this.hide(node);
        };
        super({
            bind: (node)=>{
                return{
                    node: node,
                    prop: remove ? 'node' : 'style'
                };
            },
            compile: toggle,
            update: toggle
        });

        this.predicate = predicate;
        this.remove = remove;
    }
    show(node){
        if(this.remove){
            node.lastParent && node.lastParent.append(node);
        }else{
            if(node.attributes.style){
                node.attributes.style = node.attributes.style.replace(NONE, '');
            }
        }
    }
    hide(node){
        let parent;
        if(this.remove){
            parent = node.parent;
            node.remove();
            node.lastParent = parent;
        }else{
            if(node.attributes.style && node.attributes.style.indexOf(NONE) !== -1){
                return;
            }
            if(typeof node.attributes.style !== 'undefined'){
                node.attributes.style += NONE;
            }else{
                if(node.compiled){
                    node.attributes.add('style', NONE);
                }else{
                    node.attributes.style = NONE;
                }
            }
        }
    }
}

let lengthIf = new If((node, binding)=>{
    return binding.target.value.length;
});

let completedIf = new If((node, binding)=>{
    switch (binding.target.parent[binding.target.key]) {
        case '':
            return true;
            break;
        case 'active':
            return node.attributes.class.indexOf('completed') === -1;
            break;
        case 'completed':
            return node.attributes.class.indexOf('completed') !== -1;
    }
});

let todoBind = new Bind({
    bind: (node, target)=>{
        node.find('label').children[0].text = target.value.text;
        node.attributes.class = target.value.completed ? 'todo completed' : 'todo';
        if(target.value.completed === false){
            delete node.find({class: 'toggle'}).attributes.checked;
        }
        return {
            node: node,
            prop: 'attributes,children'
        };
    },
    update: (node, binding, mutation)=>{
        let checkbox = node.find({class: 'toggle'});
        if(mutation.type === 'completed'){
            node.attributes.class = mutation.newValue ? 'todo completed' : 'todo';
            if(mutation.newValue === true && checkbox.attributes.checked){
                if(checkbox.compiled){
                    checkbox.attributes.delete('checked');
                }else{
                    delete checkbox.attributes.checked;
                }
            }
            if(mutation.newValue === false && !checkbox.attributes.checked){
                if(checkbox.compiled){
                    checkbox.attributes.add('checked', 'checked');
                }else{
                    checkbox.attributes.checked = null;
                }
            }
        }
        if(mutation.type === 'text'){
            node.find('label').children[0].text = mutation.newValue;
        }
    }
});

let todosBind = new Bind({
    bind: (node, target)=>{
        let parent = node.parent;
        node.remove();
        target.value.forEach((todo)=>{
            parent.append(renderTodo(node, todo));
        });
        return{
            node: parent,
            prop: 'parent'
        };
    },
    update: (node, binding, mutation)=>{
        //node here is ul
        //binding template is the li
        let li;
        switch (mutation.method) {
            case 'push':
                li = renderTodo(binding.template, mutation.args[0]);
                if(node.compiled){
                    node.append(compile(li));
                    li.destroy();
                }else{
                    node.append(li);
                }
                break;
            case 'splice':
                node.children.splice(mutation.args[0], mutation.args[1]);
                break;
        }
    }
});

function renderTodo(template, todo){
    let c = template.clone(true);
    c.find({class: 'toggle'})
        .on('change', ()=>{
            store.dispatch('toggle', state.todos.indexOf(todo));
        });
    todoBind.render(c, todo);
    completedIf.render(c, state, 'path');
    return c;
}

class Todos extends Component{
    constructor(name, root){
        super('todos', root);
    }
    parse(s){
        super.parse(s);
        this.templates.forEach((template)=>{
            let li = template.find('li');
            todosBind.render(li, state, 'todos');
        });
    }
}

Todos.components = {};

Todos.template = '<ul class="todo-list">\
    <li class="completed">\
        <div class="view">\
            <input class="toggle" type="checkbox" checked>\
            <label>Taste JavaScript</label>\
            <button class="destroy"></button>\
        </div>\
        <input class="edit" value="Create a TodoMVC template">\
    </li>\
</ul>';

let newTodoBind = new Bind({
    compile: (node, binding)=>{
        node.on('keyup', (e, input)=>{
            if(e.keyCode === 13 && node.DOMNode.value){
                store.dispatch('add', node.DOMNode.value);
                binding.target.parent[binding.target.key] = '';
            }
        });
    },
    update: (node, binding, mutation)=>{
        if(node.compiled){
            node.DOMNode.value = mutation.newValue;
        }
    }
});

let activeBind = new Bind({
    parse: activeCount,
    compiled: activeCount,
    update: activeCount
});

function activeCount(node, binding){
    node.children[0].text = binding.target.parent[binding.target.key];
}

let clearIfBind = new If(()=>{
    return state.active < state.todos.length;
});

class App extends Component{
    constructor(){
        super('app');
    }
    parse(s){
        super.parse(s);
        this.templates.forEach((template)=>{
            let footer = template.find('footer'),
                clear = footer.find({class:'clear-completed'});
            newTodoBind.render(template.find('input'), newTodo, 'text');
            lengthIf.render(footer, state, 'todos');
            activeBind.render(footer.find('strong'), state, 'active');
            clear.on('click', ()=>{
                store.dispatch('clear', true);
            });
            clearIfBind.render(clear, state, 'active');
        });
    }
}

App.components = {
    'todos': Todos
};

var app = new App();

start();
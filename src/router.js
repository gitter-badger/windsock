import {is,noop,match} from './util';
import * as query from './url/query';
import * as path from './url/path';

const queue = [],
    active = [],
    states = {},
    config = {
        hash: undefined,
        root: undefined,
        reactivate: undefined,
        otherwise: undefined,
        post: undefined
    };

let listener,
    request,
    routing,
    re,
    i;

export function reset(){
    started() && stop();
    while(queue.length){
        queue.pop();
    }
    while(active.length){
        active.pop();
    }
    Object.keys(states).forEach(p => delete states[p]);
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

export function register(p, h = {}){
    if(invalid(p)){
        throw new Error('invalid path');
    }
    if(!is(h, 'object')){
        throw new Error('parameter must be an object');
    }
    p = prefix(p);
    if(!states[p]){
        states[p] = [h];
    }else{
        states[p].push(h);
    }
    return states[p];
}

export function go(p, params = {}){
    let prefixed,
        segments,
        req;
    if(invalid(p)){
        throw new Error('Invalid path format');
    }
    if(invalidParams(p, params.path)){
        throw new Error(`Invalid params for path ${p}`);
    }
    prefixed = prefix(p);
    segments = (states[prefixed] || is(config.otherwise, 'undefined')) ? prefixed.split('/') : prefix(config.otherwise).split('/');
    params.requested = p;
    params.query = params.query || {};
    req = new Request(segments, params);
    queue.push(req);
    if(!routing){
        next();
    }
    return req.promise;
}

export function start({hash, root, reactivate, otherwise, post} = {}){
    config.hash = is(hash, 'undefined') ? config.hash : hash;
    config.root = is(root, 'undefined') ? config.root : root;
    config.reactivate = is(reactivate, 'undefined') ? config.reactivate : reactivate;
    config.otherwise = is(otherwise, 'undefined') || invalid(otherwise) ? config.otherwise : otherwise;
    config.post = is(post, 'undefined') || !is(post, 'function') ? config.post : post;
    listen(function listenCallback(evt){
        let pathname = path.normalize(config.hash ? location.hash.replace('#', '') : location.pathname),
            p = resolve(pathname),
            params;
        if(p){
            p = p.slice(1).join('/');
            pathname = pathname.split('/');
            params = {
                path: path.parse(p),
                query: query.parse(location.search, {
                    query: true
                }),
                replace: true,
                event: evt
            };
            for(let key in params.path){
                params.path[key] = pathname[params.path[key]];
            }
            !invalid(p) && go(p, params);
        }
    });
    listener && listener();
}

export function stop(){
    listen();
}

export function started(){
    return !!listener;
}

export class Request{
    constructor(segments, params = {}){
        if(!segments){
            throw new Error('unspecified segments');
        }
        if(!is(segments, 'array')){
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
        this.promise = new Promise((res, rej)=>{
            this.resolve = res;
            this.reject = rej;
        });
    }
    toString(){
        let p = this.segments.slice(1).join('/'),
            pathname = this.path ? path.format(p, this.path) : p,
            search = this.query ? query.format(this.query, {
                query: true
            }) : '';
        return pathname + search;
    }
}

function listen(fn) {
    let evt;
    if(typeof window === 'undefined'){
        return;
    }
    evt = config.hash ? 'hashchange' : 'popstate';
    if(!fn){
        if(!listener){
            throw new Error('router no started');
        }
        typeof window !== 'undefined' && window.removeEventListener(evt, listener);
        listener = undefined;
    }else{
        if(listener){
            throw new Error('router already started');
        }
        listener = fn;
        window.addEventListener(evt, listener);
    }
}

function prefix(p){
    return `${config.root}${p ? '/' + p : ''}`;
}

function resolve(pathname){
    let match = {
            literal: 0,
            variable: 0
        },
        resolved;
    pathname = prefix(pathname).split('/');
    Object.keys(states)
        .forEach((p)=>{
            let slugs = p.split('/'),
                result;
            if(slugs.length > pathname.length){
                return;
            }
            result = compare(slugs, pathname);
            //if compare returns 0, just throw it out
            if(result.literal === 0){
                return;
            }
            if(result.literal > match.literal || (result.literal === match.literal && result.variable > match.variable)){
                match = result;
                resolved = p;
            }
        });
    if(resolved){
        resolved = resolved.split('/');
        resolved = resolved.concat(pathname.slice(resolved.length));
    }
    return resolved;
}

function compare(p, pathname){
    let result = {
        literal: 0,
        variable: 0
    };
    for(let n = 0, l = p.length; n < l; n++){
        if(p[n].indexOf(':') === 0){
            result.variable++;
        }else{
            if(p[n] !== pathname[n]){
                result.literal = 0;
                return result;
            }
            result.literal++;
        }
    }
    return result;
}

function next(){
    let previous;
    if(queue.length){
        routing = true;
        previous = request;
        request = queue.shift();
        request.previous = previous;
        parse();
    }else{
        routing = false;
    }
}

function parse(){
    i = 0;
    while(i < request.segments.length){
        if(request.segments[i] !== active[i]){
            deactivate();
            return;
        }
        i++;
    }
    deactivate();
}

function deactivate(){
    let state;
    if(active.length - i > 0){
        state = states[active.join('/')];
        if(state){
            request.target = active.slice(1).join('/');
            series(state.map(h => h.deactivate || noop))
                .then(()=>{
                    active.pop();
                    deactivate();
                })
                .catch((e)=>{
                    request.reject(e);
                    next();
                });
        }else{
            active.pop();
            deactivate();
        }
    }else{
        reactivateRequest() ? reactivate() : activate();
    }
}

function reactivateRequest(){
    let prev = request.previous;
    if(config.reactivate || request.segments.length === 1){
        return true;
    }
    if(prev){
        return request.requested === prev.requested && (!match(request.query, prev.query) || !match(prev.query, request.query));
    }
    return false;
}

function reactivate(){
    let state;
    if(re.length < active.length){
        re = active.slice(0, re.length + 1);
        state = states[re.join('/')];
        if(state){
            request.target = active.slice(1).join('/');
            series(state.map(h => h.activate || noop))
                .then(reactivate)
                .catch((e)=>{
                    request.reject(e);
                    re = [];
                    next();
                });
            return;
        }
    }
    re = [];
    activate();
}

function activate(){
    let state;
    if(active.length < request.segments.length){
        active.push(request.segments[active.length]);
        state = states[active.join('/')];
        if(state){
            request.target = active.slice(1).join('/');
            series(state.map(h => h.activate || noop))
                .then(activate)
                .catch((e)=>{
                    request.reject(e);
                    next();
                });
        }else{
            activate();
        }
    }else {
        request.resolved = request.toString();
        if(typeof window !== 'undefined'){
            if(request.replace){
                typeof window.history !== 'undefined' && window.history.replaceState({}, '', (config.hash ? '#/' : '/') + request.resolved);
            }else{
                typeof window.history !== 'undefined' && window.history.pushState({}, '', (config.hash ? '#/' : '/') + request.resolved);
            }
        }
        request.resolve(request);
        config.post && config.post(request);
        next();
    }
}

function series(fns){
    return fns.reduce((promise, fn)=>{
        return promise.then(()=>{
            return fn(request);
        });
    }, Promise.resolve());
}

function invalid(p){
    return /^\/|[^#]\/$/.test(p);
}

function invalidParams(p, obj){
    let pathMap = path.parse(p),
        keys = Object.keys(pathMap);
    if(keys.length && (is(obj, 'undefined') || !is(obj, 'object'))){
        return true;
    }
    for(let key in pathMap){
        if(is(obj[key], 'undefined')){
            return true;
        }
    }
    return false;
}
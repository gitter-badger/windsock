import {is,noop} from './util';
import * as query from './url/query';
import * as path from './url/path';

const queue = [],
    active = [],
    states = {},
    config = {
        hash: true,
        root: 'root',
        reactivate: false,
        otherwise: null
    };

let request,
    routing = false,
    re = [],
    listener,
    i;

export function register(p, h){
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

export function go(p, params = {path: {}}){
    let split;
    if(invalid(p)){
        throw new Error('Invalid path format');
    }
    if(invalidParams(p, params.path)){
        throw new Error(`Invalid params for path ${p}`);
    }
    split = prefix(p).split('/');
    split.params = params;
    queue.push(split);
    if(!routing){
        next();
    }
}

export function start({hash, root, reactivate, otherwise} = {}){
    config.hash = is(hash, 'undefined') ? config.hash : hash;
    config.root = is(root, 'undefined') ? config.root : root;
    config.reactivate = is(reactivate, 'undefined') ? config.reactivate : reactivate;
    config.otherwise = is(otherwise, 'undefined') ? config.otherwise : otherwise;

    listen((evt)=>{
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
            invalid(p) ? config.otherwise && go(config.otherwise) : go(p, params);
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
    resolved = resolved && resolved.split('/');
    return resolved && resolved.concat(pathname.slice(resolved.length));
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
    if(queue.length){
        routing = true;
        request = queue.shift();
        parse();
    }else{
        routing = false;
    }
}

function parse(){
    i = 0;
    while(i < request.length){
        if(request[i] !== active[i]){
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
            series(state.map(h => h.deactivate || noop))
                .then(()=>{
                    active.pop();
                    deactivate();
                })
                .catch((e)=>{
                    console.warn(e);
                    next();
                });
        }else{
            active.pop();
            deactivate();
        }
    }else{
        config.reactivate ? reactivate() : activate();
    }
}

function reactivate(){
    let state;
    if(re.length < active.length){
        re = active.slice(0, re.length + 1);
        state = states[re.join('/')];
        if(state){
            series(state.map(h => h.activate || noop))
                .then(reactivate)
                .catch((e)=>{
                    console.warn(e);
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
    if(active.length < request.length){
        active.push(request[active.length]);
        state = states[active.join('/')];
        if(state){
            series(state.map(h => h.activate || noop))
                .then(activate)
                .catch((e)=>{
                    console.warn(e);
                    next();
                });
        }else{
            activate();
        }
    }else if(typeof window !== 'undefined'){
        if(request.params.replace){
            typeof window.history !== 'undefined' && window.history.replaceState({}, '', normalize());
        }else{
            typeof window.history !== 'undefined' && window.history.pushState({}, '', normalize());
        }
        next();
    }
}

function normalize(){
    let root = config.hash ? '#/' : '/',
        p = active.slice(1).join('/'),
        pathname = request.params.path ? path.format(p, request.params.path) : p,
        search = request.params.query ? query.format(request.params.query, {
            query: true
        }) : '';
    return root + pathname + search;
}

function series(fns){
    return fns.reduce((promise, fn)=>{
        return promise.then(()=>{
            return fn(request.params);
        });
    }, Promise.resolve());
}

function invalid(p){
    return /^\/|[^#]\/$/.test(p);
}

function invalidParams(p, params){
    var pathMap = path.parse(p);
    for(let key in pathMap){
        if(is(params[key], 'undefined')){
            return true;
        }
    }
    return false;
}
import {is,noop} from './util';
import * as query from './url/query';
import * as path from './url/path';

const queue = [],
    active = [],
    states = {},
    config = {
        hash: true,
        root: '',
        reactivate: true
    };

let request,
    routing = false,
    re = [],
    listener,
    i;

export function register(p, h){
    if(!is(h, 'object')){
        throw new Error('parameter must be an object');
    }
    if(!states[p]){
        states[p] = [h];
    }else{
        states[p].push(h);
    }
}

export function go(p, params = {}){
    let split = p.split('/');
    split.params = params;
    queue.push(split);
    if(!routing){
        next();
    }
}

export function start({hash = true, root = config.root} = {}){
    let evt = hash ? 'hashchange' : 'popstate';
    if(listener){
        console.warn('router already started');
        return;
    }
    config.hash = hash;
    config.root = hash ? '#' : root;
    listener = (e)=>{
        let pathname = path.normalize(config.hash ? location.hash : location.pathname).split('/'),
            p = resolve(pathname) || config.root,
            params;
        if(p){
            params = {
                path: path.parse(p),
                query: query.parse(location.search, {
                    query: true
                }),
                replace: !config.hash,
                hashChange: config.hash,
                event: e
            };
            for(let key in params.path){
                params.path[key] = pathname[params.path[key]];
            }
            go(p, params);
        }
    };
    window.addEventListener(evt, listener);
    listener();
}

export function stop(){
    let evt = config.hash ? 'hashchange' : 'popstate';
    if(!listener){
        console.warn('router no started');
        return;
    }
    window.removeEventListener(evt, listener);
    listener = undefined;
}

function resolve(pathname){
    let literal = 0,
        resolved;
    Object.keys(states)
        .forEach((p)=>{
            let l = compare(p.split('/'), pathname);
            if(l > literal){
                literal = l;
                resolved = p;
            }
        });
    resolved = resolved && resolved.split('/');
    return resolved && resolved.concat(pathname.slice(resolved.length)).join('/');
}

function compare(p, pathname){
    let literal = 0;
    for(let n = 0, l = p.length; n < l; n++){
        if(p[n].indexOf(':') === 0){
            continue;
        }
        if(p[n] !== pathname[n]){
            return 0;
        }else{
            literal++;
        }
    }
    return literal;
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
    }else{
        if(config.hash){
            if(!request.params.hashChange){
                if(request.params.replace){
                    location.replace(normalize())
                }else{
                    location.hash = normalize();
                }
            }
        }else{
            if(request.params.replace){
                history.replaceState({}, '', normalize());
            }else{
                history.pushState({}, '', normalize());
            }
        }
        next();
    }
}

function normalize(){
    let root = config.hash ? config.root : '/' + config.root,
        pathname = request.params.path ? path.format(active.join('/'), request.params.path) : active.join('/'),
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
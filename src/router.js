import {is,noop} from './util';
import * as query from './url/query';
import * as path from './url/path';

const queue = [],
      active = [],
      states = {},
      ROOT = '/';

let request,
    routing = false,
    listener,
    i;

export function register(p, h){
    if(!is(h,'object')){
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

export function start(){
    if(listener){
        console.warn('router already started');
        return;
    }
    listener = (e)=>{
        let pathname = path.normalize(location.pathname).split('/'),
            p = resolve(pathname),
            params;
        if(p){
            params = {
                path: path.parse(p),
                query: query.parse(location.search, {query: true}),
                replace: true
            };
            for(let key in params.path){
                params.path[key] = pathname[params.path[key]];
            }
            go(p, params);
        }
    };
    window.addEventListener('popstate', listener);
    listener();
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
    return resolved;
}

function compare(p, pathname){
    let literal = 0;
    if(p.length !== pathname.length){
        return 0;
    }
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

function match(pathname, formatted){
    if(pathname.length !== formatted.length){
        return false;
    }
    for(let index = 0, l = pathname.length; index < l; index++){
        if(pathname[index].indexOf(':') === 0){
            continue;
        }
        if(pathname[index] !== formatted[index]){
            return false;
        }
    }
}

export function stop(){
    if(!listener){
        console.warn('router no started');
        return;
    }
    window.removeEventListener('popstate', listener);
    listener = undefined;
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
    console.log('deactivating: ' + active.join('/'));
    state = states[active.join('/')];
    if(state){
      series(state.map(h=>h.deactivate || noop))
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
    activate();
  }
}

function activate(){
  let state;
  if(active.length < request.length){
    active.push(request[active.length]);
    console.log('activating: ' + active.join('/'));
    state = states[active.join('/')];
    if(state){
      series(state.map(h=>h.activate || noop))
       .then(()=>{
         activate();
       })
       .catch((e)=>{
         console.warn(e);
         next();
       });
    }else{
      activate();
    }
  }else{
    if(request.params.replace) {
        console.log('replacestate: ' + active.join('/'));
        history.replaceState({},'', normalize());
    }else{
        console.log('pushstate: ' + active.join('/'));
        history.pushState({},'', normalize());
    }
    next();
  }
}

function normalize(){
    let pathname = request.params.path ? path.format(active.join('/'), request.params.path) : active.join('/'),
        search = request.params.query ? query.format(request.params.query, {query:true}) : '';
    return ROOT + pathname + search;
}

function series(fns){
  return fns.reduce((promise, fn)=>{
    return promise.then(()=>{
        return fn(request.params);
    });
  }, Promise.resolve());
}
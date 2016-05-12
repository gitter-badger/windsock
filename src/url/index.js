import {is} from '../util';
import * as query from './query';
import * as path from './path';

let a;

if(typeof document !== 'undefined'){
    a = document.createElement('a');
}

export function parse(str){
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
        query: query.parse(a.search, {query:true}),
        pathname: a.pathname || null,
        path: path.parse(a.pathname),
        href: a.href
    };
}

export function format(obj){
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
    pathname = path.format(obj.pathname, obj.path);
    search = obj.search || '';
    params = query.format(obj.query, {query:true});
    hash = obj.hash || '';
    //plan to actually look at protocol
    return protocol + '//' + host + pathname + (params || search) + hash;
}

import {is} from '../util';
import * as query from './query';
import * as path from './path';

let a;

if(typeof document !== 'undefined'){
    a = document.createElement('a');
}

export {
    query,
    path
};

export function parse(str){
    if(!a){
        throw new Error('Unable to parse in enviorment');
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
        throw new Error('Unable to format in enviorment');
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

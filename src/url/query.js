import {is} from '../util';

export function parse(str, options = {}){
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

export function format(params, options = {}){
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

export function normalize(query){
    if(!is(query, 'string')){
        throw new Error('Parameter must be a string');
    }
    if(query.indexOf('?') === 0){
        query = query.replace('?','');
    }
    return query;
}

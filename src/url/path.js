import {is} from '../util';

export function parse(path){
    let params = {};
    if(!is(path, 'string')){
        throw new Error('Parameter must be a string');
    }
    path = normalize(path);
    path && path.split('/')
        .forEach(function pathParseMap(slug, i){
            if(slug.indexOf(':') === 0 && slug.length > 1){
                params[slug.replace(':','')] = i;
            }
        });
    return params;
}

export function format(path, params){
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

export function normalize(path){
    if(!is(path, 'string')){
        throw new Error('Parameter must be a string');
    }
    return path.replace(/^\/|\/$/g, '');
}
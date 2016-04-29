import {is} from '../util';
import * as url from './index';

export function parse(str){
    let obj = url.parse(str);
    obj.template = {};
    obj.pathname.replace('/','')
        .split('/')
        .forEach(function pathnameParseMap(slug){
            if(slug.indexOf(':') === 0 && slug.length > 1){
                obj.template[slug.replace(':','')] = '';
            }
        });
    return obj;
}

export function format(obj){
    let pathname,
        formatted;
    if(!is(obj.template, 'object')){
        throw new Error('property must be an object');
    }
    pathname = obj.pathname;
    for(let key in obj.template){
        let val = obj.template[key];
        val = val.toString ? val.toString() : '';
        obj.pathname = obj.pathname.replace((val.length ? ':': '/:') + key, val);
    }
    formatted = url.format(obj);
    obj.pathname = pathname;
    return formatted;
}

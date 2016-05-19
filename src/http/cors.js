import {is} from '../util';
import * as url from '../url/index';

let location = typeof window !== 'undefined' && window.location || undefined,
    origin = !is(location, 'undefined') ? url.parse(location.href) : {};

export function request(request){
    request.crossOrigin = (origin.protocol !== request.url.protocol || origin.host !== request.url.host);
    return request;
}

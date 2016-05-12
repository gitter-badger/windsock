import {is} from '../util';
import * as url from '../url/index';

let origin = url.parse(location.href);

export function request(request){
    request.crossOrigin = (origin.protocol !== request.url.protocol || origin.host !== request.url.host);
    return request;
}

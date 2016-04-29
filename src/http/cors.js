import {is} from '../util';
import * as url from '../url/index';

let origin = url.parse(location.href);

export function request(request){
    let requestUrl = url.parse(request.url);
    request.crossOrigin = (origin.protocol !== requestUrl.protocol || origin.host !== requestUrl.host);
    return request;
}

import {is,extend} from '../util';
export function request(request){
    let headers = {
        'Accept': 'application/json, text/plain, */*'
    };
    if(!request.crossOrigin){
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    if(/^(PUT|POST|PATCH|DELETE)$/i.test(request.method)){
        headers['Content-Type'] = 'application/json';
    }
    request.method = request.method.toUpperCase();
    request.headers = extend(headers, request.headers);
    if(is(request.data, 'object') && request.method === 'GET'){
        extend(request.url.query, request.data);
        delete request.data;
    }
    return request;
}

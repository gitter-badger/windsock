import {is} from '../util';
import * as query from '../url/query';

export function request(request){
    if(is(request.data, 'object') && request.urlencode){
        request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        request.data = query.format(request.data);
    }
    if(is(request.data, 'formData')){
        delete request.headers['Content-Type'];
    }
    if(is(request.data, 'object')){
        //need to also do this for formdata
        request.data = JSON.stringify(request.data);
    }
    return request;
}

export function response(response){
    try{
        response.data = response.data && JSON.parse(response.data);
    }catch(e){
        console.warn(e);
    }
    return response;
}

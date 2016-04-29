import {is} from '../util';
import * as params from '../url/params';

export function request(request){
    if(is(request.data, 'object') && request.urlencode){
        request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        request.data = params.format(request.data);
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
        response.data = JSON.parse(response.data);
    }catch(e){}
    return response;
}

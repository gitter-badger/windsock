let t;

export function request(request){
    if(request.timeout){
        t = setTimeout(function httpTimeoutInterceptor(){
            request.abort();
        }, request.timeout);
    }
    return request;
}

export function response(response){
    clearTimeout(t);
    return response;
}

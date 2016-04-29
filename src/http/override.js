export function request(request){
    if(request.override && /^(PUT|PATCH|DELETE)$/i.test(request.method)){
        request.headers['X-HTTP-Method-Override'] = request.method;
        request.method = 'POST';
    }
}

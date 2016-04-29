import {noop} from '../../util';
export default function xhr(request){
    return new Promise(function xhrPromiseExecutor(resolve){
            let client = new XMLHttpRequest(),
                response = {
                    request: request
                },
                handler = function(){
                    response.data = client.responseText;
                    response.status = client.status;
                    response.statusText = client.statusText;
                    response.headers = client.getAllResponseHeaders();
                    resolve(response);
                };
            request.abort = client.abort;
            client.timeout = 0;
            client.onload = handler;
            client.onabort = handler;
            client.onerror = handler;
            client.ontimeout = noop;
            client.onprogress = noop;
            client.open(request.method, request.url, true);
            for(let key in request.headers){
                client.setRequestHeader(key, request.headers[key]);
            }
            client.send(request.data);
        });
}

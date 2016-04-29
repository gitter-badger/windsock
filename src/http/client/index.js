import xhr from './xhr';

export default function(request){
    let client = request.client || xhr;
    return Promise.resolve(client(request))
        .then(function requestFulfilled(response){
            response.ok = response.status >= 200 && response.status < 300;
            return response;
        });
}

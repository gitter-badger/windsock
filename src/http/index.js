import {clone} from '../util';
import Signal from '../signal';
import * as url from '../url/index';
import * as cors from './cors';
import * as mime from './mime';
import * as timeout from './timeout';
import * as override from './override';
import * as header from './header';
import client from './client/index';

export default class Http{
    constructor(config = {}){
        this.urlencode = !!config.urlencode;
        this.override = !!config.override;
        this.timeout = config.timeout || 0;
        this.headers = config.headers || {};
        this._url = url.parse(config.url || '');
    }
    get url(){
        return url.format(this._url);
    }
    get query(){
        return this._url.query;
    }
    set query(obj){
        this._url.query = obj;
    }
    get path(){
        return this._url.path;
    }
    set path(obj){
        this._url.path = obj;
    }
    GET(data){
        return Http.method(this, 'GET', data);
    }
    POST(data){
        return Http.method(this, 'POST', data);
    }
    PUT(data){
        return Http.method(this, 'PUT', data);
    }
    PATCH(data){
        return Http.method(this, 'PATCH', data);
    }
    DELETE(data){
        return Http.method(this, 'DELETE', data);
    }
    static method(http, method, data = {}){
        return Http.request({
            urlencode: http.urlencode,
            override: http.override,
            timeout: http.timeout,
            headers: clone(http.headers),
            url: http._url,
            data: data,
            method: method
        });
    }
    static request(request){
        Http.interceptors.request.dispatch(request);
        //might not do this here
        request.url = url.format(request.url);
        return client(request)
            .then(function clientRequestFulfilled(response){
                Http.interceptors.response.dispatch(response);
                return response.ok ? response : Promise.reject(response);
            });
    }
}

Http.interceptors = {
    request: new Signal(),
    response: new Signal()
};

Http.interceptors.request.add(timeout.request);
Http.interceptors.request.add(override.request);
Http.interceptors.request.add(mime.request);
Http.interceptors.request.add(header.request);
Http.interceptors.request.add(cors.request);
Http.interceptors.response.add(timeout.response);
Http.interceptors.response.add(mime.response);

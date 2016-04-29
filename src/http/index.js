import {is, merge, clone} from '../util';
import Signal from '../signal';
import * as url from '../url/template';
import * as cors from './cors';
import * as mime from './mime';
import * as timeout from './timeout';
import * as override from './override';
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
    get params(){
        return this._url.query;
    }
    set params(obj){
        this._url.query = obj;
    }
    get path(){
        return this._url.template;
    }
    set path(obj){
        this._url.template = obj;
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
            url: http.url,
            data: data,
            method: method
        });
    }
    static request(request){
        Http.interceptors.request.dispatch(request);
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

Http.interceptors.request.add(cors.request);
Http.interceptors.request.add(mime.request);
Http.interceptors.response.add(mime.response);
Http.interceptors.request.add(timeout.request);
Http.interceptors.response.add(timeout.response);
Http.interceptors.response.add(override.request);

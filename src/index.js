import * as util from './util';
import * as vdom from './vdom/index';
import * as url from './url/index';
import * as router from './router';
import Observer from './observer';
import Store from './store';
import Http from './http/index';
import Bind from './bind';
import Component from './component';
import parse from './parser/parse';
import compile from './compiler/compile';
import clone from './clone';
import transclude from './transclude';

export default{
    version:'0.2.1-0',
    util,
    vdom,
    url,
    Observer,
    Store,
    Http,
    Bind,
    Component,
    parse,
    compile,
    clone,
    transclude,
}

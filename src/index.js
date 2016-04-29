import * as util from './util';
import * as vdom from './vdom/index';
import * as url from './url/template';
import Observer from './observer';
import Bind from './bind';
import Store from './store';
import Http from './http/index';
import parse from './parser/parse';
import compile from './compiler/compile';
import clone from './clone';
import transclude from './transclude';

export default{
    version:'0.1.14',
    util,
    vdom,
    url,
    Observer,
    Bind,
    Store,
    Http,
    parse,
    compile,
    clone,
    transclude,
}

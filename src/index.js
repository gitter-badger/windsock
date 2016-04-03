import * as util from './util';
import * as vdom from './vdom/index';
import * as transforms from './transforms/index';
import Observer from './observer';
import Transform from './transform';
import Bind from './bind';
import Store from './store';
import parse from './parser/parse';
import compile from './compiler/compile';
import clone from './clone';
import transclude from './transclude';

export default{
    version:'0.1.14',
    util,
    vdom,
    transforms,
    Observer,
    Transform,
    Bind,
    Store,
    parse,
    compile,
    clone,
    transclude,
}

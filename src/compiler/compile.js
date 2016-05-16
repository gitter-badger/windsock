import * as compiler from './index';
import {Node} from '../vdom/index';

export default function compile(template){
    if(!template instanceof Node){
        throw new Error('Template param must be of type Node');
    }
    if(template.compiled === true){
        throw new Error('Specified template is already compiled');
    }
    let clone = template.clone(true);
    compileNode(clone);
    return clone;
}

function compileNode(node){
    if(typeof document !== 'undefined'){
        compiler.compileDOM(node);
    }
    node.compiled = true;

    if(node.children){
        node.children.forEach(compileNode);
    }
    compiler.compileBindings(node);
}

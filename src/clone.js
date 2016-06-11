import Node from './vdom/node';
import compile from './compiler/compile';

export default function clone(node, deep = false){
    let clone;
    if(!node instanceof Node){
        throw new Error('Node param must be of type Node');
    }
    clone = node.clone(deep);
    if(node.compiled === true){
        clone = compile(clone);
    }
    return clone;
}

import {is} from './util';
import Observer from './Observer';

export default class Bind{
    constructor(traverse, transform){
        this.traversal = traversalMethod(traverse);
        this.transform = transform;
    }
    render(nodes, data){
        let binding = {
            data: data,
            instance: this
        };
        if(is(nodes, 'array')){
            for(let i = 0, l = nodes.length; i < l; i++){
                nodeBinding(nodes[i], binding);
            }
        }else{
            nodeBinding(nodes, binding);
        }
    }
    compile(node, binding){
        //called when the node is compiled
    }
}

function nodeBinding(node, binding){
    let instance = binding.instance,
        valueObject = instance.traversal(binding.data, node);

    //call transform.bind with node and value determined by traversal?
    instance.transform.bind(node, binding);
    node.bindings.push(binding);
}

function traversalMethod(traverse){
    if(is(traverse, 'function')){
        return traverse;
    }else if(is(traverse, 'string')){
        return keypathTraversal.bind(null, traverse);
    }
}

function keypathTraversal(keypath, data, node){
    let keys = keypath.split('.'),
        key = keys.slice(-1)[0],
        parent,
        value = data;
    while(keys.length){
        parent = value;
        value = resolveKeypath(value, keys);
    }
    return {
        key: key,
        parent: parent,
        value: value
    }
}

function resolveKeypath(target, keypath){
    let key = keypath.shift();
    if(typeof target[key] === 'undefined'){
        throw new Error(`Failed to resolve '${key}' on target`);
    }
    return target[key];
}

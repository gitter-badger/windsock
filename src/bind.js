import Observer from './observer';
import compile from './compiler/compile';

export default class Bind{
    constructor(keypath, transform){
        this.keypath = keypath;
        this.transform = transform;
    }
    render(nodes, data){
        let keypath = this.keypath.split('.'),
            binding = {
                instance: this,
                key: keypath.slice(-1)[0],
                parent: undefined
            },
            resolved = data;
        while(keypath.length){
            binding.parent = resolved;
            resolved = resolve(resolved, keypath);
        }
        if(Array.isArray(nodes)){
            for(let i = 0, l = nodes.length; i < l; i++){
                nodeBinding(nodes[i], binding, resolved);
            }
        }else{
            nodeBinding(nodes, binding, resolved);
        }
    }
}

function resolve(target, keypath){
    return target[keypath.shift()];
}

function nodeBinding(node, binding, value){
    let instance = binding.instance;
    instance.transform.bind.dispatch(node, value, instance);
    node.bindings.push(binding);
}

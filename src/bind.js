import {is} from './util';
import Observer from './Observer';

export default class Bind{
    constructor(transform = {}, recursive = false){
        if(is(transform, 'function')){
            this.transform = {
                bind: transform,
                update: transform
            };
        }else{
            this.transform = transform;
        }
        this.recursive = recursive;
    }
    render(node, target, keypath = ''){
        let targetMap = keypathTraversal(target, keypath);
        if(is(node, 'array')){
            for(let i = 0, l = node.length; i < l; i++){
              renderNode(node[i], this, targetMap);
            }
        }else{
            renderNode(node, this, targetMap);
        }
    }
    static observer(node, binding){
        let target = binding.target,
            instance = binding.instance,
            observer;
        if(is(target.value, 'object') || is(target.value, 'array')){
            observer = new Observer(function objectBindObserverCallback(mutation){
                instance.transform.update && instance.transform.update(node, binding, mutation);
            });
            observer.observe(target.value);
        }else{
            observer = new Observer(function targetBindObserverCallback(mutation){
                if(mutation.type === target.key){
                    instance.transform.update && instance.transform.update(node, binding, mutation);
                }
            });
            observer.observe(target.parent);
        }
        binding.observer = observer;
    }
}

function renderNode(node, instance, target){
    let bindMap = instance.transform.bind && instance.transform.bind(node, target),
        binding;
    bindMap = bindMap || {
        node: node,
        prop: 'node'
    };
    binding = bindMap.node.bindings[bindMap.prop];
    if(binding){
        console.warn(`Removing '${bindMap.prop}' binding from node`);
        binding.instance.transform.unbind && binding.instance.transform.unbind(bindMap.node, binding);
        binding.observer.disconnect();
    }
    bindMap.node.bindings[bindMap.prop] = {
        template: node,
        target: target,
        instance: instance,
        observer: undefined
    };
    Bind.observer(bindMap.node, bindMap.node.bindings[bindMap.prop], instance.recursive);
}

function keypathTraversal(target, keypath){
    let keys = keypath.toString().split('.'),
        key = keys.slice(-1)[0],
        parent = target,
        value = target;
    if(keypath !== ''){
        while(keys.length){
            parent = value;
            value = resolveKeypath(value, keys);
        }
    }
    return {
        key: key,
        parent: parent,
        value: value
    };
}

function resolveKeypath(target, keypath){
    let key = keypath.shift();
    if(typeof target[key] === 'undefined'){
        throw new Error(`Failed to resolve '${key}' on target`);
    }
    return target[key];
}

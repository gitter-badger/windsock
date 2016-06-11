import Observer from '../observer';
import Text from '../vdom/text';
import Fragment from '../vdom/fragment';
import Element from '../vdom/element';
import * as batch from '../batch';
import Bind from '../bind';

const NAMESPACE_URI = {
    html: 'http://www.w3.org/1999/xhtml',
    svg: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink',
    xmlns: 'http://www.w3.org/1999/xlink'
};

function xmlNamespace(node){
    while(node){
        if(node.DOMNode){
            return node.DOMNode.namespaceURI;
        }
        if(node.name.indexOf('svg') === 0){
            return NAMESPACE_URI.svg;
        }
        node = node.parent instanceof Element ? node.parent : false;
    }
    return NAMESPACE_URI.html;
}

function attrNamespace(name){
    var i = name.indexOf(':'),
        ns = null;
    if(i >= 0){
        ns = NAMESPACE_URI[name.substring(0, i)] || null;
    }
    return ns;
}

function textNodeMutationCallback(record){
    if(record.type === 'textContent' && record.oldValue !== record.newValue){
        batch.add(function batchedTextNodeMutation(){
            record.target.parent.DOMNode.textContent = record.newValue;
        });
    }
}

function attributeMutationCallback(record){
    let node;
    if(record.oldValue === record.newValue){
        return;
    }
    node = record.target.parent;
    switch(record.method){
        case 'delete':
            batch.add(function batchedAttributeDeleteMutation(){
                node.DOMNode.removeAttributeNS(attrNamespace(record.type), record.type);
            });
            break;
        case 'add':
        case 'set':
            batch.add(function batchedAttributeSetMutation(){
                node.DOMNode.setAttributeNS(attrNamespace(record.type), record.type, record.newValue);
            });
            break;
    }
}

function childrenMutationCallback(record){
    let DOMNode = record.target.parent.DOMNode;
    switch(record.method){
        case 'push':
            record.newValue.forEach(function childrenMutationValueIterator(child){
                batch.add(function batchedChildrenPushMutation(){
                    DOMNode.appendChild(child.DOMNode);
                });
            });
            break;
        case 'pop':
            if(record.oldValue && record.oldValue.length){
                batch.add(function batchedChildrenRemoveMutation(){
                    DOMNode.removeChild(record.oldValue[0].DOMNode);
                });
            }
            break;
        case 'unshift':
            record.newValue.forEach(function childrenMutationValueIterator(child){
                batch.add(function batched(){
                    DOMNode.insertBefore(child.DOMNode, DOMNode.firstChild);
                });
            });
            break;
        case 'splice':
            if(record.oldValue && record.oldValue.length){
                batch.add(function batchedChildrenRemoveMutation(){
                    DOMNode.removeChild(record.oldValue[0].DOMNode);
                });
            }
            if(record.args.length === 3){
                batch.add(function batchedChildrenInsertMutation(){
                    DOMNode.insertBefore(record.newValue[0].DOMNode, DOMNode.childNodes[record.type]);
                });
            }
            break;
    }
}

function eventMutationCallback(record){
    let node = record.target.parent;
    if(record.method === 'add'){
        node.DOMNode.addEventListener(record.type, dispatchEventListener(node, record.type));
    }else if(record.method === 'delete'){
        node.DOMNode.removeEventListener(record.type);
    }
}

export function compileDOM(node){
    let textObserver,
        attributeObserver,
        childrenObserver,
        eventObserver;
    if(node instanceof Text){
        node.DOMNode = document.createTextNode(node.value.textContent);
        textObserver = new Observer(textNodeMutationCallback);
        textObserver.observe(node.value);
        node.observers.push(textObserver);
    }else if(node instanceof Element){
        node.DOMNode = document.createElementNS(xmlNamespace(node), node.name);
        Object.keys(node.attributes)
            .forEach(function compileNodeAttributeIterator(key){
                node.DOMNode.setAttributeNS(attrNamespace(key), key, node.attributes[key]);
            });
        attributeObserver = new Observer(attributeMutationCallback);
        childrenObserver = new Observer(childrenMutationCallback);
        attributeObserver.observe(node.attributes);
        childrenObserver.observe(node.children);
        node.observers.push(attributeObserver);
        node.observers.push(childrenObserver);
    }else if(node instanceof Fragment){
        node.DOMNode = document.createDocumentFragment();
        childrenObserver = new Observer(childrenMutationCallback);
        childrenObserver.observe(node.children);
        node.observers.push(childrenObserver);
    }else{
        throw new Error('Unspecified node instance');
    }
    eventObserver = new Observer(eventMutationCallback);
    eventObserver.observe(node.events);
    node.observers.push(eventObserver);
    for(var evt in node.events){
        node.DOMNode.addEventListener(evt, dispatchEventListener(node, evt));
    }
    if(node.parent){
        node.parent.DOMNode.appendChild(node.DOMNode);
    }
}

export function compileBindings(node){
    Object.keys(node.bindings)
        .forEach(function mapClonedBindings(key){
            let binding = node.bindings[key];
            binding.instance.transform.compile && binding.instance.transform.compile(node, binding);
            node.bindings[key] = {
                template: binding.template,
                target: binding.target,
                instance: binding.instance,
                observer: undefined
            };
            if(!binding.instance.parsed){
                binding.observer.disconnect();
            }
            Bind.observer(node, node.bindings[key]);
        });
}

function dispatchEventListener(node, evt){
    return function eventListenerClosure(e){
        node.events[evt].dispatch(e, node);
    };
}

import {Text, Fragment, Element} from '../vdom/index';
import Observer from '../observer';
import * as batch from '../batch';

const NAMESPACE_URI = {
    html: 'http://www.w3.org/1999/xhtml',
    svg: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink'
};

function xmlNamespace(node){
    while(node){
        if(node.DOMNode){
            return node.DOMNode.namespaceURI;
        }
        if(node.name === 'svg'){
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
        batch.add(()=>{
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
            batch.add(()=>{
                node.DOMNode.removeAttributeNS(attrNamespace(record.type), record.type);
            });
            break;
        case 'add':
        case 'set':
            batch.add(()=>{
                node.DOMNode.setAttributeNS(attrNamespace(record.type), record.type, record.newValue);
            });
            break;
    }
}

function childrenMutationCallback(record){
    let DOMNode = record.target.parent.DOMNode;
    switch(record.method){
        case 'push':
            record.newValue.forEach((child)=>{
                batch.add(()=>{
                    DOMNode.appendChild(child.DOMNode);
                });
            });
            break;
        case 'unshift':
            record.newValue.forEach((child)=>{
                batch.add(()=>{
                    DOMNode.insertBefore(child.DOMNode, DOMNode.firstChild);
                });
            });
            break;
        case 'splice':
            if(record.oldValue && record.oldValue.length){
                batch.add(()=>{
                    DOMNode.removeChild(record.oldValue[0].DOMNode);
                });
            }
            if(record.args.length === 3){
                batch.add(()=>{
                    DOMNode.insertBefore(record.newValue[0].DOMNode, DOMNode.childNodes[record.type]);
                });
            }
            break;
    }
}

export function compileDOM(node){
    let textObserver,
        attributeObserver,
        childrenObserver;
    if(node instanceof Text){
        node.DOMNode = document.createTextNode(node.value.textContent);
        textObserver = new Observer(textNodeMutationCallback);
        textObserver.observe(node.value);
        node.observers.push(textObserver);
    }else if(node instanceof Element){
        node.DOMNode = document.createElementNS(xmlNamespace(node), node.name);
        Object.keys(node.attributes)
            .forEach((key)=>{
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
    if(node.parent){
        node.parent.DOMNode.appendChild(node.DOMNode);
    }
}

export function compileBindings(node){
    for(let i = 0, l = node.bindings.length; i < l; i++){
        node.bindings[i].instance.compile(node, node.bindings[i]);
    }
}

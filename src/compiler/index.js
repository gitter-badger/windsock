var util = require('../util'),
    /*jshint -W079 */
    Text = require('../node/text'),
    Fragment = require('../node/fragment'),
    Element = require('../node/element'),
    batch = require('../batch'),
    partial = util.partial,
    each = util.each;

var namespaceURI = {
    html: 'http://www.w3.org/1999/xhtml',
    svg: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink'
};

function textContent(node, value){
    node.textContent = value;
}

function setAttribute(node, key, value){
    node.setAttributeNS(attrns(key), key, value);
}

function removeChild(node){
    node.parentNode.removeChild(node);
}

function appendChild(node, child){
    node.appendChild(child);
}

function insertBefore(parent, node, ref){
    parent.insertBefore(node, ref);
}

function observeDOMTextValue(mutation, observer){
    if(mutation.name === 'value' && mutation.object.value !== mutation.oldValue){
        batch.add(partial(textContent, observer.root._documentNode, mutation.object.value));
    }
}

function observeDOMElementAttributes(mutation, observer){
    if(mutation.name === 'attributes'){
        //handle adding or deleting attributes
    }else if(mutation.object === observer.root.attributes){
        if(observer.root.attributes[mutation.name] !== mutation.oldValue){
            batch.add(partial(setAttribute, observer.root._documentNode, mutation.name, mutation.object[mutation.name]));
        }
    }
}

function observeDOMElementChildren(mutation, observer){
    var node = observer.root._documentNode;
    //splice is used for before, after, and remove
    //remove() on compiled node is observed on parent and child is destroyed first
    switch(mutation.type){
        case 'splice':
            if(mutation.oldValue){
                each(mutation.oldValue, function batchRemoveChild(child){
                    batch.add(partial(removeChild, child._documentNode));
                });
            }
            if(mutation.transformed.length === 3){
                //childNodes returns live list of child nodes. we need this because like unshift
                //the virtual node.children has already been manipulated
                batch.add(partial(insertBefore, node, mutation.transformed[2]._documentNode, node.childNodes[mutation.name]));
            }
        break;
        case 'push':
            each(mutation.transformed, function batchAppendChild(child){
                batch.add(partial(appendChild, node, child._documentNode));
            });
        break;
        case 'unshift':
            each(mutation.transformed, function(child){
                //have to use elements first child because its already been unshifted to _children array
                batch.add(partial(insertBefore, node, child._documentNode, node.firstChild));
            });
        break;
    }
}

function observeDOMElementEvents(mutation, observer){
    if(mutation.type === 'add'){
        //double closure on observer.root ref here...
        observer.root._documentNode.addEventListener(mutation.name, dispatchEventListener(observer.root, mutation.name));
    }else if(mutation.type === 'delete'){
        observer.root._documentNode.removeEventListener(mutation.name);
    }
}

function dispatchEventListener(n, evt){
    return function eventListenerClosure(e){
        n._dispatch(evt, e);
    };
}

function attrns(name){
    var i = name.indexOf(':'),
        ns = null;
    if(i >= 0){
        ns = namespaceURI[name.substring(0, i)] || null;
    }
    return ns;
}

function xmlns(node){
    while(node){
        if(node._documentNode !== null){
            return node._documentNode.namespaceURI;
        }
        if(node.name === 'svg'){
            return namespaceURI.svg;
        }
        node = node.parent instanceof Element ? node.parent : false;
    }
    return namespaceURI.html;
}

function compileDOM(node){
    if(node instanceof Text){
        node._documentNode = document.createTextNode(node._value.value);
        node._observer.observe(node._value, false, observeDOMTextValue);
    }else if(node instanceof Element){
        node._documentNode = document.createElementNS(xmlns(node), node._value.name);
        for(var key in node._value.attributes){
            setAttribute(node._documentNode, key, node._value.attributes[key]);
        }
        node._observer.observe(node._value, false, observeDOMElementAttributes);
        node._observer.observe(node._value.attributes, false, observeDOMElementAttributes);
        node._observer.observe(node._children, false, observeDOMElementChildren);
    }else if(node instanceof Fragment){
        node._documentNode = document.createDocumentFragment();
        node._observer.observe(node._children, false, observeDOMElementChildren);
    }else{
        throw new Error('failed to compile node, not an instance of Text or Element');
    }
    node._observer.observe(node._events, false, observeDOMElementEvents);
    for(var evt in node._events){
        node._documentNode.addEventListener(evt, dispatchEventListener(node, evt));
    }
    if(node.parent) node.parent._documentNode.appendChild(node._documentNode);
}

exports.compileDOM = compileDOM;

var util = require('../util'),
    Text = require('../node/text'),
    Element = require('../node/element'),
    Observer = require('../observer'),
    Batch = require('../batch'),
    each = util.each,
    is = util.is;

module.exports = function compile(node){

    var clone = node.clone(true);

    clone._transclude = node._transclude;

    node._transclude = null;

    compileNode(clone);

    if(clone.children) compileNodes(clone.children);

    return clone;

};

function compileNode(node){

    node._batch = new Batch(batchCallback, node);

    node._observer = new Observer(node);

    node._observer.observe(node._value, false, observeValue);

    observeEvents(node);

    if(node instanceof Text){

        node._documentNode = document.createTextNode(node._value.value);
        compileText(node);

    }else if(node instanceof Element){

        node._documentNode = document.createElement(node._value.name);
        compileElement(node);

    }

    if(node.parent) node.parent._documentNode.appendChild(node._documentNode);

    node._compiled = true;

    return node;

}

function compileNodes(nodes){

    var node;

    for(var i = 0, l = nodes.length; i < l; i++){

        node = compileNode(nodes[i]);

        if(node.children) compileNodes(node.children);

    }

}

function batchCallback(node){

    node._dispatch('batch');

}

function dispatchEventListener(n, evt){

    return function eventListenerClosure(e){

        n._dispatch(evt, e);

    };

}

function observeEvents(node){

    node._observer.observe(node._events, false, function(mutation){

        if(mutation.type === 'add'){

            node._documentNode.addEventListener(mutation.name, dispatchEventListener(node, mutation.name));

        }else if(mutation.type === 'delete'){

            node._documentNode.removeEventListener(mutation.name);

        }

    });

    for(var evt in node._events){

        node._documentNode.addEventListener(evt, dispatchEventListener(node, evt));

    }

}

function observeValue(mutation, observer){

    if(mutation.name === 'value' && mutation.object.value !== mutation.oldValue){

        observer.root._batch.add(function textContent(){

            observer.root._documentNode.textContent = mutation.object.value;

        });

        observer.root._jsonml = mutation.object.value;

    }else if(mutation.name === 'attributes'){

        //handle setting or deleting attributes

    }

}

function observeAttributes(mutation, observer){

    if(observer.root.attributes[mutation.name] !== mutation.oldValue){

        observer.root._batch.add(function setAttribute(){

            observer.root._documentNode.setAttribute(mutation.name, mutation.object[mutation.name]);

        });

    }

    if(is(mutation.object, 'empty') && is(observer.root._jsonml[1], 'object')){

        observer.root._jsonml.splice(1, 1);

    }else if(observer.root._jsonml[1] !== mutation.object){

        observer.root._jsonml.splice(1, 0, mutation.object);

    }

}

function observeChildren(mutation, observer){

    var children;

    //splice is used for before, after, and remove
    //remove() on compiled node is observed on parent and child is destroyed first
    switch(mutation.type){
        case 'splice':
            if(mutation.oldValue){

                each(mutation.oldValue, function batchRemoveChild(child){

                    observer.root._batch.add(function removeChild(){

                        child._documentNode.parentNode.removeChild(child._documentNode);

                    });

                });

            }

            if(mutation.transformed.length === 3){

                observer.root._batch.add(function insertChild(){

                    //childNodes returns live list of child nodes need this because like unshift the virtual node.children has already been manipulated
                    observer.root._documentNode.insertBefore(mutation.transformed[2]._documentNode, observer.root._documentNode.childNodes[mutation.name]);

                });

            }
        break;
        case 'push':
            each(mutation.transformed, function batchAppendChild(child){

                observer.root._batch.add(function appendChild(){

                    observer.root._documentNode.appendChild(child._documentNode);

                });

            });
        break;
        case 'unshift':
            each(mutation.transformed, function(child){

                observer.root._batch.add(function(){

                    //have to use elements first child because its already been unshifted to _children array
                    observer.root._documentNode.insertBefore(child._documentNode, observer.root._documentNode.firstChild);

                });

            });
        break;
    }

    children = is(observer.root._value.attributes, 'empty') ? observer.root._jsonml.splice(1) : observer.root._jsonml.splice(2);

    Array.prototype[mutation.type].apply(children, mutation.transformed);

    for(var i = 0, l = children.length; i < l; i++){

        observer.root._jsonml.push(children[i]);

    }

}

function compileText(node){

    node._jsonml = node.value;

}

function compileElement(node){

    node._observer.observe(node._value.attributes, false, observeAttributes);

    node._observer.observe(node._children, false, observeChildren);

    for(var key in node._value.attributes){

        node._documentNode.setAttribute(key, node._value.attributes[key]);

    }

    node._jsonml = Array.prototype.slice.call(node._children);

    node._jsonml.unshift(node._value.name);

    if(!is(node._value.attributes, 'empty')) node._jsonml.splice(1, 0, node._value.attributes);

}

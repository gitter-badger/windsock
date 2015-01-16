var util = require('../util'),
    Text = require('../node/text'),
    Element = require('../node/element'),
    each = util.each,
    is = util.is;

function observeJSONMLText(mutation, observer){

    if(mutation.name === 'value' && mutation.object.value !== mutation.oldValue){

        observer.root._jsonml = mutation.object.value;

    }

}

function observeJSONMLELementAttributes(mutation, observer){

    var attributes = observer.root.attributes;

    if(mutation.name !== 'attributes' && mutation.object === observer.root.attributes) return;

    if(is(attributes, 'empty') && is(observer.root._jsonml[1], 'object')){

        observer.root._jsonml.splice(1, 1);

    }else if(observer.root._jsonml[1] !== attributes){

        observer.root._jsonml.splice(1, 0, attributes);

    }

}

function observeJSONMLElementChildren(mutation, observer){

    var children = is(observer.root._value.attributes, 'empty') ? observer.root._jsonml.splice(1) : observer.root._jsonml.splice(2);

    Array.prototype[mutation.type].apply(children, mutation.transformed);

    for(var i = 0, l = children.length; i < l; i++){

        observer.root._jsonml.push(children[i]);

    }

}

function observeDOMTextValue(mutation, observer){

    if(mutation.name === 'value' && mutation.object.value !== mutation.oldValue){

        observer.root._batch.add(function textContent(){

            observer.root._documentNode.textContent = mutation.object.value;

        });

    }

}

function observeDOMElementAttributes(mutation, observer){

    if(mutation.name === 'attributes'){

        //handle adding or deleting attributes

    }else if(mutation.object === observer.root.attributes){

        if(observer.root.attributes[mutation.name] !== mutation.oldValue){

            observer.root._batch.add(function setAttribute(){

                observer.root._documentNode.setAttribute(mutation.name, mutation.object[mutation.name]);

            });

        }

    }

}

function observeDOMElementChildren(mutation, observer){

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

}

function observeDOMElementEvents(mutation, observer){

    if(mutation.type === 'add'){

        //double closure on observer.root ref here...
        observer.root._documentNode.addEventListener(mutation.name, dispatchEventListener(observer.root, mutation.name));

    }else if(mutation.type === 'delete'){

        observer.root._documentNode.removeEventListener(mutation.name);

    }

}

//check in compiler.compile whether or not we're in the browser
function compileDOM(node){

    if(node instanceof Text){

        node._documentNode = document.createTextNode(node._value.value);
        node._observer.observe(node._value, false, observeDOMTextValue);

    }else if(node instanceof Element){

        node._documentNode = document.createElement(node._value.name);

        for(var key in node._value.attributes){

            node._documentNode.setAttribute(key, node._value.attributes[key]);

        }

        node._observer.observe(node._value, false, observeDOMElementAttributes);
        node._observer.observe(node._value.attributes, false, observeDOMElementAttributes);
        node._observer.observe(node._children, false, observeDOMElementChildren);

    }else{

        throw new Error('failed to compile node, not an instance of Text or Element');

    }

    if(node.parent) node.parent._documentNode.appendChild(node._documentNode);

}

function compileHTML(){

}

function compileJSONML(node){

    if(node instanceof Text){

        node._jsonml = node.value;
        node._observer.observe(node._value, false, observeJSONMLText);

    }else if(node instanceof Element){

        node._jsonml = Array.prototype.slice.call(node._children);
        node._jsonml.unshift(node._value.name);
        if(!is(node._value.attributes, 'empty')) node._jsonml.splice(1, 0, node._value.attributes);
        node._observer.observe(node._value, false, observeJSONMLELementAttributes);
        node._observer.observe(node._value.attributes, false, observeJSONMLELementAttributes);
        node._observer.observe(node._children, false, observeJSONMLElementChildren);

    }else{

        throw new Error('failed to compile node, not an instance of Text or Element');

    }

    node._observer.observe(node._events, false, observeDOMElementEvents);

    for(var evt in node._events){

        node._documentNode.addEventListener(evt, dispatchEventListener(node, evt));

    }

}

function dispatchEventListener(n, evt){

    return function eventListenerClosure(e){

        n._dispatch(evt, e);

    };

}

exports.compileDOM = compileDOM;
exports.compileHTML = compileHTML;
exports.compileJSONML = compileJSONML;

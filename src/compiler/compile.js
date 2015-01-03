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

    node._transclude = null; // for teh memories

    compileNode(clone);

    if(clone.children) compileNodes(clone.children);

    return clone;

};

function compileNode(node){

    if(node instanceof Text){

        return compileText(node);

    }else if(node instanceof Element){

        return compileElement(node);

    }

}

function compileText(node){

    var batch = new Batch();

    node._documentNode = document.createTextNode(node.value);

    node._jsonml = node.value;

    Observer.observe(node._value, false, function(mutation){

        if(mutation.name === 'value' && mutation.object.value !== mutation.oldValue){

            batch.add(function(){

                node._documentNode.textContent = mutation.object.value;

            });

            this._jsonml = mutation.object.value;

        }

    });

    if(node.parent) node.parent._documentNode.appendChild(node._documentNode);

    node._compiled = true;

    return node;

}

function compileElement(node){

    var observer = new Observer(),
        batch = new Batch();

    node._documentNode = document.createElement(node.name);

    node._jsonml = node.children.slice();

    node._jsonml.unshift(node.name);

    if(!is(node.attributes, 'empty')) node._jsonml.splice(1, 0, node.attributes);

    observer.observe(node._value);

    observer.observe(node._value.attributes, false, function(mutation){

        if(node.attributes[mutation.name] !== mutation.oldValue){

            batch.add(function(){

                node._documentNode.setAttribute(mutation.name, mutation.object[mutation.name]);

            });

        }

        if(is(mutation.object, 'empty') && is(node._jsonml[1], 'object')){

            node._jsonml.splice(1, 1);

        }else if(node._jsonml[1] !== mutation.object){

            node._jsonml.splice(1, 0, mutation.object);

        }

    });

    observer.observe(node._children, false, function(mutation){

        //change to switch
        if(mutation.type === 'splice'){

            if(mutation.oldValue){

                each(mutation.oldValue, function batchRemoveChild(child){

                    batch.add(function(){

                        child._documentNode.parentNode.removeChild(child._documentNode);

                    });

                });

            }
            if(mutation.transformed.length === 3){

                batch.add(function(){

                    //childNodes returns live list of child nodes need this because like unshift the virtual node.children has already been manip
                    node._documentNode.insertBefore(mutation.transformed[2]._documentNode, node._documentNode.childNodes[mutation.name]);

                });

            }

        }else if(mutation.type == 'push'){

            each(mutation.transformed, function(child){

                batch.add(function(){

                    node._documentNode.appendChild(child._documentNode);

                });

            });

        }else if(mutation.type == 'unshift'){

            each(mutation.transformed, function(child){

                batch.add(function(){

                    //have to use elements first child because its already been unshifted to _children array

                    node._documentNode.insertBefore(child._documentNode, node._documentNode.firstChild);

                });

            });

        }

        var children = is(node.attributes, 'empty') ? node._jsonml.splice(1) : node._jsonml.splice(2);

        Array.prototype[mutation.type].apply(children, mutation.transformed);

        for(var i = 0, l = children.length; i < l; i++){

            node._jsonml.push(children[i]);

        }

    });

    observer.observe(node._events, false, function(mutation){

        if(mutation.type === 'add'){

            node._documentNode.addEventListener(mutation.name, function(e){

                node._dispatch(mutation.name, e);

            });

        }else if(mutation.type === 'delete'){

            node._documentNode.removeEventListener(mutation.name);

        }

    });

    each(node._events, function(signals, evt){

        node._documentNode.addEventListener(evt, function(e){

            node._dispatch(evt, e);

        });

    });

    each(node._value.attributes, function(value, key){

        node._documentNode.setAttribute(key, value);

    });

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

var compiler = require('./index'),
    Observer = require('../observer'),
    Batch = require('../batch');

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

    compiler.compileJSONML(node);

    if(typeof document !== 'undefined') compiler.compileDOM(node);

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

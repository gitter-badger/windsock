var compiler = require('./index'),
    Observer = require('../observer');

module.exports = function compile(template){
    var clone = template.clone(true);
    clone._transclude = template._transclude;
    template._transclude = null;
    compileNode(clone);
    if(clone.children) compileNodes(clone.children);
    return clone;
};

function compileNode(node){
    node._observer = new Observer(node);
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

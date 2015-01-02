module.exports = function(node, DOMNode){

    var parent;

    DOMNode = DOMNode || node._transclude;

    parent = DOMNode.parentNode;

    parent.insertBefore(node._documentNode, DOMNode);

    parent.removeChild(DOMNode);

    node._transclude = null;

};

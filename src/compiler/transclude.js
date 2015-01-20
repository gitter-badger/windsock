module.exports = function transclude(template, target){
    var parent;
    target = target || template._transclude;
    parent = target.parentNode;
    for(var i = 0, l = template._children.length; i < l; i++){
        parent.insertBefore(template._children[i]._documentNode, target);
    }
    parent.removeChild(target);
    template._transclude = null;
};

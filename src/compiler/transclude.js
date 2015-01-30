module.exports = function transclude(template, target){
    var parent;
    target = target || template._transclude;
    parent = target.parentNode;
    parent.insertBefore(template._documentNode, target);
    parent.removeChild(target);
    template._transclude = null;
};

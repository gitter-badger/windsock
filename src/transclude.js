export default function transclude(node, target){
    if(typeof document === 'undefined'){
        throw new Error('transclude requires a document');
    }
    if(!node.transclude && !target){
        throw new Error('unspecified transclusion target');
    }
    target = node.transclude || target;
    target.parentNode.insertBefore(node.DOMNode, target);
    target.parentNode.removeChild(target);
    node.transclude = undefined;
}

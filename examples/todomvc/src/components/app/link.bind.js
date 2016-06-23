import {Bind} from 'windsock';

export default new Bind((node, binding)=>{
    let target = binding.target || binding,
        path = `#/${target.parent[target.key]}`;

    if(node.attributes.href === path){
        node.class.add('selected');
    }else{
        node.class.remove('selected');
    }
    return {
        node: node,
        prop: 'class'
    };
});
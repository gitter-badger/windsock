import {Bind} from 'windsock';

export default new Bind((node, binding)=>{
    let target = binding.target || binding,
        path = `#/${target.parent[target.key]}`;

    if(node.attributes.href === path){
        if(node.compiled){
            if(!node.attributes.class){
                node.attributes.add('class', 'selected');
                return;
            }
        }
        node.attributes.class = 'selected';
    }else{
        if(node.compiled){
            if(node.attributes.class){
                node.attributes.delete('class');
            }
        }else{
            if(node.attributes.class){
                delete node.attributes.class;
            }
        }
    }
    return {
        node: node,
        prop: 'class'
    };
});
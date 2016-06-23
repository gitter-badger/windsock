import {Bind} from 'windsock';

export default new Bind((node, binding)=>{
    let target = binding.target || binding;
    node.children[0].text = target.parent[target.key];
});
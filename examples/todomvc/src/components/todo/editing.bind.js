import {Bind} from 'windsock';

export default new Bind({
    bind:(node)=>{
        return {
            node: node,
            prop: 'class'
        };
    },
    update:(node, binding)=>{
        if(binding.target.parent[binding.target.key] === node.todo){
            node.class.add('editing');
            if(node.compiled){
                setTimeout(()=>{
                    node.find({class:'edit'}).DOMNode.focus();
                }, 10);
            }
        }else{
            node.class.remove('editing');
        }
    }
});
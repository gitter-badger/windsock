import Transform from '../transform';

export default class IfTransform extends Transform{
    constructor(){
        super();
        this.bind.add((node, value)=>{
            let parent,
                index;
            if(!!value === false && node.parent){
                parent = node.parent;
                node.index = parent.children.indexOf(node);
                node.remove();
                node.parent = parent;
            }
        });
        this.update.add((node, record)=>{
            let parent,
                index;
            if(record.newValue !== record.oldValue && node.parent){
                if(!!record.newValue){
                    node.parent.insert(node, node.index);
                }else{
                    parent = node.parent;
                    node.index = parent.children.indexOf(node);
                    node.remove();
                    node.parent = parent;
                }
            }
        });
    }
}

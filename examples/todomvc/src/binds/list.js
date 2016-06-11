import {Bind} from 'windsock';

export default class List extends Bind{
    constructor(Item){
        super({
            bind: (parent, target)=>{
                let item;
                target.value.forEach((data)=>{
                    item = new this.Item({
                        root: false
                    }, data);
                    parent.append(item.render());
                });
                return{
                    node: parent,
                    prop: 'children'
                };
            },
            update: (parent, binding, mutation)=>{
                let item;
                switch (mutation.method) {
                    case 'push':
                        item = new this.Item({
                            root: false
                        }, mutation.newValue[0], parent.children.length);
                        parent.append(item.render(parent.compiled));
                        break;
                    case 'splice':
                        parent.children.splice(mutation.args[0], mutation.args[1]);
                        break;
                }
            }
        });
        this.Item = Item;
    }
}
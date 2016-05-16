import Signal from './signal';

export default class Store{
    constructor(state = {}, mutations = {}, post){
        this.state = state;
        this.mutations = {};
        this.post = post;
        Object.keys(mutations)
            .forEach((name)=>{
                this.mutations[name] = new Signal();
                this.mutations[name].add(mutations[name]);
            });
    }
    dispatch(...args){
        let name = args.shift(),
            mutation = this.mutations[name];
        if(!mutation){
            throw new Error(`${name} mutation does not exist`);
        }
        mutation.dispatch.apply(mutation, [this.state, ...args]);
        this.post && this.post(name, this.state, ...args);
    }
}

import Signal from './signal';
export default class Store{
    constructor(state = {}, mutations = {}){
        this._state = state;
        this._mutations = {};
        Object.keys(mutations)
            .forEach((name)=>{
                this._mutations[name] = new Signal();
                this._mutations[name].add(mutations[name]);
            });
    }
    dispatch(name, ...args){
        let mutation = this._mutations[name];
        if(!mutation){
            throw new Error(`${name} mutation does not exist`);
        }
        mutation.dispatch(this.state, args);
    }
}

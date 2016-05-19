import Conditional from '../../../binds/conditional';

export default new Conditional((node, target)=>{
    return target.parent[target.key].length;
});
import Conditional from '../../../binds/conditional';
import state from '../../../core/state';

export default new Conditional((node)=>{
    switch (state.route) {
        case '':
            return true;
            break;
        case 'active':
            return !node.class.contains('completed');
            break;
        case 'completed':
            return node.class.contains('completed');
    }
});
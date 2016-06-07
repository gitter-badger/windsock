import App from './components/app/app';
import store from './core/store';
import {router} from 'windsock';

const app = new App();

router.register('');
router.register('active');
router.register('completed');

router.start({
    otherwise: '',
    post: (req)=>{
        store.dispatch('route', req.resolved);
    }
});
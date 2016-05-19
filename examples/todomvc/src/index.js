import App from './components/app/app';
import store from './core/store';
import {router} from 'windsock';

const app = new App();

router.register('#', {
    activate: function(){
        store.dispatch('route', '');
    }
});
router.register('#/active', {
    activate: function() {
        store.dispatch('route', 'active');
    }
});
router.register('#/completed', {
    activate: function() {
        store.dispatch('route', 'completed');
    }
});

router.start();
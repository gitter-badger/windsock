var Windsock = require('../src/windsock');
var assert = require('assert');

//windsock.bindings.add('h1', {view:, model:})
//windsock.bindings.push({view:, model:})
//if no binding function is specified use a default mutation observer to batch modification to view
//windsock.bindings.h1.view = '.new-class-selector'
//windsock.bindings.h1.model = 'secondaryTitle'
//windsock.bindings[0].bind = function(){}
//windsock.bindings = {
//     h1:{
//         view:'query',
//         _view: windsock.view ref,
//         model:'query',
//         _model: windsock.model ref,
//         bind: fn,
//         _bind:
//     }
// }
//changing this binding value will kick off ...

//windsock.model = {} || []
//changing the model value will kick off initial binding

//windsock.view = '<html/>', ['html'], documentElement
//transform and kick off binding

//in init -> last thing u do is set model value which kicks of watchers to modify view


describe('Windsock', function () {

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof Windsock, 'undefined');

    });

    it('should do this', function(){

        var windsock = new Windsock({
            view: '<p>some text</p>',
            model: {
                other: 'text'
            }
        });



    });

});

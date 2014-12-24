var util = require('../util'),
    Node = require('./node'),
    Text = require('./text'),
    each = util.each,
    extend = util.extend,
    inherit = util.inherit;

function Fragment(value){

    Node.call(this, extend({

        children: []

    }, value));

    // Object.defineProperties(this._value.children, {
    //
    //     observe: {
    //         value: function(fn){
    //             if(!this._observer){
    //                 this._observer = Observer.observe(this, false, fn);
    //             }else{
    //                 this._observer
    //             }
    //         }
    //     }
    //
    // });

    //move this and observers for jsonml off to an extension
    if(this._value.children.length){

        //faster than concat and Array.p.push.apply
        for(var i = 0, l = this._value.children.length; i < l; i++){

            this._jsonml.push(this._value.children[i]);

        }

    }

    // Observer.observe(this._value.children, false)
    //         .observers.add(function(mutation){
    //
    //             Array.prototype[mutation.type].apply(this._jsonml, mutation.transformed);
    //
    //         }, this);

}

inherit(Fragment, Node, {

    children:{

        get: function(){

            return this._value.children;

        },

        set: function(children){

            this._value.children = children;

        },

        enumerable: true

    },

    text:{

        get: function(){

            return this.find(function(child){

                return child instanceof Text;

            }).join('');

        },

        set: function(value){

            if(this.text.length){

                var textNodes = this.find(function(child){

                    return child instanceof Text;

                });

                each(textNodes, function(text, i){

                    if(i === 0){

                        text.value = value;

                    }else{

                        text.remove();

                    }

                });

            }else{

                this.append(new Text(value));

            }

        },

        enumerable: true

    }

});

module.exports = Fragment;

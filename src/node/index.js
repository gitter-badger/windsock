var Text = require('./text'),
    Element = require('./element');

//node factory
module.exports = {

    text: function(value){

        return new Text({value: value});

    },

    element: function(name, attributes){

        if(!name) throw new Error('failed to create element, name required');

        return new Element({

            name: name,

            attributes: attributes || {}

        });

    }

};

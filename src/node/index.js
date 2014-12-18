var Text = require('./text'),
    Element = require('./element');

//factory for creating nodes
//normalize params to value objects
module.exports = {

    text: function(value){

        //text node value object is just a string :)
        return new Text(value);

    },

    element: function(name, attributes, children){

        if(!name) throw new Error('failed to create element, name required');

        return new Element({

            name: name,

            attributes: attributes,

            children: children

        });

    }

};
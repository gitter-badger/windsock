var Text = require('./text'),
    Element = require('./element');

module.exports = {
    text: function(value){
        return new Text(value);
    },
    element: function(name){
        if(!name) throw new Error('failed to create element, name required');
        return new Element([name].concat(Array.prototype.slice.call(arguments, 1)));
    }
};

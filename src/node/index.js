var Text = require('./text'),
    Fragment = require('./fragment'),
    Element = require('./element');

exports.text = function text(value){
    return new Text({value: value || ''});
};

exports.element = function element(name, attributes, empty){
    return new Element({
        name: name || 'div',
        attributes: attributes || {},
        empty: empty || false
    });
};

exports.fragment = function fragment(){
    return new Fragment();
};

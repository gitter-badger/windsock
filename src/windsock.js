'use strict';

var util = require('./util'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;

var parser = new Parser();

function Windsock(options){

    //1. Data
    this.data = Observer.observe(options.data);

    //2. Markup

}

Windsock.prototype = {};

module.exports = Windsock;

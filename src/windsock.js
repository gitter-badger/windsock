'use strict';

var util = require('./util'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;

var builder = {
    html:{
        start:function(){}
    }
};

var parser = new Parser();

each(Parser.signals, function(signal){

    //for each builder add its listener
    parser[signal].add();

});

function Windsock(options){

    //1. Data
    this.data = Observer.observe(options.data);

    //2. Markup

}

Windsock.prototype = {};

module.exports = Windsock;

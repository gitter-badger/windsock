var util = require('./util'),
    extend = util.extend;

function Directive(){
    //e.g. fragmentNode of a few li's ['li'], ['li'], ['li']
    //model [1,2,3]
}

Directive.extend = function(directive){

    var e = directive.prototype.constructor;
    e.prototype = extend(Object.create(Directive.prototype), directive.prototype);
    return e;

};

Directive.prototype.init = function(view, model){

    this.view = view;
    this.model = model;

};

Directive.prototype.update = function(mutation){

    //called when model changes
    //normalizes mutation and invokes callbacks accordingly


};

Directive.prototype.bind = function(){

    //called once
    this.model._observers.add(this.update, this);

};

Directive.prototype.destroy = function(){

    this.model._observers.remove();

};

module.exports = Directive;

var util = require('./util'),
    Node = require('./node'),
    Parser = require('./parser'),
    each = util.each,
    is = util.is;

function View(obj){

    this._node = null;
    if(obj) this.parse(obj);

}

View.prototype.parse = function(obj){

    var parser = new Parser,
        active,
        parent;

    active = this._node = Node.fragment();

    parser.start.add(function(node){

        node = Node.element(node);

        if(active.children){

            active.children.append(node);

        }else{

            active.append(node);

        }

        parent = active;

        active = active[active.length - 1];

    });

    parser.content.add(function(text){

        if(active.children){

            active.children.append(text);

        }else{

            active.append(text);

        }

    });

    parser.end.add(function(node, isVoid){

        if(isVoid){

            node = Node.element(node);

            if(active.children){

                active.children.append(node);

            }else{

                active.append(node);

            }

        }else{

            active = parent;

        }

    });

    parser.done.add(function(){

        parser.reset();
        parser = null;

    });

    parser.parse(obj);

};

View.prototype.html = function(){

    if(!this._node) return;

    var html = [],
        parser = new Parser;

    parser.start.add(function(node){

        html.push('<' + node.name);

        if(node.attributes){

            each(node.attributes, function(key, value){

                if(value) value = '="' + value + '"';
                html.push(' ' + key + value);

            });

        }

        html.push('>');

    });

    parser.content.add(function(text){

        html.push(text);

    });

    parser.end.add(function(node, isVoid){

        if(isVoid){

            html.push('<' + node.name);

            if(node.attributes){

                each(node.attributes, function(key, value){

                    if(value) value = '="' + value + '"';
                    html.push(' ' + key + value);

                });

            }

            html.push('/>');

        }else{

            html.push('</' + node.name + '>');

        }

    });

    parser.parse(this._node);

    return html.join('');

};

View.prototype.json = function(){

    if(!this._node) return;

    return JSON.stringify(this._node);

};

View.prototype.find = function(query, target){

    var self = this, result = [];

    target = target || this._node;

    if(is(query, 'object')){

        each(target, function viewFind(element){

            var match = true;

            if(!element.attributes) return;

            each(query, function(value, key, q, halt){

                if(!element.attributes[key] || element.attributes[key] !== value){

                    match = false;
                    return halt;

                }

            });

            if(match) result.push(element);

            if(element.children.length){

                result = result.concat(self.find(query, element.children));

            }

        });

    }

    return result;

};

module.exports = View;

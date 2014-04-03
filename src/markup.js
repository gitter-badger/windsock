(function(){

    'use strict';

    var Parser = require('./parser'),
        Signals = require('./signals'),
        util = require('./util'),
        is = util.is,
        each = util.each,
        merge = util.merge,
        extend = util.extend,
        traverse = util.traverse;

    //jsonml manip and traversal
    function Markup(obj, options){

        merge(this.options, options);

        this._selection = this._jsonml = [];

        var parser = new Parser(this.options.parser);

        var parseSignal = Signals.Signal.extend({

            markup: this

        }, function(fn){ this._signal = fn; });

        var tagsig = new parseSignal(function(tag, voidTag){

            //called for both start tag and end tag events
            if(voidTag || typeof voidTag === 'undefined'){

                if(voidTag){

                    this.markup.append(tag);

                }else{

                    this.markup.insert(tag);

                }

            }else{

                // voidtag is defined and false, close and set selection to parent
                this.markup.parent();

            }

        });

        var endtag

        var contentsig = new parseSignal(function(content){

            if(content.length){

                this.markup.append(content);

            }

        });

        parser.start.add(tagsig);
        parser.content.add(contentsig);
        parser.end.add(tagsig);

        parser.parse(obj);

    }

    Markup.prototype.options = {

        parser : {

            async: false,
            flowing: true

        }

    };

    //jsonml
    Markup.prototype.each = function(fn){

        var args = Array.prototype.slice(arguments, 1);

        each.apply(this, [this._selection, fn].concat(args));

        return this;

    };

    Markup.prototype.traverse = function(fn, selection){

        selection = selection || this._selection;

        traverse.call(this, selection, fn);

        return this;

    };

    Markup.prototype.append = function(obj){

        this._selection.push(this.convert(obj));

    };

    //wrap for splice, optionally sets selection
    Markup.prototype.insert = function(obj, i){

        var jsonml = is(obj, 'object') ? this.convert(obj) : obj,
            index = 0;

        //i should be greater than 1 if selection has attributes
        if(i && i > 0){

            Array.prototype.splice.call(this._selection, i, 0, jsonml);
            index = this._selection.length - 1;

        }else{

            index = Array.prototype.push.call(this._selection, jsonml) - 1;

        }

        if(is(jsonml, 'array')) {

            //if an array and not text node set active selection
            this._selection = this._selection[index];

        }

        return this;

    };

    //for now just simple convert object literal tojsonml
    Markup.prototype.convert = function(obj){

        if(is(obj, 'string') || is(obj, 'array')) return obj;

        var jsonml = [];

        jsonml[0] = obj.nodeName;

        if(obj.attributes && !util.isEmpty(obj.attributes)) jsonml[1] = obj.attributes;

        // each(obj, function(val, key){

        //     util.set(jsonml, key, {
        //         value: val,
        //         writable: true,
        //         enumerable: false
        //     });

        // });

        return jsonml;

    };

    //markup.find('tag name')
    //markup.find('attr name', 'attr value')
    //markup.find({nodeName: 'h1', class: 'someClass'})
    //all of these methods return a new instance of markup with exception of
    //markup.find() sets current selection to entire object
    //markup.find(int) sets current selection to index
    Markup.prototype.find = function(query){

        if(is(query, 'number')) {
            this._selection = this._selection[query];
            return this;
        }

        if(!query) {
            this._selection = this._jsonml;
            return this;
        }

        var args = Array.prototype.slice.call(arguments);

        var queryObject = {
            nodeName:'',
            attributes: {}
        };

        if(args.length > 1){

            queryObject.attributes[args[0]] = queryObject.attributes[args[1]];

        }else if(is(query, 'string')){

            //traverse just tag names
            queryObject.nodeName = query;

        }else if(is(query, 'object')){

            //match all props
            extend(queryObject, query);

        }

        //['div','asd']
        //['br']
        //['asd',['div',{}, 'asd'],'asd',['br']]
        var match = new Markup();

        this.traverse(function(val, index, node, exit){

            if(index > 0 || is(node, 'object')) return; //skip anything past tagname

            console.log('matching');
            console.log(node);
            console.log(queryObject);

            if(queryObject.nodeName.length){

                if(node[0] !== queryObject.nodeName) return;

            }

            if(!util.isEmpty(queryObject.attributes)){

                if(!is(node[1], 'object')) return;

                if(util.match(node[1], queryObject)) {

                    match.append(node);//append parent which might have kids
                    console.log('match');

                }

            }else{

                match.append(node);
                console.log('match');

            }


        }, this._jsonml);

        if(match._jsonml.length) return match;

        return this;

    };

    Markup.prototype.replace = function(v){

        this._selection = v;
        return this;

    };

    //returns flat list of children
    Markup.prototype.children = function(selection, qualifier){

        selection = selection || this._selection;

        qualifier = qualifier || function(){return true;};

        var sweetChidrens = [];

        each(selection, function(child){

            if(is(child, 'array') && qualifier.call(this, child)){

                sweetChidrens.push(child);

            }

        }, this);

        return new Markup(sweetChidrens, this.options);

    };

    //sets selection to parent of selection
    Markup.prototype.parent = function(){

        this.traverse(function(node, index, parent, exit){

            if(index > 0) return; //skip anything past tagname

            var match = this.children(parent, function(child){

                if(child == this._selection) return true;
                return false;

            });

            if(match._jsonml.length){

                this._selection = parent;
                return exit;

            }

        }, this._jsonml);

        return this;

    };

    Markup.prototype.jsonml = function(){

        return this._jsonml;

    };

    module.exports = Markup;

})();

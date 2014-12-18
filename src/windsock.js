var util = require('./util'),
    node = require('./node'),
    parser = require('./parser'),
    compiler = require('./compiler'),
    each = util.each,
    is = util.is;

function attributesToString(attr){

    var attribute = '';

    for(var key in attr){

        attribute += ' ' + key;

        if(attr[key]) attribute+= '="' + attr[key] + '"';

    }

    return attribute;

}

var windsock = {

    util: util,

    parse: function(source){

        //retain real document node if exists

        var method, parsed, parent;

        if(is(source, 'string')){

            method = parser.parseHTML;

        }else if(source.nodeName){

            if(source.parentNode) parent = source.parentNode;
            method = parser.parseDOM;

        }else{

            method = parser.parseJSONML;

        }

        method(source, function(e){

            var n;

            switch(e.type){

                case 'text':

                    parsed.append(node.text(e.value));

                break;

                case 'start':

                    n = node.element(e.name, e.attributes);
                    if(parsed) parsed.append(n);
                    parsed = n;

                break;

                case 'end':

                    if(e.void){

                        parsed.append(node.element(e.name, e.attributes));

                    }else{

                        if(parsed.parent) parsed = parsed.parent;

                    }

                break;

            }

            n = null;

        });

        if(parent) parsed._parentDocumentNode = parent;

        return parsed;

    },

    compile: function(node){

        var fragment = node.fragment();
        compiler.compile(fragment);
        // parser.parseNode(node, function(){
        //     //build fragment
        //     //observe and batch
        // });
        return fragment;

    },

    render: function(node){

        //optionally clone?
        return compiler.transclude(node);

    },

    jsonml: function(node){

        return JSON.stringify(node);

    },

    html: function(node){

        var html = [];

        parser.parseJSONML(node._jsonml, function(e){

            switch(e.type){

                case 'text':

                    html.push(e.value);

                break;

                case 'start':

                    html.push('<' + e.name + attributesToString(e.attributes) + '>');

                break;

                case 'end':

                    if(e.void){

                        html.push('<' + e.name + attributesToString(e.attributes) + '/>');

                    }else{

                        html.push('</' + e.name + '>');

                    }

                break;

            }

        });

        return html.join('');

    }

};

windsock.node = node;

module.exports = windsock;

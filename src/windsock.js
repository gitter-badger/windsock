var node = require('./node'),
    parser = require('./parser');

function attributesToString(attr){

    var attribute = '';

    for(var key in attr){

        attribute += ' ' + key;

        if(attr[key]) attribute+= '="' + attr[key] + '"';

    }

    return attribute;

}

var windsock = {

    parse: function(source){

    },
    compile: function(){},
    render: function(){},
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

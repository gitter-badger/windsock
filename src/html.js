var parseJSONML = require('./parser').parseJSONML;

module.exports = function (node){

    if(!node || !node._jsonml.length) return '';

    var html = [];

    parseJSONML(JSON.parse(node.toString()), function(e){

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

};

function attributesToString(attr){

    var attribute = '';

    for(var key in attr){

        attribute += ' ' + key;

        if(attr[key]) attribute+= '="' + attr[key] + '"';

    }

    return attribute;

}

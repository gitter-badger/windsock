function attributes(attr){

    var attribute = '';

    for(var key in attr){

        attribute += ' ' + key;

        if(attr[key]) attribute+= '="' + attr[key] + '"';

    }

    return attribute;

}

module.exports = {

    start: function(node){

        this.html.push('<' + node.name + attributes(node.attributes) + '>');

    },

    content: function(text){

        this.html.push(text.value);

    },

    end: function(node, isVoid){

        if(isVoid){

            this.html.push('<' + node.name + attributes(node.attributes) + '/>');

        }else{

            this.html.push('</' + node.name + '>');

        }

    }

};

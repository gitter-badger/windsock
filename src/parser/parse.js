var is = require('../util').is,
    node = require('../node'),
    parser = require('./index');

module.exports = function parse(source){
    //parse jsonml array, html string, or document element
    var parseMethod,
        template = node.element('template'),
        clone;

    if(is(source, 'string')){
        parseMethod = parser.parseHTML;
    }else if(source.nodeName){
        if(document.contains(source)){

            template._transclude = source; //retain for transcluding
            clone = source.cloneNode(true); //going to be doing some heavy reads... not a noticeable perf diff

        }

        parseMethod = parser.parseDOM;

    }else{
        parseMethod = parser.parseJSONML;
    }
    parseMethod(clone || source, function(e){
        switch(e.type){
            case 'text':
                template.append(node.text(e.value));
            break;
            case 'start':
                template.append(node.element(e.name, e.attributes));
                template = template.children[template.children.length - 1];
            break;
            case 'end':
                if(e.void){
                    template.append(node.element(e.name, e.attributes));
                }else{
                    if(template.parent) template = template.parent;
                }
            break;
        }
    });
    source = null;
    return template;
};

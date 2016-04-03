import {is} from '../util';
import {Text, Fragment, Element} from '../vdom/index';
import * as parser from './index';

export default function parse(source){
    var template = new Fragment(),
        transclude;
    if(is(source, 'string')){
        parser.parseHTML(source, callback);
    }else if(source.nodeName){
        if(document.contains(source)){
            transclude = source;
            parser.parseDOM(source.cloneNode(true), callback);
        }else{
            parser.parseDOM(source, callback);
        }
    }else{
        parser.parseJSONML(source, callback);
    }
    function callback(evt){
        var element;
        switch(evt.type){
            case 'text':
                template.append(new Text(evt.value));
            break;
            case 'start':
                element = new Element(evt.name, evt.attributes);
                template.append(element);
                template = element;
            break;
            case 'end':
                if(evt.void){
                    element = new Element(evt.name, evt.attributes, evt.void);
                    template.append(element);
                }else{
                    if(template.parent){
                        template = template.parent;
                    }
                }
            break;
        }
    }
    template = template.children.length === 1 ? template.children[0] : template;
    template.transclude = transclude;
    return template;
}

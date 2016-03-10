export function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function is(target, type){
    switch(type){
        case 'empty':
            return Object.keys(target).length === 0;
        case 'undefined':
            return typeof target === 'undefined';
        case 'null':
            return target === null;
        default:
            return Object.prototype.toString.call(target) === '[object ' + capitalize(type) + ']';
    }
}

export function noop(){}

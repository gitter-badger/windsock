var paint,
    cancelPaint,
    tick = (typeof process !== 'undefined' && process.nextTick) ? process.nextTick : setTimeout;

if(typeof window !== 'undefined' && window.requestAnimationFrame){
    paint = window.requestAnimationFrame;
    cancelPaint = window.cancelAnimationFrame;
}else{
    paint = setTimeout;
    cancelPaint = clearTimeout;
}

export {
    paint,
    cancelPaint,
    tick
}

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

export function extend(obj){
    for(let i = 1, l = arguments.length; i < l; i++){
        //enumerable including prototype
        for(let key in arguments[i]){
            obj[key] = arguments[i][key];
        }
    }
    return obj;
}

export function merge(obj){
    for(let i = 1, l = arguments.length; i < l; i++){
        for(let key in arguments[i]){
            if(obj[key]){
                obj[key] = arguments[i][key];
            }
        }
    }
    return obj;
}

export function clone(obj){
    var clone = {};
    Object.keys(obj)
        .forEach((key)=>{
            clone[key] = is(obj[key], 'object') ? clone(obj[key]) : obj[key];
        });
    return clone;
}

export function match(target, query){
    for(var key in  query){
        if(target[key] !== query[key]){
            return false;
        }
    }
    return true;
}

export function noop(){}

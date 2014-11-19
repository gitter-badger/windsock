require.module = Object.create(null);

function registerFormat(path){
    return path.replace(/\//g,'');
}

function require(path, register){

    if(register){

        require.module[registerFormat(path)] = register;

        return;

    }

    var module = Object.create(null),
        exports = module.exports = Object.create(null);


    path = path.replace(/[\/.]/g, '');

    if(require.module[path]){

        require.module[path].call(this, module, exports);

    }else{

        throw new Error('failed to resolve module path: ' + path);

    }

    return module.exports;

}

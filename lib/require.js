require.module = Object.create(null);

function require(path, register){

    if(register){

        require.module[path] = register;

        return;

    }

    var module = Object.create(null);

    path = path.replace('./', '');

    if(require.module[path]){

        require.module[path].call(this, module);

    }else{

        throw new Error('failed to resolve module path: ' + path);

    }

    return module.exports;

}

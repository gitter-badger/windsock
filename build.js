var fs = require('fs'),
    rollup = require('rollup'),
    babel = require('rollup-plugin-babel'),
    uglify = require('uglify-js')
    version = process.env.VERSION;

if(version){
    var index = fs.readFileSync('src/index.js', 'utf-8')
        .replace(/version:'[\d\.]+'/, "version:'" + version + "'");
    fs.writeFileSync('src/index.js', index);
}

rollup.rollup({
        entry: 'src/index.js',
        plugins: [babel()]
    })
    .then(function(bundle){
        return bundle.write({
            format: 'cjs',
            dest: 'dist/windsock.common.js'
        });
    })
    .then(function(){
        return rollup.rollup({
                    entry: 'src/index.js',
                    plugins: [babel()]
                })
                .then(function(bundle){
                    var result = bundle.generate({
                        format: 'umd',
                        moduleName: 'windsock'
                    });
                    fs.writeFileSync('dist/windsock.js', result.code);
                    fs.writeFileSync('dist/windsock.min.js', uglify.minify(result.code,{
                        fromString: true,
                        output: {
                            ascii_only: true
                        }
                    }).code);
                });
    })
    .then(function(){
        return rollup.rollup({
                    entry: 'examples/todomvc/src/index.js',
                    plugins: [babel()]
                })
                .then(function(bundle){
                    var result = bundle.generate({
                        format: 'umd',
                        moduleName: 'app'
                    });
                    fs.writeFileSync('examples/todomvc/bundle.js', result.code);
                });
    })
    .then(function(){
        return rollup.rollup({
                    entry: 'examples/tldr/src/index.js',
                    plugins: [babel()]
                })
                .then(function(bundle){
                    var result = bundle.generate({
                        format: 'umd',
                        moduleName: 'app'
                    });
                    fs.writeFileSync('examples/tldr/bundle.js', result.code);
                });
    })
    .catch(function(e){
        console.log(e);
    });

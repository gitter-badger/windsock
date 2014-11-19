var fs = require('fs'),
    map = require('map-stream'),
    spawn = require('child_process').spawn,
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    package = require('./package.json');

function reg(){
    return map(function(file, cb){
        file.contents = Buffer.concat([
                new Buffer("require('" + file.relative.replace('.js','') + "', function(module, exports){\n" ),
                new Buffer(file.contents),
                new Buffer('\n});')
            ]);
        cb(null, file);
    });
}

function req(){
    return map(function(file, cb){
        file.contents = Buffer.concat([fs.readFileSync('./lib/require.js'), new Buffer(file.contents)]);
        cb(null, file);
    });
}

function iffy(){
    return map(function(file, cb){
        file.contents = Buffer.concat([
                new Buffer("//windsock.js version " + package.version + "\n(function(){\n'use strict';\n" ),
                new Buffer(file.contents),
                new Buffer("\nwindow.Windsock = require('windsock');})();")
            ]);
        cb(null, file);
    });
}

gulp.task('concat', function(){
    gulp.src(['./src/**/*.js','!_*'])
        .pipe(reg())
        .pipe(concat('windsock.js'))
        .pipe(req())
        .pipe(iffy())
        .pipe(gulp.dest('./dist/'))
        .pipe(rename('windsock.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['concat'], function(){
    gulp.watch(['./src/**/*.js', './lib/*.js'], function(){
        gulp.run('concat');
    });
});

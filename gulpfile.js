var gulp = require('gulp'),
    gutil = require('gulp-util'),
    mocha = require('gulp-mocha'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify')
    docco = require('gulp-docco');

var paths = {

    tests: ['./test/*.js'],

    src: [
        './src/config.js',
        './src/util.js',
        './src/signals.js',
        './src/parser.js',
        './src/data.js',
        './src/markup.js',
        './src/windsock.js'
    ]

};

gulp.task('docs', function(){

    gulp.src('./client/windsock.js')
        .pipe(docco())
        .pipe(gulp.dest('./docs'));

});

gulp.task('build', function() {

    gulp.src('./src/*.js')

        .pipe(watch(function(files){

            return gulp.src(paths.src)
                        .pipe(concat('windsock.js'))
                        .pipe(gulp.dest('./client'))
                        .pipe(rename('windsock.min.js'))
                        .pipe(uglify())
                        .pipe(gulp.dest('./client'));

        }));

});

gulp.task('test', function(){

    gulp.src(paths.tests)
        .pipe(mocha());

});

gulp.task('default', ['build','docs']);

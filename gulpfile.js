var gulp = require('gulp'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    coverage = require('gulp-coverage');

gulp.task('concat', function(){
    gulp.src('./src/*.js')
        .pipe(concat('windsock.js'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('test', function () {
    return gulp.src(['./test/*.js'], { read: false })
        .pipe(coverage.instrument({
            pattern: ['./src/*'],
            debugDirectory: '.coverdata'
        }))
        .pipe(mocha())
        .pipe(coverage.report({
            outFile: '.coverdata/coverage.html'
        }));
});

gulp.task('default', ['concat'], function(){
    gulp.watch('./src/*.js', function(){
        gulp.run('concat');
    });
});

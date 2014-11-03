var gulp = require('gulp'),
    concat = require('gulp-concat');

gulp.task('concat', function(){
    gulp.src('./src/*.js')
        .pipe(concat('windsock.js'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('default', ['concat'], function(){
    gulp.watch('./src/*.js', function(){
        gulp.run('concat');
    });
});

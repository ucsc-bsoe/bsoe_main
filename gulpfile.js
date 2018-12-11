var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    sassLint = require('gulp-sass-lint'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    stripCssComments = require('gulp-strip-css-comments'),
    eslint = require('gulp-eslint'),
    watch = require('gulp-watch');

var options = {
    eslint: {
        files: [
            './components/**/*.js'
        ]
    },
    sassLint: {
        // maxBuffer default is 300 * 1024
        'maxBuffer': 1000 * 1024,
        rules: {
            'class-name-format': 0,
            'empty-args': 0,
            'empty-line-between-blocks': 0,
            'force-element-nesting': 0,
            'nesting-depth': 0,
            'no-vendor-prefixes': 0,
            'property-sort-order': 0,
            'no-css-comments': 0,
            'no-important': 0,
            'one-declaration-per-line': 0,
            'force-pseudo-nesting': 0,
            'no-qualifying-elements': 0
        },
        'config': '.scss-lint.yml'
    },
    uglify: {
        compress: {
            unused: false
        }
    },
    sass: {
        files: [
            './components/mixins.scss',
            './components/variables.scss',
            './components/normalize.scss',
            './components/**/*.scss'
        ]
    },
    concat: {
        files: [
            './components/**/*.js'
        ]
    }
};

// JS Tasks
gulp.task('js-watch', function() {
    gulp.src(options.concat.files)
        .pipe(concat('script.js'))
        .pipe(gulp.dest('./min'))
        .pipe(uglify(options.uglify))
        .pipe(gulp.dest('./min'));
});

// Sass Tasks
gulp.task('sass-watch', function() {
    gulp.src(options.sass.files)
        .pipe(concat('styles.css'))
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(stripCssComments({preserve: false}))
        .pipe(cssmin())
        .pipe(gulp.dest('./min'));
});

gulp.task('sass-watch-lint', function() {
    gulp.src(options.sass.files)
        .pipe(sassLint(options.sassLint))
        .pipe(sassLint.format())
        .pipe(sourcemaps.init())
        .pipe(sass(options.sass).on('error', sass.logError))
        .pipe(stripCssComments({preserve: false}))
        .pipe(concat('styles.css'))
        .pipe(cssmin())
        .pipe(gulp.dest('./min'));
});

gulp.task('default', function() {
    gulp.watch(options.sass.files, ['sass-watch']);
    gulp.watch('./components/**/*.js', ['js-watch']);
});
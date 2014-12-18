/**
 * @file
 * Gulpfile that contains test, build, and deploy scripts.
 */
/* globals require */

var gulp = require('gulp'),
    prompt = require('gulp-prompt'),
    shell = require('gulp-shell'),
    phpcs = require('gulp-phpcs'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs');

// Linting/jscs
gulp.task('jscs', function () {
  return gulp.src([
    'modules/**/*.js',
    'themes/**/*.js',
    'gulpfile.js'
    '!modules/**/*.min.js',
    '!themes/**/*.min.js',
  ])
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(jscs());
});

// PHPcs
gulp.task('phpcs', function () {
  return gulp.src([
    'modules/**/*.php',
    'modules/**/*.module',
    'modules/**/*.inc',
    'themes/**/*.php',
  ])
  .pipe(phpcs({
    bin: '/usr/local/bin/phpcs',
    standard: 'PSR2',
    warningSeverity: 0
  }))
  .pipe(phpcs.reporter('log'));
});

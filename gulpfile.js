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

/**
 * Coding Standards
 * The following code provides two tasks, one for ensuring JavaScript code
 * quality, and the other for ensuring PHP code quality.
 *
 * @task jscs
 *   Runs JSCS and JSLint on module, theme, and gulp files. Excludes all
 *   minified JavaScript files.
 *
 * @task phpcs
 *   Runs PHPCS on all module and theme PHP. PHP bin set to the
 *   /usr/local/bin/phpcs exe by default, but should be updated to 
 *   wherever your phpcs exe is located.
 */
// JavaScript Coding Standards.
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

// PHP Coding Standards.
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

/**
 * Build
 * The following code provides tasks that build a project directory, and zip
 * it up into a portable file.
 *
 * @task build
 *   Builds a Drupal site, executes construction commands, and constructs
 *   Drupal site root.
 *
 * @task package
 *   Runs a build, and packages the output.
 */

/**
 * Deploy
 *
 * @task deploy
 *   Builds, packages, and then deployes.
 */

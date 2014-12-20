/**
 * @file
 * Gulpfile that contains test, build, and deploy scripts.
 *
 * Update the project_name variable to change the build, package, and message
 * name of the current project. Defaults to 'Drupal'.
 */
/* globals require */

var gulp = require('gulp'),
    prompt = require('gulp-prompt'),
    shell = require('gulp-shell'),
    phpcs = require('gulp-phpcs'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    merge = require('merge-stream'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    options = require('minimist')(process.argv.slice(2));

/**
 * Coding Standards
 * The following code provides two tasks, one for ensuring JavaScript code
 * quality, and the other for ensuring PHP code quality.
 *
 * @task jscs
 *   Runs JSCS and JSLint on module, theme, and gulp files. Excludes all
 *   minified JavaScript files.
 */
gulp.task('jscs', function () {
  return gulp.src([
    'modules/**/*.js',
    'themes/**/*.js',
    'gulpfile.js',
    '!modules/**/*.min.js',
    '!themes/**/*.min.js'
  ])
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(jscs());
});

/**
 * @task phpcs
 *   Runs PHPCS on all module and theme PHP. PHP bin set to the
 *   /usr/local/bin/phpcs exe by default, but should be updated to
 *   wherever your phpcs exe is located.
 */
gulp.task('phpcs', function () {
  return gulp.src([
    'modules/**/*.php',
    'modules/**/*.module',
    'modules/**/*.inc',
    'themes/**/*.php'
  ])
  .pipe(phpcs({
    bin: '/usr/local/bin/phpcs',
    standard: 'PSR2',
    warningSeverity: 0
  }))
  .pipe(phpcs.reporter('log'))
  .pipe(phpcs.reporter('fail'));
});

/**
 * @task build
 * Constructs a Drupal site, executes construction commands, and builds a
 * functional Drupal site root.
 * 
 * @param string options.builddir
 *   Name of buidls subdirectory in which this project should be built.
 */
gulp.task('build', function() {
  if (!options.hasOwnProperty('builddir') || options.builddir.length <= 0) {
    throw new gutil.PluginError('build', 'You must pass in a --builddir setting.');
  }

  var builddir = 'builds/' + options.builddir;

  // Remove existing builddirs.
  var cleanBuildDir = gulp.src('builds/' + options.builddir)
  .pipe(clean());

  // Make the new (empty) directory.
  var makeBuildDir = gulp.src('drupal.make')
  .pipe(shell('mkdir ' + builddir))

  // Run drush make in the directory.
  var drushMake = gulp.src('drupal.make')
  .pipe(shell('cd ' + builddir + ' && drush make ../../drupal.make -y'));

  var settings = gulp.src('local.settings.php')
  .pipe(gulp.dest(builddir + '/sites/default'));

  return merge(cleanBuildDir, makeBuildDir, drushMake, settings);
});

/**
 * @task setup
 * Constructs a Drupal site, executes construction commands, and builds a
 * functional Drupal site root.
 */
gulp.task('setup', function() {
  var cleanworkdir = gulp.src([
    'builds/workdir/**/*',
    '!builds/workdir/README.md'
  ])
  .pipe(clean());

  var build = gulp.src('drupal.make').pipe(shell('gulp build --builddir workdir'));

  return merge(cleanworkdir, build);
});

/**
 * Deploy
 *
 * @task deploy
 *   Builds, packages, and then deployes.
 */

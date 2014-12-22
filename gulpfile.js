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
    del = require('del'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
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
gulp.task('build.setup', function() {
  if (!options.hasOwnProperty('builddir') || options.builddir.length <= 0) {
    throw new gutil.PluginError('build', 'You must pass in a --builddir setting.');
  }

  var builddir = 'builds/' + options.builddir;

  del([builddir]);

  return merge(
      gulp.src('drupal.make')
        .pipe(shell('mkdir -p ' + builddir))
        .pipe(shell('cd ' + builddir + ' && drush make ../../drupal.make -y')),
      gulp.src(['site.settings.php','local.settings.php'])
        .pipe(gulp.dest(builddir + '/sites/default'))
    );
});

gulp.task('build.template', ['build.setup'], function() {
  var builddir = 'builds/' + options.builddir;

  return merge(
      gulp.src('_src/db.settings.php')
        .pipe(template({
          'database' : {
            'name' : options.dbname,
            'user' : options.dbuser,
            'password' : options.dbpass
          }
        }))
        .pipe(gulp.dest(builddir + '/sites/default')),
      gulp.src(['local.settings.php'])
        .pipe(gulp.dest(builddir + '/sites/default')),
      gulp.src(['site.settings.php'])
        .pipe(rename('settings.php'))
        .pipe(gulp.dest(builddir + '/sites/default'))
    );
});

gulp.task('build.install', ['build.template'], function() {
  var builddir = 'builds/' + options.builddir;
  return gulp.src('')
          .pipe(shell('cd ' + builddir + '&& drush si -y --account-pass=admin && drush -y en master'))
          .pipe(shell('cd ' + builddir + '&& drush master-set-current-scope ' + options.scope + ' && drush -y master-execute'));
});

/**
 * @task setup
 * Constructs a Drupal site, executes construction commands, and builds a
 * functional Drupal site root.
 */
gulp.task('setup', function() {
  del([
    'builds/workdir/**/*',
    '!builds/workdir/README.md'
  ]);

  return gulp.src('drupal.make')
          .pipe(shell('gulp build --builddir workdir'));
});

/**
 * Deploy
 *
 * @task deploy
 *   Builds, packages, and then deployes.
 */

gulp.task('build', ['build.setup','build.template','build.install']);

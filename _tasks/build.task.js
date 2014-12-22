/**
 * @file
 * The following code defines build tasks for constructing a Drupal site.
 */
/* globals require */

var gulp = require('gulp'),
    shell = require('gulp-shell'),
    merge = require('merge-stream'),
    gutil = require('gulp-util'),
    del = require('del'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    options = require('minimist')(process.argv.slice(2));

/**
 * @task build
 * Constructs a Drupal site, executes construction commands, and builds a
 * functional Drupal site root.
 *
 * @param string options.builddir
 *   Name of subdirectory in which this project should be built.
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

/**
 * @task build.template
 *   Sets up Drupal settings/config files.
 *
 * @param string options.builddir
 *   Name of subdirectory in which this project should be built.
 * @param string options.dbname
 *   Name of database in which Drupal should be installed.
 * @param string options.dbuser
 *   Mysql user that Drupal should use.
 * @param string options.dbpass
 *   options.dbuser's password.
 */
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

/**
 * @task build.install
 *   Runs Drupal installation scripts.
 */
gulp.task('build.install', ['build.template'], function() {
  var builddir = 'builds/' + options.builddir;
  return gulp.src('')
          .pipe(shell('cd ' + builddir + '&& drush si -y --account-pass=admin && drush -y en master'))
          .pipe(shell('cd ' + builddir + '&& drush master-set-current-scope ' + options.scope + ' && drush -y master-execute'));
});

/**
 * @task setup
 *   Constructs a working Drupal site.
 */
gulp.task('setup', function() {
  del([
    'builds/workdir/**/*',
    '!builds/workdir/README.md'
  ]);

  return gulp.src('drupal.make')
          .pipe(shell('gulp build --builddir workdir'));
});

gulp.task('build', ['build.setup','build.template','build.install']);

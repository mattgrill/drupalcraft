var fs              = require('fs'),
    cp              = require('child_process'),
    Q               = require('Q'),
    request         = require('request'),
    debug           = require('debug')('drupalcraft:docker');

module.exports      = {
  wwwdir            : function (options) {
    var deferred        = Q.defer(),
        wwwdir          = '/tmp/docker/' + options.details.name;
    fs.mkdir(wwwdir, 0775, function (error) {
      if (error) {
        debug('Failed to create the directory, '+wwwdir);
        debug(error);
        deferred.reject(new Error(error));
      }
      debug('Created the directory, '+wwwdir);
      options.docker.wwwdir = wwwdir;
      deferred.resolve(options);
    });
    return deferred.promise;
  },
  checkout          : function (options) {
    var deferred        = Q.defer();

    options.docker.buildName      = (Math.random() + 1).toString(36).substring(14);

    cp.exec('git clone git@github.com:mattgrill/drupalcraft.git ' + options.docker.wwwdir, function (error, stdout, stderr) {
      if (error) {
        debug('Unable to clone to repository.');
        debug(error);
        deferred.reject(new Error(error));
      }
      debug('Clone of Drupalcraft repository completed.');
      cp.exec('cd ' + options.docker.wwwdir + ' && npm install', function (error, stdout, stderr) {
        if (error) {
          debug('Unable to run NPM install.');
          debug(error);
          deferred.reject(new Error(error));
        }
        debug('NPM install completed successfully.');
        cp.exec('cd ' + options.docker.wwwdir + ' && gulp build --builddir ' + options.docker.buildName + ' --dbname ' + options.details.name + ' --dbuser ' + options.details.user + ' --dbpass ' + options.details.pass + ' --scope local', function (error, stdout, stderr) {
          if (error) {
            debug('An issue occurred while running `gulp build`.');
            debug(error);
            deferred.reject(new Error(error));
          }
          debug('Gulp build completed successfully.');
          deferred.resolve(options);
        });
      })
    });
    return deferred.promise;
  },
  create            : function (options) {
    var deferred        = Q.defer(),
        containerInfo   = {
          'Env' : null,
          'Cmd' : [
            '/usr/bin/supervisord'
          ],
          'Image' : options.docker.iid,
          'NetworkDisabled' : false,
          'RestartPolicy' : { 'Name': 'always' },
          'ExposedPorts': { '80/tcp': {}, '22/tcp' : {} }
        };
    debug(containerInfo);
    request.post({
      'url'   : 'http://unix:/var/run/docker.sock:/containers/create?name=' + options.details.name,
      'body'  : JSON.stringify(containerInfo)
    }, function (error, response, body) {
      if (error) {
        deferred.reject(new Error(error));
        debug('An issue occurred while trying to create the docker container.');
        debug(error);
      }
      options.docker.container    = JSON.parse(body);
      deferred.resolve(options);
    });
    return deferred.promise;
  },
  start             : function (options) {
    var deferred        = Q.defer(),
        containerInfo   = {
          'Binds' : [
            '/var/run/mysqld/mysqld.sock:/var/run/mysqld/mysqld.sock',
            '/tmp/docker/' + options.details.name + '/builds/' + options.docker.buildName + ':/var/www/html'
          ],
          'PortBindings':{ '80/tcp': [{ 'HostPort' : '' }] }
        };
    debug(containerInfo);
    request.post({
      'url'     : 'http://unix:/var/run/docker.sock:/containers/' + options.docker.container.Id + '/start',
      'headers' : {'Content-Type' : 'application/json'},
      'body'  : JSON.stringify(containerInfo)
    }, function (error, response, body) {
      if (error) {
        deferred.reject(new Error(error));
        debug('An issue occurred while trying to start the docker container.');
        debug(error);
      }
      deferred.resolve(options);
      debug('The container has been started.');
      debug(body);
    });

    return deferred.promise;
  }
};

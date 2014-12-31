var fs              = require('fs'),
    cp              = require('child_process'),
    Q               = require('Q'),
    request         = require('request');

module.exports      = {
  wwwdir            : function (options) {
    var deferred        = Q.defer(),
        wwwdir          = '/tmp/docker/' + options.details.name;
    fs.mkdir(wwwdir, 0775, function (error) {
      if (error) {
        deferred.reject(new Error(error));
      }
      options.docker.wwwdir = wwwdir;
      deferred.resolve(options);
    });
    return deferred.promise;
  },
  checkout          : function (options) {
    var deferred        = Q.defer();

    options.docker.buildName      = (Math.random() + 1).toString(36).substring(14);

    cp.exec('git clone git@github.com:mattgrill/drupalcraft.git ' + options.docker.wwwdir, function (error, stdout, stderr) {
      console.log('############# git clone', error, stdout, stderr);
      if (error) {
        deferred.reject(new Error(error));
      }
      cp.exec('cd ' + options.docker.wwwdir + ' && npm install', function (error, stdout, stderr) {
        console.log('############# npm install', error, stdout, stderr);
        if (error) {
          deferred.reject(new Error(error));
        }
        cp.exec('cd ' + options.docker.wwwdir + ' && gulp build --builddir ' + options.docker.buildName + ' --dbname ' + options.details.name + ' --dbuser ' + options.details.user + ' --dbpass ' + options.details.pass + ' --scope local', function (error, stdout, stderr) {
          console.log('############# gulp build', error, stdout, stderr);
          if (error) {
            deferred.reject(new Error(error));
          }
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
          'Image' : options.docker.cid,
          'NetworkDisabled' : false,
          'RestartPolicy' : { 'Name': 'always' },
          'ExposedPorts': { '80/tcp': {} }
        };
    request.post({
      'url'   : 'http://unix:/var/run/docker.sock:/containers/create?name=' + options.details.name,
      'body'  : JSON.stringify(containerInfo)
    }, function (error, response, body) {
      if (error) {
        deferred.reject(new Error(error));
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
    request.post({
      'url'     : 'http://unix:/var/run/docker.sock:/containers/' + options.docker.container.Id + '/start',
      'headers' : {'Content-Type' : 'application/json'},
      'body'  : JSON.stringify(containerInfo)
    }, function (error, response, body) {
      if (error) {
        deferred.reject(new Error(error));
      }
      deferred.resolve(options);
    });
    return deferred.promise;
  }
};

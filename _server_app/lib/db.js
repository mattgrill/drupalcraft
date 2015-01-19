var Q               = require('Q'),
    uuid            = require('uuid'),
    mysql           = require('mysql'),
    db              = {
    /**
     * Creates some basic information for db interaction.
     */
      /**
       * Setup tasks for MYSQL related operations
       * @param  {object} appconfig Imported application config.
       * @param  {string} cid       container id
       */
      setup         : function (appconfig, cid) {
        var deferred              = Q.defer(),
            db_details            = {
              'user' : 'user-' + (Math.random() + 1).toString(36).substring(10),
              'pass' : uuid.v4(),
              'name' : (Math.random() + 1).toString(36).substring(10)
            },
            db_queries            = {
              'create_user'     : 'CREATE USER "' + db_details.user + '"@"localhost" IDENTIFIED BY "' + db_details.pass + '"',
              'create_database' : 'CREATE DATABASE `' + db_details.name + '`',
              'access_perms'    : 'GRANT ALL PRIVILEGES ON `' + db_details.name + '`.* TO "' + db_details.user + '"@"localhost"'
            },
            dbconnection          = mysql.createConnection({
              host     : appconfig.database.host,
              user     : appconfig.database.user,
              password : appconfig.database.password
            });
        deferred.resolve({
          'details'     : db_details,
          'queries'     : db_queries,
          'connection'  : dbconnection,
          'docker'      : {
            'cid'       : cid
          }
        });
        return deferred.promise;
      },
      release           : function (options) {
        var deferred  = Q.defer();
        options.connection.release();
        deferred.resolve(options);
        return deferred.promise;
      },
      /**
       * Executes the create_user query.
       * @param  {object} options The object containing the pool connection and the db info.
       * @return {promise} Returns a promise.
       */
      q_cu              : function (options) {
        var deferred  = Q.defer();
        options.connection.query({ sql : options.queries.create_user }, deferred.resolve(options));
        return deferred.promise;
      },
      /**
       * Executes the create_database query.
       * @param  {object} options The object containing the pool connection and the db info.
       * @return {promise} Returns a promise.
       */
      q_cd              : function (options) {
        var deferred  = Q.defer();
        options.connection.query({ sql : options.queries.create_database }, deferred.resolve(options));
        return deferred.promise;
      },
      /**
       * Executes the access_perms query.
       * @param  {object} options The object containing the pool connection and the db info.
       * @return {promise} Returns a promise.
       */
      q_ap              : function (options) {
        var deferred  = Q.defer();
        options.connection.query({ sql : options.queries.access_perms }, deferred.resolve(options));
        return deferred.promise;
      }
    };

module.exports = db;

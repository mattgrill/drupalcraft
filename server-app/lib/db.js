var Q               = require('Q'),
    uuid            = require('uuid'),
    mysql           = require('mysql'),
    pool            = mysql.createPool({
      connectionLimit : 10,
      host            : '127.0.0.1',
      user            : 'root',
      password        : 'batman'
    }),
    db              = {
    /**
     * Creates some basic information for db interaction.
     */
      database_setup    : function () {
        var db_details    = {
              'user' : 'user-' + (Math.random() + 1).toString(36).substring(10),
              'pass' : uuid.v4(),
              'name' : (Math.random() + 1).toString(36).substring(10)
            },
            db_queries    = {
              'create_user'     : 'CREATE USER "' + db_details.user + '"@"localhost" IDENTIFIED BY "' + db_details.pass + '"',
              'create_database' : 'CREATE DATABASE `' + db_details.name + '`',
              'access_perms'    : 'GRANT ALL PRIVILEGES ON `' + db_details.name + '`.* TO "' + db_details.user + '"@"localhost"'
            };
        return {'details':db_details,'queries':db_queries};
      },
      /**
       * Sets up the mysql connection from the available pool.
       * @param  {object} db_info The object containing basic databse info.
       * @param  {string} cid Container ID you want to start from.
       * @return {promise} Returns a promise.
       */
      get_connection    : function (db_info, cid) {
        var deferred  = Q.defer();

        db_info.docker  = {}
        db_info.docker.cid = cid;

        pool.getConnection(function (err, connection) {
          if (err) {
            deferred.reject(new Error(err));
          }
          db_info.connection = connection;
          deferred.resolve(db_info);
        });
        return deferred.promise;
      },
      release           : function (db_info) {
        var deferred  = Q.defer();
        db_info.connection.release();
        deferred.resolve(db_info);
        return deferred.promise;
      },
      /**
       * Executes the create_user query.
       * @param  {object} db_info The object containing the pool connection and the db info.
       * @return {promise} Returns a promise.
       */
      q_cu              : function (db_info) {
        var deferred  = Q.defer();
        db_info.connection.query({ sql : db_info.queries.create_user }, deferred.resolve(db_info));
        return deferred.promise;
      },
      /**
       * Executes the create_database query.
       * @param  {object} db_info The object containing the pool connection and the db info.
       * @return {promise} Returns a promise.
       */
      q_cd              : function (db_info) {
        var deferred  = Q.defer();
        db_info.connection.query({ sql : db_info.queries.create_database }, deferred.resolve(db_info));
        return deferred.promise;
      },
      /**
       * Executes the access_perms query.
       * @param  {object} db_info The object containing the pool connection and the db info.
       * @return {promise} Returns a promise.
       */
      q_ap              : function (db_info) {
        var deferred  = Q.defer();
        db_info.connection.query({ sql : db_info.queries.access_perms }, deferred.resolve(db_info));
        return deferred.promise;
      }
    };

module.exports = db;

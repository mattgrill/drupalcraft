var appconfig       = require('./app.config.json'),
    express         = require('express'),
    app             = express(),
    bodyParser      = require('body-parser'),
    path            = require('path'),
    debug           = require('debug')('drupalcraft:app'),
    db              = require('./lib/db'),
    docker          = require('./lib/docker');

var promptColors    = {
  'reset'  : '\033[m',
  'red'    : '\033[1;31m',
  'blue'   : '\033[1;34m',
};

app
  .use(bodyParser.json())
  .post('/', function (req, res){

    /**
     * Accepts data to startup a docker container.
     *
     * @param {string} req.body.iid
     * @param {string} [req.body.gittag]
     *
     */

    if (!req.body.iid) {
      return res
              .status(500)
              .send('Silly.\n');
    }
    debug('Starting Docker container creation.');
    db.setup(appconfig, req.body.iid)
      .then(db.q_cu)
      .then(db.q_cd)
      .then(db.q_ap)
      .then(db.release)
      .then(docker.wwwdir)
      .then(docker.checkout)
      .then(docker.create)
      .then(docker.start)
      .then(function (options) {
        return res
                .status(200)
                .send('done\n');
      })
      .fail(function (error) {
        return res
                .status(500)
                .send(error+'\n');
      });

  })
  .listen(process.env.PORT || 5000);

debug('Starting on '+5000);

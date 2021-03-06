const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const express = require('express');
var app = express();

var config = {
  'applicationFqdn':       process.env.APPLICATION_FQDN,
  'letsEncryptEmail':     process.env.LETS_ENCRYPT_EMAIL,
  'letsEncryptServer':    process.env.LETS_ENCRYPT_SERVER
}

function config_complete(config) {
  var keys = Object.keys(config);
  for(var i = 0; i < keys.length; i++) {
    if(typeof(config[keys[i]]) == 'undefined') {
      return false;
    }
  }
  return true;
}

function generate_certificate(callback) {
  var cwd = __dirname;
  var webroot = path.join(cwd, 'www');
  var configdir = path.join(cwd, 'config');

  var options = {
    'cwd': path.join(__dirname, 'node_modules', 'letsencrypt-cli')
  }
  exec('node bin/letsencrypt.js --agree-tos --email ' + config['letsEncryptEmail'] + 
            ' --webroot --webroot-path ' + webroot +
            ' --config-dir ' + configdir + 
            ' --domains ' + config['applicationFqdn'] + 
            ' --server ' + config['letsEncryptServer'],
      options,
      (error, stdout, stderr) => {
        if(error) {
          console.log(`exec error: ${error}`);
          callback(true);
        } else {
          var cert = fs.readFileSync(path.join(configdir, 'live', config['applicationFqdn'], 'cert.pem')).toString('utf-8'); 
          var key = fs.readFileSync(path.join(configdir, 'live', config['applicationFqdn'], 'privkey.pem')).toString('utf-8');
          var chain = fs.readFileSync(path.join(configdir, 'live', config['applicationFqdn'], 'chain.pem')).toString('utf-8'); 
          var fullchain = fs.readFileSync(path.join(configdir, 'live', config['applicationFqdn'], 'fullchain.pem')).toString('utf-8'); 
          callback(false, { 'cert': cert, 'key': key, 'chain': chain, 'fullchain': fullchain });
        }
      }
  );
}

app.get('/', function (req, res) {
  res.send('Nothing here.')
});
app.get('/generate_cert', function (request, response) {
  //response.write(JSON.stringify(data));
  generate_certificate(function(error, data) {
    if(error) {
      response.status(503).end();
    } else {
      response.set({'Content-Type': 'application/json'});
      response.status(201);
      response.write(JSON.stringify(data));
      response.end();
    }
  });
});
app.use(express.static(path.join(__dirname, 'www')));

if(config_complete(config)) {
  app.listen(5000, function () {
    console.log('Listening on port 5000');
  });
} else {
  console.log('Not all environment variables set.')
  process.exit(1)
}

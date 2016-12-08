var path = require('path')
var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.use(express.static(path.join(__dirname, 'www')))

app.listen(5000, function () {
  console.log('Listening on port 5000');
})

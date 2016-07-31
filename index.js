var http = require('http').Server(app);
var path = require('path');
var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3001, function() {
    console.log('listening on *:3001');
});

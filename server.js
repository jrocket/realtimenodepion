
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ejs = require('ejs');

var mygame = require('./game');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);

var io = require('socket.io').listen(server);




io.sockets.on('connection', function (socket, pseudo) {
  
    socket.emit('cc_join',{
        board:mygame.Game.getBoard(),
        nextPlayer : mygame.Game.getPlayer(),
        score1 : mygame.Game.getScore(0),
        score2 : mygame.Game.getScore(1)
        });

    // Message sC_Play = someone has played...
    socket.on('sC_Play', function (data) {
        console.log("play");
        var won =  mygame.Game.play(data);
        console.log("won");
        if (won != -1) {
             io.sockets.emit('cc_gameWon',{board:mygame.Game.getBoard() , winner : won});
        }
        else
        {
           data.player = (data.player+1)%2;
           io.sockets.emit('cc_refresh',{board : mygame.Game.getBoard(), 
           nextPlayer :  mygame.Game.getPlayer(),
           force : false
           });
        }
    }); 
    
    // Message sC_Reset = someone has clicked on the reset button
     socket.on('sC_Reset', function () {
       mygame.Game.reset();
       socket.emit('cc_reset');
       socket.broadcast.emit('cc_reset');
    }); 
});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

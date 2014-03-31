
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ejs = require('ejs');
var storage = require('node-persist');

var mygame = require('./game');

var app = express();
//storage
storage.initSync();


var score = storage.getItem('score');
if (score===undefined){
    score = mygame.Game.getScore();
    storage.setItem('score',score);
}
else
{
    mygame.Game.setScore(score);
}

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
var connectedUserCount = 0;




io.sockets.on('connection', function (socket, pseudo) {
    connectedUserCount ++;
    socket.emit('cc_join',{
        board:mygame.Game.getBoard(),
        nextPlayer : mygame.Game.getPlayer(),
        score1 : mygame.Game.getScore(0),
        score2 : mygame.Game.getScore(1)

        });

    io.sockets.emit('cc_updateUserCount',{count : connectedUserCount});

    // Message sC_Play = someone has played...
    socket.on('sC_Play', function (data) {
        var won =  mygame.Game.play(data);
        if (won != -1) {
             io.sockets.emit('cc_gameWon',{board:mygame.Game.getBoard() , winner : won});
             storage.setItem('score',mygame.Game.getScore());
        }
        else
        {
           data.player = mygame.Game.getPlayer();
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

    socket.on('disconnect', function() {
      connectedUserCount--;
       io.sockets.emit('cc_updateUserCount',{count : connectedUserCount});
   });
});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

$(function () {
    var socket = io.connect('http://localhost:1337');

    var loader = "<img class='loader'  src='/images/ajaxloader.gif' />";
    var gameEnd = false;

    var currentPlayer = 1;
    var waitForSomeoneToPlay = false;

    var hideOrShow = function () {
        if (waitForSomeoneToPlay) {
            $("#myTurn").addClass("hide");
            $("#yourTurn").removeClass("hide");
            $("#gameEnd").addClass("hide");
        }
        else {
            $("#yourTurn").addClass("hide");
            $("#myTurn").removeClass("hide");
            $("#gameEnd").addClass("hide");
        }
        if (gameEnd) {
            $("#yourTurn").addClass("hide");
            $("#myTurn").addClass("hide");
            $("#gameEnd").removeClass("hide");
        }
        else {
            $("#gameEnd").addClass("hide");
        }

    }

    var getImage = function (player) {

        if (player === 1 || parseInt(player, 10) === 1) {
            return "<img src='/images/croix.png'/>";
        }
        else return "<img src='/images/cercle.png'/>";
    }

    var incrementScore = function (id) {
        console.log ("increment score " + id + $(id).html());
        var score = parseInt($(id).html(), 10);
        score++;
        $(id).html(score);
    }



    var ticktacktoe = {};
  
    ticktacktoe.server = {};
    ticktacktoe.server.sC_Play = function (position, player){
        socket.emit('sC_Play', {position : position, player : player});
    }

    ticktacktoe.server.sC_Reset = function () {
        socket.emit('sC_Reset');
    }
    

    socket.on('cc_gameWon', function (data) {
        if (data.won === -2) {
            $("#gameEnd").html(" Game tied ! you have to reset :(");
        }
        else {
            if (data.won === 0) {
                incrementScore("#scorJ");
            }
            else {
                incrementScore("#scorO");
            }
            $("#gameEnd").html(" Game won ! you can now safely reset :)");
        }
        //game end...
        gameEnd = true;
        hideOrShow();
        $(".square").each(function () {
            var coord = $(this).attr("data-coord");
            var res = coord.split(",");
            var player = data.board[res[0]][res[1]];
            if (player != undefined && player >= 0) {
                var label = getImage(player);
                $(this).html(label);
            }
        });
    });


     socket.on('cc_reset', function () {
        $(".square").each(function () {
            $(this).html("&nbsp;");
        });
        waitForSomeoneToPlay = false;
        gameEnd = false;
        currentPlayer =0;
        
        hideOrShow();
        console.log("reset -> currentPlayer = " + currentPlayer);

    });

     socket.on('cc_refresh', function (data) {
       
        if (currentPlayer == data.nextPlayer) {
            waitForSomeoneToPlay = true;
        }
        else {
            waitForSomeoneToPlay = false;
            currentPlayer = data.nextPlayer;
        }
        
        hideOrShow();
        var debugRefreshedSquareCount = 0;

        $(".square").each(function () {
            var coord = $(this).attr("data-coord");
            var res = coord.split(",");
            var player = data.board[res[0]][res[1]];
            
            if (player != undefined && player >= 0) {
                var htmlInSquare =  $(this).html();
                if (data.force === true || htmlInSquare === "&nbsp;" || htmlInSquare.indexOf('loader') != -1)
                {
                    var label = getImage(player);
                    $(this).html(label);
                    debugRefreshedSquareCount++;
                   
                }
            }
            
        });

    })
  
    socket.on('cc_join',function (data) {
         currentPlayer = data.nextPlayer;
         $(".square").each(function () {
            var coord = $(this).attr("data-coord");
            var res = coord.split(",");
            var player = data.board[res[0]][res[1]];
            
            if (player != undefined && player >= 0) {
                var htmlInSquare =  $(this).html();
                var label = getImage(player);
                $(this).html(label);
            }
            
        });
        for (var i = 0; i < data.score1; i++) {
            incrementScore("#scorJ");
        }
        for (var i = 0; i < data.score2; i++) {
            incrementScore("#scorO");
        }
   
    });
    socket.on('cc_updateUsersOnlineCount', function (data) {
         // Add the message to the page.
        var label = data + " user(s) connected";
        $('#usersCount').text(label);
        });
   


  


    // Start the connection.
   
        $(".square").click(function () {
            var $this = $(this);
            if (waitForSomeoneToPlay === false && gameEnd === false) {
                var currentValue = $this.html();

                if (currentValue == '&nbsp;') {
                    waitForSomeoneToPlay === true;
                    var value = $this.attr("data-coord");
                    $this.html(loader);
                    ticktacktoe.server.sC_Play(value, currentPlayer);
                    currentPlayer = (currentPlayer + 1) % 2;
                    hideOrShow();
                }
            }
        });

        $("#reset").click(function () {
            if (gameEnd || confirm("are you sure?")) {
                ticktacktoe.server.sC_Reset();
            }

    });
   
});
var Game = function() {
    self = this;
    var board = {}
    var player = 0;
    var score = [0,0];
    
    board.initialize = function () {
        board.game = [[-1,-1,-1],[-1,-1,-1],[-1,-1,-1]];
    }

    var getNextPlayer = function (){
        player = (player +1)%2;
        return player
        }
    
    self.play = function (data){
       var res = data.position.split(",");
       board.game[res[0]][res[1]]= getNextPlayer();
       var isthereawinner = getWinner();
       if (isthereawinner >-1){
           console.log("winner = " + isthereawinner);
           score[isthereawinner]++;
       }
       console.log("player is " + player);
       return isthereawinner;
    }

    self.getBoard = function (){
        return board.game;
    }

    self.getPlayer = function (){
        return player;
    }

    self.reset = function (){
        board.initialize();
        player = 0;
        }
    
    self.getScore = function (player){
        if (player===undefined){
            return score;
        }
        return score[player];
    }

    self.setScore = function (data){
        score = data;
    }
    board.initialize();

    var getWinner = function () {
        var checkHorizontal = function (){
             var result = true;
            
            for (var i = 0; i < 3; i++)
            {
                result = true;
                var player1 = board.game[i][ 0];
                for (var j = 0; j < 3; j++)
                {
                    result =result &&  (player1 != -1 && player1 == board.game[i][ j]);
                }

                if (result)
                {
                    break;
                }
            }
            return result;
            
        };
        var checkVertival = function (){
             var result = true;

            for (var j = 0; j < 3; j++)
            {
                result = true;
                var player1 = board.game[0][j];
                for (var i = 0; i < 3; i++)
                {
                    result =result && (player1 != -1 && player1 == board.game[i][j]);
                }

                if (result)
                {
                    break;
                }
            }
            return result;
        };
        var checkDiagonal = function (){
            var result = true;
            var player1 =  board.game[1][1];
            for (var delta = -1; delta < 2; delta++)
            {
                result =result && (player1 == board.game[1 + delta][ 1 + delta] && player1 != -1);
            }
            return result;
        };
        var checkAntiDiag = function (){
            var result = true;
            var player1 = board.game[1][ 1];
            for (var delta = -1; delta < 2; delta++)
            {
                result =result && (player1 == board.game[1 + delta][ 1 - delta] && player1 != -1);
            }
            return result;
        };
        
        var checkForTie = function (){
            var result = true;
            for(var i=0;i<3;i++)
            for(var j=0;j<3;j++)
            {
                result =result && (board.game[i][j] != -1); 
            }
            return result;
        };


          if (checkHorizontal() || checkVertival() || checkDiagonal() || checkAntiDiag())
            {
                return player;
            }

            if (checkForTie())
            {
                return -2;
            }


            return -1;

        }

}










exports.Game = new Game();

var GamePlay = {
    init: function() {
        GamePlay.canvas = document.getElementById('game_view');
        $('.pause').bind('click', function() { GamePlay.mode = "pause";});
        $('.play').bind('click', function() { GamePlay.mode = "play"; Board.processMove(); GamePlay.draw();});
        $('.forward').bind('click', function() { Board.processMove(); GamePlay.draw();});
        $('.newgame').bind('click', function() { GamePlay.setupNewGame();});
        $('.reset').bind('click', function() { Board.reset();});
        $('#set_board').bind('click', function() { GamePlay.setBoardNumber();});
        $('#board_number').bind('keyup', function(e) { if(e.keyCode == 13) {GamePlay.setBoardNumber();}});

        $('#check_breadcrumbs').click(function(evt) {
          if (evt.srcElement.checked) {
            GamePlay.show_breadcrumbs = true;
          } else {
            GamePlay.show_breadcrumbs = false;
          }
        });

        GamePlay.show_breadcrumbs = false;
        var itemImageUrls = ["assets/images/FruitApple.png", "assets/images/FruitBanana.png", "assets/images/FruitCherry.png", "assets/images/FruitMelon.png", "assets/images/FruitOrange.png"];
        GamePlay.itemImages = new Array();
        for (var i=0; i<itemImageUrls.length; i++) {
            var img = new Image();
            img.src = itemImageUrls[i];
            GamePlay.itemImages[i] = img;
        }
        GamePlay.player_one_image = new Image();
        GamePlay.player_one_image.src = "assets/images/FruitBlueBot.png";
        GamePlay.player_two_image = new Image();
        GamePlay.player_two_image.src = "assets/images/FruitPurpleBot.png";
        GamePlay.visitedImg = new Image();
        GamePlay.visitedImg.src = "assets/images/FruitCellVisited.png";
        GamePlay.bothVisitedImg = new Image();
        GamePlay.bothVisitedImg.src = "assets/images/FruitCellVisitedBoth.png";
        GamePlay.oppVisitedImg = new Image();
        GamePlay.oppVisitedImg.src = "assets/images/FruitCellOppVisited.png";
        GamePlay.itemImages[itemImageUrls.length - 1].onload = function(){
            GamePlay.setupNewGame();
        };

    },
    setupNewGame: function(boardNumber) {
        // Create a new board setup according to the following priority:
        // 
        // 1. If a board number is passed in, use that.
        // 2. If the bot has default_board_number() defined, use that.
        // 3. Generate a random board number.
        var nextBoardNum;

        if(boardNumber === undefined) {
            if ( typeof default_board_number == 'function' && !isNaN(parseInt(default_board_number()))) {
                nextBoardNum = default_board_number()
            } else {
                Math.seedrandom();
                nextBoardNum = Math.min(Math.floor(Math.random() * 999999), 999999);
            }
        } else {
            nextBoardNum = boardNumber;
        }

        $('#board_number').val(nextBoardNum);

        Board.init(nextBoardNum);

        Board.newGame();
        GamePlay.itemTypeCount = get_number_of_item_types();
        document.getElementById('grid').width = GamePlay.itemTypeCount * 50 + WIDTH * 50;
        document.getElementById('grid').height = HEIGHT * 50;
        document.getElementById('game_view').width = GamePlay.itemTypeCount * 50 + WIDTH * 50;
        document.getElementById('game_view').height = HEIGHT * 50;
        $('#buttons').css('padding-left', GamePlay.itemTypeCount * 50);
        $('#buttons').css('padding-top', HEIGHT * 50);
        Grid.draw();
        GamePlay.start();
    },
    start: function() {
        GamePlay.mode = "play";
        // GamePlay.mode = "pause";
        GamePlay.draw();
    },
    draw: function() {
        var ctx = GamePlay.canvas.getContext('2d');
        ctx.clearRect(0,0,GamePlay.canvas.width,GamePlay.canvas.height);
        GamePlay.drawItems(ctx, Board.board, Board.history);
        GamePlay.drawPlayerTwo(ctx, Board.board);
        GamePlay.drawPlayerOne(ctx, Board.board);
        GamePlay.displayScore(ctx, Board.board);
				//document.getElementById("wins").innerHTML = ((document.getElementById("wins").innerHTML++)+1);
				//document.getElementById("ties").innerHTML = ((document.getElementById("ties").innerHTML++)+1);
				//document.getElementById("losses").innerHTML = ((document.getElementById("losses").innerHTML++)+1);
        if (GamePlay.mode == "play") {
           var score = Board.checkGameOver();
			var div = document.getElementById('fruitbottext');
           if (score !== undefined) {
			   ctx.font = "30px Arial";
			   ctx.fillStyle = "#000";
               if (score > 0) {
				   console.log("You win!");
				   console.log("You win!");
				   console.log("You win!");
				   console.log("You win!");
				    loadJSON("https://gil-api.herokuapp.com/fruitbotwin", function(response) {
						document.getElementById("wins").innerHTML = JSON.parse(response);
					}); // end loadJSON
				console.log("You win!");
               } //end if score
               if (score < 0) {
				    loadJSON("https://gil-api.herokuapp.com/fruitbotloss", function(response) {
						document.getElementById("losses").innerHTML = JSON.parse(response);
					}); // end loadJSON
				console.log("You lose!");
               } //end if score
               if (score == 0) {
					loadJSON("https://gil-api.herokuapp.com/fruitbottie", function(response) {
						document.getElementById("ties").innerHTML = JSON.parse(response);
					}); // end loadJSON
				console.log("You tie!");
               } //end if score
			   GamePlay.init();
               return;
		   } //end if score
           Board.processMove();
           setTimeout(function() {GamePlay.draw();}, 500);
        } else {
           GamePlay.mode = "pause";
        }
    },
    displayScore: function(ctx, state) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "#366B76";
        ctx.fillText("My Bot", 0, 50);
        ctx.font = "15px Arial";
        ctx.fillStyle = "#000";
        for (var i=0; i<GamePlay.itemTypeCount; i++) {
            ctx.fillText(Board.myBotCollected[i].toFixed(1), 50*i, 75);
            ctx.drawImage(GamePlay.itemImages[i], 52*i+15, 55, 25, 25);
        }
        ctx.font = "30px Arial";
        ctx.fillStyle = "#82298E";
        ctx.fillText("Simple Bot", 0, 125);
        ctx.font = "15px Arial";
        ctx.fillStyle = "#000";
        for (var i=0; i<GamePlay.itemTypeCount; i++) {
            ctx.fillText(Board.simpleBotCollected[i].toFixed(1), 50*i, 150);
            ctx.drawImage(GamePlay.itemImages[i], 52*i+15, 130, 25, 25);
        }
        ctx.font = "30px Arial";
        ctx.fillStyle = "#F00";
        ctx.fillText("items left", 0, 200);
        ctx.font = "15px Arial";
        ctx.fillStyle = "#000";
        for (var i=0; i<GamePlay.itemTypeCount; i++) {
            ctx.fillText((Board.totalItems[i]-Board.myBotCollected[i]-Board.simpleBotCollected[i]).toFixed(1), 50*i, 225);
            ctx.drawImage(GamePlay.itemImages[i], 52*i+15, 205, 25, 25);
        }
    },
    drawPlayerOne: function(ctx, state) {
        ctx.drawImage(GamePlay.player_one_image, GamePlay.itemTypeCount * 50 + Board.myX * 50 + 2, Board.myY * 50 + 2);
    },
    drawPlayerTwo: function(ctx, state) {
        ctx.drawImage(GamePlay.player_two_image, GamePlay.itemTypeCount * 50 + Board.oppX * 50 - 2, Board.oppY * 50 - 2);
    },
    drawItems: function(ctx, state, history) {
        for (var i=0; i<WIDTH; i++) {
            for (var j=0; j<HEIGHT; j++) {
                if (state[i][j] !== 0) {
                    ctx.drawImage(GamePlay.itemImages[state[i][j] - 1], GamePlay.itemTypeCount * 50 + i * 50, j * 50);
                } else if (GamePlay.show_breadcrumbs && history[i][j]==1) {
                    ctx.drawImage(GamePlay.visitedImg, GamePlay.itemTypeCount * 50 + i * 50, j * 50);
                } else if (GamePlay.show_breadcrumbs && history[i][j]==2) {
                    ctx.drawImage(GamePlay.oppVisitedImg, GamePlay.itemTypeCount * 50 + i * 50, j * 50);
                } else if (GamePlay.show_breadcrumbs && history[i][j]==3) {
                    ctx.drawImage(GamePlay.bothVisitedImg, GamePlay.itemTypeCount * 50 + i * 50, j * 50);
                }
            }
        }
    },
    setBoardNumber: function() {
        var boardNumber;

        boardNumber = parseInt($('#board_number').val());
        if (!isNaN(boardNumber)) {
            GamePlay.setupNewGame(boardNumber);
        } else {
            GamePlay.setupNewGame();
        }
    }
}
// https://laracasts.com/discuss/channels/general-discussion/load-json-file-from-javascript
function loadJSON(file, callback) {   

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
};// end loadJSON


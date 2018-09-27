var http = require('http');

var fs = require('fs');


//renvoie le deck mélangé
function generateDeck(){
	
	//génère une array de 1 à 104
	var deck = Array.from({length: 104}, (v, k) => k+1); 
	
	//mélange l'array
	for(var j, x, i = deck.length; i; j = parseInt(Math.random() * i), x = deck[--i], deck[i] = deck[j], deck[j] = x); 
	
	return deck;
	
}

//pioche une carte et la retire du packet
function draw(deck){
	
	var card = deck[0];
	deck.shift();
	
	return card;
	
}

//Créer un tableau vide
function generateBoard(){
    var board = [  
                    Array(6),
                    Array(6),
                    Array(6),
                    Array(6)
                ]
    return board;
}

//Initialise un tableau à partir de 4 cartes d'un deck
function init_board(board,deck){
    board[0][0] = draw(deck);
    board[1][0] = draw(deck);
    board[2][0] = draw(deck);
    board[3][0] = draw(deck);
    return true;
}


//Créer une main à partir de 10 cartes d'un deck
function generateHand(deck){

    var hand = [];

    for(var indexHand=0;indexHand<10;indexHand++)
        hand.push(draw(deck));

    return hand;
}

//pose une array de cartes sur le board
function putCards(cards, board){
	
	//on commence par trier les cartes par ordre croissant
	cards.sort();
	
	var max = 105;
	var row;
	
	//Pour chaques cartes
	for(cardIndex = 0; cardIndex < cardIndex.length; cardIndex ++){
		
		//Pour chaques rangées
		for(boardIndex = 0; boardIndex < boardIndex.length; cardIndex ++){
			
			//on choisit la meilleur rangée
			if (cards[cardIndex] > Math.max(board[boardIndex]) && cards[cardIndex] < max ){
				var max = Math.max(board[boardIndex]);
				var row = boardIndex;
			}
			
		}
		
		//on pose la carte
		board[row].push(cards[cardIndex])
		
		//si c'est la 6ème, on gère les points
		if (board[row].length >= 6){ 
			board[row] == Array(6);
			board[row][0] = cards[cardIndex];
		}
		
	}
	
}


console.log('Serveur on');


// Chargement du fichier index.html affiché au client

var server = http.createServer(function(req, res) {

    fs.readFile('./index.html', 'utf-8', function(error, content) {

        res.writeHead(200, {"Content-Type": "text/html"});

        res.end(content);

    });

});


// Chargement de socket.io

var io = require('socket.io').listen(server);

var joueurs_connected = 0;
var joueurs_ready = 0;



io.sockets.on('connection', function (socket, pseudo) {

    console.log('Nouveau joueur');

    //on demande le pseudo au joueur
        socket.on('nickname', function(pseudo) {

        socket.pseudo = pseudo;
        console.log('Un joueur à choisi le pseudo : '+ socket.pseudo);
        joueurs_connected= joueurs_connected + 1;

    });

    //on attends que les joueurs soient prêts
    socket.on('ready', function () {

        socket.ready = 1;

        console.log(socket.pseudo + ' est prêt');
        joueurs_ready = joueurs_ready + 1;

        console.log(joueurs_ready + ' ' + joueurs_connected);

        // Quand 2 à 10 joueurs sont prêts go.
if (joueurs_ready >= 2 && joueurs_ready <= 10 && joueurs_ready == joueurs_connected){

        nb_joueurs = joueurs_ready;

        //on créer un deck
        var deck = generateDeck();
        
        //on créer un tableau de jeu
        var board = generateBoard();

        //on pose les 4 premières cartes
        init_board(board, deck);


        //on récupère les joueurs connectés
        Object.keys(io.sockets.sockets).forEach(function(socketId){
            socket = io.sockets.connected[socketId];

            //on prend seulement les joueurs prêts
            if (socket.ready == 1){

                //on génère la main
                socket.hand = generateHand(deck);
                
                //on envoie la main et le tableau au joueur
                socket.emit('init',{ hand:socket.hand, board:board});
            }
        });

        

        }


    }); 

});



server.listen(8080);
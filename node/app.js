

var http = require('http');

var express = require('express');

var app = express();

app.set('view engine', 'ejs');

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

var server = require('http').Server(app);

// Chargement du fichier public (style)
console.log(__dirname)
app.use(express.static(__dirname + '/public'));

// Chargement du fichier d'index

app.use("/", (req, res) => {
    res.render("main");
});


// Chargement de socket.io

var io = require('socket.io').listen(server);

var joueurs_connected = 0;
var joueurs_ready = 0;



io.sockets.on('connection', function (socket, joueur) {


   

    //on demande le pseudo au joueur et on récupère sa room
        socket.on('nickname', function(joueur) {
                socket.room = joueur.room;
                socket.pseudo = joueur.pseudo;
                socket.join(socket.room);
                console.log(socket.pseudo +' rejoins la salle ' + socket.room);
        });



    //on attends que les joueurs soient prêts
    socket.on('ready', function () {

        socket.ready = 1;

        console.log(socket.pseudo + ' est prêt');


        // vais dans room
        // si tt les joueurs sont ready et + 2 joueurs, go

        var currentRoom = socket.room;
        var joueurRoom = 0;
        var joueurRoomReady = 0;

        //on attend que les joueurs de la pièce soient tous prêt
        Object.keys(io.sockets.sockets).forEach(function(socketId){
            socket = io.sockets.connected[socketId];
            
            if (socket.room == currentRoom){
                joueurRoom = joueurRoom + 1;
                if (socket.ready == 1) {
                    joueurRoomReady = joueurRoomReady + 1;
                }
            }
        });

        // Quand 2 à 10 joueurs sont prêts go.
        if (joueurRoom == joueurRoomReady && joueurRoomReady >= 2 && joueurRoomReady <= 2){

            //on créer un deck
            var deck = generateDeck();

            //on créer un tableau de jeu
            var board = generateBoard();

            //on pose les 4 premières cartes
            init_board(board, deck);

            //on récupère les joueurs connectés à la pièce
            Object.keys(io.sockets.sockets).forEach(function(socketId){
                socket = io.sockets.connected[socketId];

                //on prend seulement les joueurs de la room
                if (socket.room == currentRoom){

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


var http = require('http');

var express = require('express');

var app = express();

app.set('view engine', 'ejs');

var fs = require('fs');

var boards = Array();

var playerAmount = 0;

var cartesSelectionnees = Array();

//renvoie le deck mélangé
function generateDeck(){
	
	//génère une array de 1 à 104
    let deck = [];
    for(i = 1; i <= 104; i++){

        // On test toutes les valeurs de cartes pour savoir le nombre de malus
        // On test les cartes qui sont divisibles par 11 qui ont un malus de 5
        if(i%11 === 0){
            
            // Sauf le 55 qui a un malus 6
            if(i === 55){
                deck.push(generateCarte(i, 6));
                continue;
            }
            deck.push(generateCarte(i, 5));
            continue;
        }
        // On test si la valeur est divisible par 5 car 5, 15 , 25 ... ont 2 de malus
        if(i%5 === 0){

            // il faut par contre tester que la valeur n'est pas divisible par 10 car sinon le malus pour 
            // 10, 20, 30 ... est de 3
            if(i%10 === 0){
                deck.push(generateCarte(i, 3));
                continue;
            }
            // Sinon c'est que c'est 5,15,25 forcémeent
            deck.push(generateCarte(i, 2))
            continue;

        }

        deck.push(generateCarte(i, 1));

    }
	
	//mélange l'array
	for(var j, x, i = deck.length; i; j = parseInt(Math.random() * i), x = deck[--i], deck[i] = deck[j], deck[j] = x); 
	
	return deck;
	
}

function generateCarte(value, malus){

    let carte = new Object();
    carte.value = value;
    carte.malus = malus;

    return carte;

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
                    Array(),
                    Array(),
                    Array(),
                    Array()
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


function putCards(cards, board){

    //on commence par trier les cartes par ordre croissant
    cards.sort(function (a, b) {
        return a.value - b.value;
    });
   
    
 

    // Cette première boucle parcourt uniquement les cartes
    for(indexCarte = 0; indexCarte < cards.length; indexCarte++){

        var valeurCarte = cards[indexCarte].value;
     
        var superieureACarte = 0;
        var ligneOuPlacerCarte = -1;

        // Cette boucle parcourt les 4 lignes du board
        for(ligneBoard = 0; ligneBoard < board.length; ligneBoard++){

            var valeurDerniereCarteLigne = board[ligneBoard][board[ligneBoard].length - 1].value;
            // Ici on est sensé voir la dernière carte de la ligne en cours
      
            

            //Si la carte que souhaite posé le joueur est plus grande que la dernière carte de la ligne
            if(valeurCarte > valeurDerniereCarteLigne){

             
                // Ici on sera d'obtenir à la fin du parcours entier du board la carte la plus proche de celle du joueur à la fin du parcours
                if(valeurDerniereCarteLigne > superieureACarte){

                    ligneOuPlacerCarte = ligneBoard;
                    superieureACarte = valeurDerniereCarteLigne;
                    
                }

            }
            


        }

        board[ligneOuPlacerCarte].push(cards[indexCarte]);
    
        //si c'est la 6ème, on gère les points
        if (board[ligneOuPlacerCarte].length >= 6) {
            board[ligneOuPlacerCarte] == Array();
            board[ligneOuPlacerCarte][0] = cards[indexCarte];
        }


    }

    return board;
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

                //on rejoint la salle et on envoie un message dans le salon (et la console)
                socket.join(socket.room);
                socket.emit('room_chat',"Vous venez de rejoindre le salon "+socket.room+".<br>");
                socket.broadcast.to(socket.room).emit('room_chat',socket.pseudo + " rejoint la salle.<br>");
                console.log(socket.pseudo +' rejoint la salle ' + socket.room);
        });

    //on attend de recevoir des messages
    socket.on('general_chat',function(message){
        io.emit('general_chat',socket.pseudo + ": " +message+"<br>"); //envoi le message à tout le monde
    });

    socket.on('room_chat',function(message){
        io.in(socket.room).emit('room_chat',socket.pseudo + ": " +message+"<br>"); //envoi le message à tout le monde dans la salle room_chat
    });



    socket.on('played', function(){



    });

    socket.on('carteChoisie', function (carteChoisie) {        
        

        cartesSelectionnees.push(socket.hand[carteChoisie]);

        socket.hand.splice(carteChoisie, 1);
        if (cartesSelectionnees.length == playerAmount) {
    

          boards[socket.room] = putCards(cartesSelectionnees, boards[socket.room]);
          //on récupère les joueurs connectés à la pièce
          Object.keys(io.sockets.sockets).forEach(function(socketId) {
            let socket = io.sockets.connected[socketId];

            socket.carteChoisie = -1;
            //on prend seulement les joueurs de la room

            socket.emit("init", {
              hand: socket.hand,
              board: boards[socket.room]
            });
          });

          cartesSelectionnees = Array();
        }
    });





    //on attend que les joueurs soient prêts
    socket.on('ready', function () {

        socket.ready = 1;

        var currentRoom = socket.room;
        var joueurRoom = 0;
        var playerRoomReady = 0;

        //on attend que les joueurs de la pièce soient tous prêt
        Object.keys(io.sockets.sockets).forEach(function(socketId){
            let socket = io.sockets.connected[socketId];
            
            if (socket.room == currentRoom){
                joueurRoom = joueurRoom + 1;
                if (socket.ready == 1) {
                    playerRoomReady = playerRoomReady + 1;
                }
            }
          
        });
        playerAmount = playerRoomReady;
        // Quand 2 à 10 joueurs sont prêts go.
        if (joueurRoom == playerAmount && playerAmount >= 2 && playerAmount <= 10) {
          //envoi à tout le monde sauf le client
          socket.broadcast
            .to(socket.room)
            .emit(
              "room_chat",
              socket.pseudo + " est prêt, que la partie commence !<br>"
            );
          //envoi au client
          socket.emit("room_chat", "vous êtes prêt, la partie peut commencer !<br>");

          //on créer un deck
          var deck = generateDeck();

          //on créer un tableau de jeu
          boards[socket.room] = generateBoard();

          //on pose les 4 premières cartes
          init_board(boards[socket.room], deck);

          //on récupère les joueurs connectés à la pièce
          Object.keys(io.sockets.sockets).forEach(function(socketId) {
            let socket = io.sockets.connected[socketId];

            //on prend seulement les joueurs de la room
            if (socket.room == currentRoom) {
              //on génère la main
              socket.hand = generateHand(deck);

              //on envoie la main et le tableau au joueur
              socket.emit("init", {
                hand: socket.hand,
                board: boards[socket.room]
              });
            }
          });
        } else {
          //envoi à tout le monde sauf le client
          socket.broadcast
            .to(socket.room)
            .emit(
              "room_chat",
              socket.pseudo +
                " est prêt ( " +
                playerAmount +
                " / " +
                joueurRoom +
                " joueurs prêts )<br>"
            );
          //envoi au client
            socket.emit("room_chat", "vous êtes prêt, la partie commencera quand tous les joueurs présents seront prêts ( " + playerAmount + " / " + joueurRoom + " joueurs prêts )<br>");
        }
    }); 
});

server.listen(8080);
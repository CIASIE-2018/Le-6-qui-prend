

let http = require('http');

let express = require('express');

let app = express();

app.set('view engine', 'ejs');

let fs = require('fs');

let boards = Array();

let playerAmount = 0;

let selectedCards = Array();

let server = require("http").Server(app);

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
                deck.push(generateCard(i, 6));
                continue;
            }
            deck.push(generateCard(i, 5));
            continue;
        }
        // On test si la valeur est divisible par 5 car 5, 15 , 25 ... ont 2 de malus
        if(i%5 === 0){

            // il faut par contre tester que la valeur n'est pas divisible par 10 car sinon le malus pour 
            // 10, 20, 30 ... est de 3
            if(i%10 === 0){
                deck.push(generateCard(i, 3));
                continue;
            }
            // Sinon c'est que c'est 5,15,25 forcémeent
            deck.push(generateCard(i, 2))
            continue;

        }

        deck.push(generateCard(i, 1));

    }
	
	//mélange l'array
	for(let j, x, i = deck.length; i; j = parseInt(Math.random() * i), x = deck[--i], deck[i] = deck[j], deck[j] = x); 
	
	return deck;
	
}

function generateCard(value, malus){

    let card = new Object();
    card.value = value;
    card.malus = malus;

    return card;

}

//pioche une carte et la retire du packet
function draw(deck){
	
	let card = deck[0];
	deck.shift();
	
	return card;
	
}

//Créer un tableau vide
function generateBoard(){
    let board = [  
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

    let hand = [];

    for(let indexHand=0;indexHand<10;indexHand++)
        hand.push(draw(deck));

    return hand;
}


function putCards(cards, board){

    //on commence par trier les cartes par ordre croissant
    cards.sort(function (a, b) {
        return a.value - b.value;
    });
   
    
    let cardValue;
    let higherThanCard;
    let row;

    // Cette première boucle parcourt uniquement les cartes
    for(cardIndex = 0; cardIndex < cards.length; cardIndex++){

        cardValue = cards[cardIndex].value;
     
        higherThanCard = 0;
        row = -1;

        // Cette boucle parcourt les 4 lignes du board
        for(boardLine = 0; boardLine < board.length; boardLine++){

            let lastCardValue = board[boardLine][board[boardLine].length - 1].value;
            // Ici on est sensé voir la dernière carte de la ligne en cours
      
            

            //Si la carte que souhaite posé le joueur est plus grande que la dernière carte de la ligne
            if(cardValue > lastCardValue){

             
                // Ici on sera d'obtenir à la fin du parcours entier du board la carte la plus proche de celle du joueur à la fin du parcours
                if(lastCardValue > higherThanCard){

                    row = boardLine;
                    higherThanCard = lastCardValue;
                    
                }

            }
            


        }

        board[row].push(cards[cardIndex]);
    
        //si c'est la 6ème, on gère les points
        if (board[row].length >= 6) {
            board[row] == Array();
            board[row][0] = cards[cardIndex];
        }


    }

    return board;
}


console.log('Serveur on');



// Chargement du fichier public (style)
console.log(__dirname)
app.use(express.static(__dirname + '/public'));

// Chargement du fichier d'index

app.use("/", (req, res) => {
    res.render("main");
});


// Chargement de socket.io

let io = require('socket.io').listen(server);




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
        

        selectedCards.push(socket.hand[carteChoisie]);

        socket.hand.splice(carteChoisie, 1);
        if (selectedCards.length == playerAmount) {
    

          boards[socket.room] = putCards(selectedCards, boards[socket.room]);
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

          selectedCards = Array();
        }
    });





    //on attend que les joueurs soient prêts
    socket.on('ready', function () {

        socket.ready = 1;

        let currentRoom = socket.room;
        let joueurRoom = 0;
        let playerRoomReady = 0;

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
          let deck = generateDeck();

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
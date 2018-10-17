let http = require('http');

let express = require('express');

let app = express();

app.set('view engine', 'ejs');

let fs = require('fs');

let boards = Array();
let playerAmount = Array()
let selectedCards = Array();

let server = require("http").Server(app);

let deckModule = require('./src/deck.js');
let boardModule = require('./src/board.js');
let playerModule = require('./src/player.js');

console.log('Serveur on');



app.use(express.static(__dirname + '/public'));

// Chargement du fichier d'index

app.use("/", (req, res) => {
    res.render("main");
});


// Chargement de socket.io

let io = require('socket.io').listen(server);


io.sockets.on('connection', function (socket, player) {

    //on demande le pseudo au player et on récupère sa room
        socket.on('nickname', function(player) {
                socket.room = player.room;
                socket.pseudo = player.pseudo;

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

    socket.on('cardChosen', function (cardChosen) {        

        
      
        selectedCards[socket.room].push(socket.hand[cardChosen]);

        socket.hand.splice(cardChosen, 1);


        if (selectedCards[socket.room].length == playerAmount[socket.room]) {
    

          boards[socket.room] = boardModule.putCards(selectedCards[socket.room], boards[socket.room]);
          //on récupère les joueurs connectés à la pièce
          Object.keys(io.sockets.sockets).forEach(function(socketId) {
            let socket = io.sockets.connected[socketId];

            socket.cardChosen = -1;
            //on prend seulement les joueurs de la room


            socket.emit("init", {
              hand: socket.hand,
              board: boards[socket.room]
            });

            //Si la partie est finie aka si la main est vide
            if (socket.hand.length == 0){
              //on reset le board
              board[socket.room]= [
                Array(),
                Array(),
                Array(),
                Array()
              ]
              //on reset la main
              socket.hand= Array();
              //on préviens le client que la partie est finie
              socket.emit("end");
            }

          });

          selectedCards[socket.room] = Array();
        }
    });





    //on attend que les joueurs soient prêts
    socket.on('ready', function () {

        socket.ready = 1;

        let currentRoom = socket.room;
        let joueurRoom = 0;
        let playerRoomReady = 0;
        selectedCards[socket.room] = Array();

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
        playerAmount[socket.room] = playerRoomReady;
        // Quand 2 à 10 joueurs sont prêts go.
        if (joueurRoom == playerAmount[socket.room] && playerAmount[socket.room] >= 2 && playerAmount[socket.room] <= 10) {
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
          let deck = deckModule.generateDeck();

          //on créer un tableau de jeu
          boards[socket.room] = boardModule.generateBoard();

          //on pose les 4 premières cartes
          boardModule.init_board(boards[socket.room], deck);

          //on récupère les joueurs connectés à la pièce
          Object.keys(io.sockets.sockets).forEach(function(socketId) {
            let socket = io.sockets.connected[socketId];

            //on prend seulement les joueurs de la room
            if (socket.room == currentRoom) {
              //on génère la main
              socket.hand = playerModule.generateHand(deck);

              //on envoie la main et le tableau au player
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
                playerAmount[socket.room] +
                " / " +
                joueurRoom +
                " joueurs prêts )<br>"
            );
          //envoi au client
            socket.emit("room_chat", "vous êtes prêt, la partie commencera quand tous les joueurs présents seront prêts ( " + playerAmount[socket.room] + " / " + joueurRoom + " joueurs prêts )<br>");
        }
    }); 
});

server.listen(8080);
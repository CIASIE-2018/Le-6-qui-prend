
let http = require('http');

let express = require('express');

let app = express();

app.set('view engine', 'ejs');

let fs = require('fs');

//Array taking in parameter the name of the room
let boards = [];
let playerAmount = [];
let selectedCards = [];
let nbSelectedCards = [];
let boardHistory = [];


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
                socket.cardChosen = -1;

                //on rejoint la salle et on envoie un message dans le salon (et la console)
                socket.join(socket.room);
                socket.broadcast.to(socket.room).emit('room_chat',socket.pseudo + " rejoint la salle.<br>");
                console.log(socket.pseudo +' rejoint la salle ' + socket.room);
        });

    //on attend de recevoir des messages
    socket.on('general_chat',function(message){
        io.emit('general_chat',"<b>" + socket.pseudo + "</b> : " +message+"<br>"); //envoi le message à tout le monde
    });

    socket.on('room_chat',function(message){
        io.in(socket.room).emit('room_chat',"<b>" + socket.pseudo + "</b> : " +message+"<br>"); //envoi le message à tout le monde dans la salle room_chat
    });

    socket.on('cardChosen', function (cardChosen) {  
      
        let currentRoom = socket.room;

        //si on choisi une carte pour la première fois ce tour ci, on incrémente le nb de cartes jouées
        if (socket.cardChosen === -1 && cardChosen !== -1){
          nbSelectedCards[socket.room] += 1;
        }
        
        socket.cardChosen = cardChosen; 
        
        //une fois que chacun à choisi une carte
        if (nbSelectedCards[socket.room] == playerAmount[socket.room]) {

          Object.keys(io.sockets.sockets).forEach(function(socketId) {
            if (socket.room == currentRoom){
              let socket = io.sockets.connected[socketId];
          
              
              //on retire la carte jouée par chaque joueur de leur main
              selectedCards[socket.room].push(socket.hand[socket.cardChosen]);
              socket.hand.splice(socket.cardChosen, 1);
            }
          });
          
          
          let boardAndHistory = boardModule.putCards(selectedCards[socket.room], boards[socket.room])

          boards[socket.room] = boardAndHistory.board;
          boardHistory[socket.room] = boardAndHistory.history;
         
        
          //on récupère les joueurs connectés à la pièce
          Object.keys(io.sockets.sockets).forEach(function(socketId) {
            let socket = io.sockets.connected[socketId];
            if (socket.room == currentRoom){

              //on reset la carte choisie
              socket.cardChosen = -1;

              socket.emit("newTurn", {
                hand: socket.hand,
                board: boards[socket.room],
                graveyard: socket.graveyard,
                history : boardHistory[socket.room] 
              });

              //Si la partie est finie aka si la main est vide
              if (socket.hand.length == 0){
                //on reset le board
                boards[socket.room]= [
                  [],
                  [],
                  [],
                  []
                ]

                socket.ready = 0;
                //on reset la main
                socket.hand= Array();
                //on prévient le client que la partie est finie
                socket.emit("end");
              }
            }
          });

          //reset des variables à chaque fin de tour
          nbSelectedCards[socket.room] = 0;
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
        nbSelectedCards[socket.room] = 0;

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

              socket.hand = playerModule.generateHand(deck, socket.id);
              socket.graveyard = 0;

              socket.emit("newTurn", {
                hand: socket.hand,
                board: boards[socket.room],
                graveyard: socket.graveyard
              });
            }
          });
        }
    }); 
});

server.listen(8080);
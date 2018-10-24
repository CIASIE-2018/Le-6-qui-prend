
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
let ais = [];


let server = require("http").Server(app);
let session = require('express-session');
let cookieParser = require('cookie-parser');

let deckModule = require('./src/deck.js');
let boardModule = require('./src/board.js');
let playerModule = require('./src/player.js');

const parser = require('body-parser');
const router = require('./src/routes/router.js');

// Chargement de socket.io
let io = require('socket.io').listen(server);
console.log('Serveur on');

app.use(express.static(__dirname + '/public'));
app.use(parser.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
router.setRoutes(app);

io.sockets.on('connection', function(socket, player) {
    //on demande le pseudo au player et on récupère sa room
<<<<<<< HEAD
    socket.on('nickname', function(player) {
        socket.room = player.room;
        socket.pseudo = player.pseudo;
        //on rejoint la salle et on envoie un message dans le salon (et la console)
        socket.join(socket.room);
        socket.emit('room_chat', "Vous venez de rejoindre le salon " + socket.room + ".<br>");
        socket.broadcast.to(socket.room).emit('room_chat', socket.pseudo + " rejoint la salle.<br>");
    });
    //on attend de recevoir des messages
    socket.on('general_chat', function(message) {
        io.emit('general_chat', socket.pseudo + ": " + message + "<br>"); //envoi le message à tout le monde
    });
    socket.on('room_chat', function(message) {
        io.in(socket.room).emit('room_chat', socket.pseudo + ": " + message + "<br>"); //envoi le message à tout le monde dans la salle room_chat
    });
    socket.on('carteChoisie', function(carteChoisie) {
        selectedCards.push(socket.hand[carteChoisie]);
        socket.hand.splice(carteChoisie, 1);
        if (selectedCards.length == playerAmount) {
            boards[socket.room] = boardModule.putCards(selectedCards, boards[socket.room]);
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

=======
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
          
          let result = boardModule.putCards(selectedCards[socket.room], boards[socket.room]);
          boards[socket.room] = result.board;
          let malusPlayers = result.malus;
          boardHistory[socket.room] = result.history;
          
          //on récupère les joueurs connectés à la pièce
          Object.keys(io.sockets.sockets).forEach(function(socketId) {
            let socket = io.sockets.connected[socketId];
            
            if (socket.room == currentRoom){

              //si malus on affecte
              if (malusPlayers){
                Object.keys(malusPlayers).forEach(function(key, index){
                  if (socket.id == key)
                    socket.graveyard += malusPlayers[key]
                })
              }
                
              //on reset la carte choisie
              socket.cardChosen = -1;

              socket.emit("newTurn", {
                hand: socket.hand,
                board: boards[socket.room],
                graveyard: socket.graveyard,
                history : boardHistory[socket.room],
                playerInRoom : playerInRoom,
                cardPlayed: selectedCards[socket.room]
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

                let winner = [];
                let max = 1000;
                Object.keys(io.sockets.sockets).forEach(function(socketId) {
                  if (socket.room == currentRoom){
                    let socket = io.sockets.connected[socketId];
                    if (socket.graveyard < max){
                      winner = [socket.pseudo];
                      max = socket.graveyard;
                    }
                    else if (socket.graveyard = max){
                      winner.push(socket.pseudo);
                    }
                  }
                });

                //on prévient le client que la partie est finie (avec un petit décalage)
                setTimeout(function(){
                  socket.emit("end", {
                    winner: winner,
                    score: max
                  });
                },10000);
              }
            }
          });

          //reset des variables à chaque fin de tour
          nbSelectedCards[socket.room] = 0;
          selectedCards[socket.room] = Array();
        }
    });

    // Même principe que cardChosen mais on n'a pas besoin de parcourir les sockets, seulement les ia et la socket actuel.
    socket.on('cardChosenTraining', function (cardChosen) {  


      if (socket.cardChosen === -1 && cardChosen !== -1){
        nbSelectedCards[socket.room] += 1;
      }
      
      socket.cardChosen = cardChosen; 

      //ici on gère les cartes jouées par chaques IA
      ais[socket.room].forEach(function(ai){
        ai.cardChosen = 0;
        selectedCards[socket.room].push(ai.hand[ai.cardChosen]);
        ai.hand.splice(ai.cardChosen);
      })

      //on retire la carte jouée par le joueur
      selectedCards[socket.room].push(socket.hand[socket.cardChosen]);
      socket.hand.splice(socket.cardChosen, 1);

      let result = boardModule.putCards(selectedCards[socket.room], boards[socket.room]);
      boards[socket.room] = result.board;
      let malusPlayers = result.malus;
      boardHistory[socket.room] = result.history;

      //on affecte le malus au joueur
      if (malusPlayers[socket.id]){
        socket.graveyard += malusPlayers[socket.id]
      }
      socket.cardChosen = -1;
        
      //on affecte les malus aux AI
      ais[socket.room].forEach(function(ai) {

        if (malusPlayers[ai.id]){
          ai.graveyard += malusPlayers[ai.id];
          ai.cardChosen = -1;
        }
      });

      socket.emit("newTurn", {
        hand: socket.hand,
        board: boards[socket.room],
        graveyard: socket.graveyard,
        history : boardHistory[socket.room],
        cardPlayed: selectedCards[socket.room]
      });

      //Si la partie est finie aka si la main est vide
      if (socket.hand.length == 0){
              //on reset le board
        boards[socket.room]= [[],[],[],[]]
        socket.ready = 0;
        socket.hand= Array();

        let winner = [];
        let max = 1000;
        ais[socket.room].forEach(function(ai) {
          if (ai.graveyard < max){
            winner = [ai.pseudo];
            max = ai.graveyard;
          }
          else if (ai.graveyard = max){
            winner.push(ai.pseudo);
          }   
        });

        if (socket.graveyard < max){
          winner = [socket.pseudo];
          max = socket.graveyard;
        }
        else if (socket.graveyard = max){
          winner.push(socket.pseudo);
        }   

        setTimeout(function(){
          socket.emit("end", {
            winner: winner,
            score: max
          });
        },10000);
      }
      nbSelectedCards[socket.room] = 0;
      selectedCards[socket.room] = Array();  
    });

  

>>>>>>> d120836605bdf5f01381d6e86a8ebcefd34502b3
    //on attend que les joueurs soient prêts
    socket.on('ready', function() {
        socket.ready = 1;
<<<<<<< HEAD
        let currentRoom = socket.room;
        let joueurRoom = 0;
        let playerRoomReady = 0;
=======
        socket.training = 0;

        let currentRoom = socket.room;
        let joueurRoom = 0;
        let playerRoomReady = 0;
        selectedCards[socket.room] = Array();
        nbSelectedCards[socket.room] = 0;

>>>>>>> d120836605bdf5f01381d6e86a8ebcefd34502b3
        //on attend que les joueurs de la pièce soient tous prêt
        Object.keys(io.sockets.sockets).forEach(function(socketId) {
            let socket = io.sockets.connected[socketId];
            if (socket.room == currentRoom) {
                joueurRoom = joueurRoom + 1;
                if (socket.ready == 1) {
                    playerRoomReady = playerRoomReady + 1;
                }
            }
        });
        playerAmount[socket.room] = playerRoomReady;
        // Quand 2 à 10 joueurs sont prêts go.
<<<<<<< HEAD
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
                    playerAmount +
                    " / " +
                    joueurRoom +
                    " joueurs prêts )<br>"
                );
            //envoi au client
            socket.emit("room_chat", "vous êtes prêt, la partie commencera quand tous les joueurs présents seront prêts ( " + playerAmount + " / " + joueurRoom + " joueurs prêts )<br>");
        }
    });
=======
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

              socket.hand = playerModule.generateHand(deck, socket.id, socket.pseudo);
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

  socket.on('training', function () {

    socket.training = 1;

    let currentRoom = socket.room;
    selectedCards[socket.room] = Array();
    nbSelectedCards[socket.room] = 0;

    //on créer un deck
    let deck = deckModule.generateDeck();

    //on créer un tableau de jeu
    boards[socket.room] = boardModule.generateBoard();

    //on pose les 4 premières cartes
    boardModule.init_board(boards[socket.room], deck);

    ais[socket.room] = []

    //on simule des joueurs
    let nbAi = 3;
    for (let indexAi = 0; indexAi < nbAi; indexAi ++){
      let ai = {
        id: 'ia'+ indexAi,
        pseudo: 'ia ' + (indexAi + 1),
        graveyard: 0
      }
      ai.hand = playerModule.generateHand(deck, ai.id, ai.pseudo);
      ais[socket.room].push(ai)
    }

    socket.hand = playerModule.generateHand(deck, socket.id, socket.pseudo);
    socket.graveyard = 0;

    socket.emit("newTurn", {
      hand: socket.hand,
      board: boards[socket.room],
      graveyard: socket.graveyard,
    });
  
});
>>>>>>> d120836605bdf5f01381d6e86a8ebcefd34502b3
});

server.listen(8080);
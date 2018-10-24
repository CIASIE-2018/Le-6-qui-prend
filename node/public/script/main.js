//Carte choisie par le player
let cardChosen = -1;
let choixValider = false;
let room;
let socket;
let player;
let chooseForMeFunction;

if (window.location.pathname == "/") {
    room = prompt('Entrez le nom du salon à créer/rejoindre');
    window.location.replace(window.location.href + room);
} else {

    socket = io.connect('http://localhost:8080');

    // On créer un player
    player = {};

    // On demande le pseudo au visiteur...
    player.pseudo = prompt('Quel est votre pseudo ?');
    player.room = window.location.pathname;

    //on envoie le pseudo au serveur
    socket.emit('nickname', player);

    //on attend les messages dans les 2 chats
    socket.on('general_chat', function (message) {
        let tchat = $('.chats');
        if(tchat.is(":hidden")){
            $('#alertMessage').show(200);
        }
        $('.general_content').append(message)
    });

    socket.on('room_chat', function (message) {
        let tchat = $('.chats');
        if(tchat.is(":hidden")){
            $('#alertMessage').show(200);
        }
        $('.room_content').append(message)
    });

    //on attend le signal init du serveur qui envoie la main et le board
    socket.on('newTurn', function (newTurn) {
        
    $('body').off('click', "#chooseForMe");
        $('body').on('click',"#chooseForMe",function () {
            
            // Liste de toutes les possibilités
            let possibilities = [];
            newTurn.hand.forEach((card, cardIndex) => {

                newTurn.board.forEach((row, index) => {
                
                    let tmpDifference = card.value - row[row.length - 1].value;

                    let tmpMaxCardsValue = row[row.length - 1].value;

                    let tmpNumberOfCardsOnLine = row.length;

                    let indexCard = cardIndex;
                    
                    possibilities.push({
                        difference: tmpDifference,
                        maxValue: tmpMaxCardsValue,
                        nbCardsLine: tmpNumberOfCardsOnLine,
                        card: indexCard,
                        malus: card.malus
                    })            
                });
            });


            


            const scoreDifference = (difference, nbCartes) => { // 100 indexed
                let diff = (difference / 10);

                if(difference < 5 - nbCartes){

                    return 100 - diff;
                }
                if(difference < 4){
                    return 70 - diff;
                }

                if(difference > 3 && difference <= 25){
                    return 40  - diff;
                }
                if(difference > 25 && difference <= 40 ){
                    return 20 - diff;
                }
                return 10 - diff;
            };

            const scoreNbCards = (nbCartes) => { // Index 100

                if(nbCartes + newTurn.playerInRoom <6){
                    return 100;
                }
                if (nbCartes = 1){
                    return 60;
                }
                if(nbCartes = 2){
                    return 40
                }
                if(nbCartes = 3){
                    return 20;
                }
                return 5;
            }

            // Si aucune Carte ne peut être placé
            const BestCardToReplaceARow = () => {
                return newTurn.hand.length-1;
            }
            possibilities = possibilities
                .filter(function (possibility) {
                    return possibility.difference > 0 && possibility.nbCardsLine < 5;
                });
            
            if(possibilities.length == 0){
                possibilities = {indexCard: BestCardToReplaceARow()};
              
                $("handPlayer_" + possibilities.indexCard).click();
            }
            else{
                const scores = possibilities
                    .map(function (possibility) {
                        return {
                            indexCard: possibility.card,
                            score: 1000 +
                            ((possibility.malus * 4 * 0.5) -
                            (possibility.maxValue * 0.6) +
                            (scoreNbCards(possibility.nbCardsLine) * 1.2) +
                            (scoreDifference(possibility.difference, possibility.nbCardsLine) * 1.1))
                        };
                    })
                    .sort(function (a, b) {
                    return b.score - a.score;
                });
           

                $("handPlayer_" + scores[0].indexCard).click();
            }
            
            
           


        });
        //On remet le bouton "valider choix" a enabled
        $("#validerChoix").prop("disabled", false);

        //on parcours le board pour l'afficher

        //si il y a un historique (si pas le premier tour)
        if (newTurn.history){
            
            newTurn.history.forEach((history,index) => {
                setTimeout(function(){
                    for (let row = 0; row < 4; row++) {
                        for (let col = 0; col < 6; col++) {
                            if (!newTurn.history[index][row][col]) {
                                $('.l' + (row + 1) + 'col' + (col + 1)).html("");
                            }
                            else {
                                let img = document.createElement("img");
                                img.alt = '';
                                img.src = 'src/' + newTurn.history[index][row][col].value + '.png';
                                $('.l' + (row + 1) + 'col' + (col + 1)).html(img);
                            }
                        }
                    }
                },
                index * 1500)
            });
        }
        else{
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 6; col++) {
                    if (!newTurn.board[row][col]) {
                        $('.l' + (row + 1) + 'col' + (col + 1)).html("");
                    }
                    else {
                        let img = document.createElement("img");
                        img.alt = '';
                        img.src = 'src/' + newTurn.board[row][col].value + '.png';
                        $('.l' + (row + 1) + 'col' + (col + 1)).html(img);
                    }
                }
            }
        }

        $('.graveyard').html("Score : " + newTurn.graveyard);

        $('.hand').html("");
        //on parcours la main pour l'afficher
        newTurn.hand.forEach((card, index) => {

            let div = document.createElement("div");
            let img = document.createElement("img");

            div.id = 'handPlayer_' + index;
            div.className = 'handPlayer';

            img.src = 'src/' + card.value + '.png';
            img.alt = '';
            div.append(img);
            $('.hand').append(div);

        });
    });

    //fin de partie
    socket.on('end', function () {
        $('.hand').html("");
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 6; col++) {
                $('.l' + (row + 1) + 'col' + (col + 1)).html("");
            }
        }
        $('#ready').show();
        $('#titleReady').show();
    });

    // Evenement quand on clique sur une des cartes
    $('body').on("click", ".handPlayer", function () {
        $(".handPlayer").removeClass("cardChoice");
        $(this).addClass("cardChoice");
        cardChosen = this.id.match(/\d+/g).map(Number);
    });

    $("#validerChoix").click(function () {
        //test si aucune carte n'est choisie
        if (cardChosen != -1) {
            socket.emit('cardChosen', cardChosen);
            //On "bloque" le bouton après validation
            $("#validerChoix").prop("disabled", true);
        }
    });

    


    //quand click sur ready on indique au serveur qu'on est prêt
    $('#ready').click(function () {
        socket.emit('ready', '1');
        $('#ready').hide();
        $('#titleReady').hide();
        $('#validerChoix').show();
        $('#chooseForMe').show();
    });

    //TCHAT
    //Affichage ou non du tchat
    $('#showHideBtn').click(function() {
        let tchat = $('.chats');
        if(tchat.is(":visible")){
            $('.chats').hide(200);
        }else{
            $('.chats').show(200);
            $('#alertMessage').hide(200);
        }
    });

    //envoi message
    $('.general_send').click(function () {
        let message = $('.general_input').val();
        socket.emit('general_chat', message);
        $('.general_input').val("");
    });

    //Envoi message via Entrer
    $('.general_input').keypress(function(e){
        if(e.which == 13){
            let message = $('.general_input').val();
            socket.emit('general_chat', message);
            $('.general_input').val("");
        }
    });

    //envoi message
    $('.room_send').click(function () {
        let message = $('.room_input').val()
        socket.emit('room_chat', message);
        $('.room_input').val("");
    });

    //Envoi message via Entrer
    $('.room_input').keypress(function(e){
        if(e.which == 13){
            let message = $('.room_input').val()
            socket.emit('room_chat', message);
            $('.room_input').val("");
        }
    });

    $('.toggle_general_chat').click(function () {
        $(this).addClass("current_chat");
        $(".toggle_room_chat").removeClass("current_chat");
        $('#room_chat').hide();
        $('#general_chat').show();
    });

    $('.toggle_room_chat').click(function () {
        $(this).addClass("current_chat");
        $(".toggle_general_chat").removeClass("current_chat");
        $('#general_chat').hide();
        $('#room_chat').show();
    });
}

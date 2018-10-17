//Carte choisie par le player
let cardChosen = -1;
let choixValider = false;
let room;
let socket;
let player;

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
        $('.general_content').append(message)
    });

    socket.on('room_chat', function (message) {
        $('.room_content').append(message)
    });

    //on attend le signal init du serveur qui envoie la main et le board
    socket.on('newTurn', function (newTurn) {

        console.log(newTurn);

        //on parcours le board pour l'afficher
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 6; col++) {
                if (!newTurn.board[row][col]) 
                    $('.l' + (row + 1) + 'col' + (col + 1)).html("");
                else 
                    $('.l' + (row + 1) + 'col' + (col + 1)).html("<img src='src/" + newTurn.board[row][col].value + ".png' alt=''></img>");
            }
        }

        $('.hand').html("");
        //on parcours la main pour l'afficher
        newTurn.hand.forEach((card, index) => {

            $('.hand').append("<div class ='handPlayer' id = 'handPlayer_" + index + "'>" +
                "<img src='src/" + card.value + ".png' alt=''></img>" +
                "</div>");
        });
    });

    //fin de partie
    socket.on('end',function(){
        $('.hand').html("");
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 6; col++) {
                $('.l' + (col + 1) + 'col' + (row + 1)).html("");
            }
        }
    });

    // Evenement quand on clique sur une des cartes
    $('body').on("click", ".handPlayer", function () {

        $(".handPlayer").removeClass("cardChoice");
        $(this).addClass("cardChoice");
        cardChosen = this.id.match(/\d+/g).map(Number);
    });

    $("#validerChoix").click(function () {
        socket.emit('cardChosen', cardChosen);
    });


    //quand click sur ready on indique au serveur qu'on est prêt
    $('#ready').click(function () {
        socket.emit('ready', '1');
        $('#ready').remove();
    })

    //envoi message
    $('.general_send').click(function () {
        let message = $('.general_input').val();
        socket.emit('general_chat', message);
        $('.general_input').val("");
    });

    //envoi message
    $('.room_send').click(function () {
        let message = $('.room_input').val()
        socket.emit('room_chat', message);
        $('.room_input').val("");
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

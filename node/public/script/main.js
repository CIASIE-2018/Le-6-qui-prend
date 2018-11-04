let cardChosen = -1;
let choixValider = false;
let onMouseEnter;
let onMouseLeave;
let training = 0;

let socket = io.connect("localhost:8080");
socket.emit('join_room', { pseudo: pseudo, room: room });

function topPlayers() {
    $.ajax({
        url: "/topplayers/" + room,
        method: 'post',
        success: function(data) {
            data.sort((a, b) => {
                return a.score - b.score;
            });
            let i = 0;
            data.forEach(p => {
                i++;
                $('#top' + i).empty();
                $('#top' + i).append("<span>#" + i + "</span><span>" + p.pseudo + "</span><span>" + p.score + "</span>")
            });
        }
    });
}

//on attend les messages dans les 2 chats
socket.on('general_chat', function(message) {
    let tchat = $('.chats');
    if (tchat.is(":hidden")) {
        $('#alertMessage').show(200);
    }
    $('.general_content').append(message)
});
socket.on('room_chat', function(message) {
    let tchat = $('.chats');
    if (tchat.is(":hidden")) {
        $('#alertMessage').show(200);
    }
    $('.room_content').append(message)
});
//on attend le signal init du serveur qui envoie la main et le board
socket.on('newTurn', function(newTurn) {
    topPlayers();
    //Quand on passe la souris sur une carte de la main
    $('body').off('mouseenter');
    $('body').on('mouseenter', '.handPlayer', function() {
            //voir putcards
            let cardHovered = this.id.match(/\d+/g).map(Number);
            let cardValue = newTurn.hand[cardHovered].value
            let lastCardValue = 0;
            let selectedRow = -1;
            let higherThanCard = 0;
            newTurn.board.forEach((row, index) => {
                // Ici on est censé récuperer la dernière carte de la ligne en cours
                lastCardValue = row[row.length - 1].value;
                //Test si notre carte a une valeur supérieure ou non à la carte d'avant
                if (cardValue > lastCardValue) {
                    //Si la valeur est plus petite que celle précédente, alors cette place est la "mieux"
                    if (lastCardValue > higherThanCard) {
                        selectedRow = index;
                        higherThanCard = lastCardValue;
                    }
                }
            });
            if (selectedRow < 0 || selectedRow > 3 || selectedRow === -1) {
                let selectedRow = -1;
                let malusMin = 999;
                let malusLine;
                let highestValue = [];
                let malusCards = [];
                let malusCarsTMP;
                for (let row = 0; row < 4; row++) {
                    malusCardsTMP = [];
                    malusLine = 0;
                    for (let column = 0; column < newTurn.board[row].length; column++) {
                        malusLine += newTurn.board[row][column].malus;
                        malusCardsTMP.push(newTurn.board[row][column]);
                    }
                    if (highestValue[malusLine]) {
                        if (highestValue[malusLine] < newTurn.board[row][newTurn.board[row].length - 1].value) {
                            highestValue[malusLine] = newTurn.board[row][newTurn.board[row].length - 1].value;
                        }
                    } else {
                        highestValue[malusLine] = newTurn.board[row][newTurn.board[row].length - 1].value;
                    }
                    if (malusLine <= malusMin) {
                        malusMin = malusLine;
                        if (newTurn.board[row][newTurn.board[row].length - 1].value >= highestValue[malusMin]) {
                            selectedRow = row;
                            malusCards = malusCardsTMP;
                        }
                    }
                }
                $('.ligne' + (selectedRow + 1)).addClass('willRemoveRow');
            } else {
                $('.ligne' + (selectedRow + 1)).addClass('willPlaceOn');
            }
        })
        //Quand on enlève la souris d'une carte de la main
    $('body').off('mouseleave');
    $('body').on('mouseleave', '.handPlayer', function() {
        $('.board').children().removeClass('willPlaceOn');
        $('.board').children().removeClass('willRemoveRow');
    });
    $('body').off('click', "#chooseForMe");
    $('body').on('click', "#chooseForMe", function() {
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
            if (difference < 5 - nbCartes) {
                return 100 - diff;
            }
            if (difference < 4) {
                return 70 - diff;
            }
            if (difference > 3 && difference <= 25) {
                return 40 - diff;
            }
            if (difference > 25 && difference <= 40) {
                return 20 - diff;
            }
            return 10 - diff;
        };
        const scoreNbCards = (nbCartes) => { // Index 100
                if (nbCartes + newTurn.playerInRoom < 6) {
                    return 100;
                }
                if (nbCartes = 1) {
                    return 60;
                }
                if (nbCartes = 2) {
                    return 40
                }
                if (nbCartes = 3) {
                    return 20;
                }
                return 5;
            }
            // Si aucune Carte ne peut être placé
        const BestCardToReplaceARow = () => {
            return newTurn.hand.length - 1;
        }
        possibilities = possibilities
            .filter(function(possibility) {
                return possibility.difference > 0 && possibility.nbCardsLine < 5;
            });
        console.log(possibilities)

        if (possibilities.length == 0) {
            possibilities = { indexCard: BestCardToReplaceARow() };
            $(".handPlayer").removeClass("cardChoice");
            $("handPlayer_ " + possibilities.indexCard).addClass("cardChoice ");
            // cardChosen = this.id.match(/\d+/g).map(Number);
        } else {
            const scores = possibilities
                .map(function(possibility) {
                    return {
                        indexCard: possibility.card,
                        score: 1000 +
                            ((possibility.malus * 4 * 0.5) -
                                (possibility.maxValue * 0.6) +
                                (scoreNbCards(possibility.nbCardsLine) * 1.2) +
                                (scoreDifference(possibility.difference, possibility.nbCardsLine) * 1.1))
                    };
                })
                .sort(function(a, b) {
                    return b.score - a.score;
                });

            $(".hand > div").removeClass("cardChoice");
            $("#handPlayer_" + scores[0].indexCard).addClass("cardChoice ");
            cardChosen = scores[0].indexCard;

        }
    });
    //On remet le bouton "valider choix" a enabled
    $("#validerChoix").prop("disabled", false);

    if (10 - newTurn.hand.length != 0) {
        $('#historique').append("--- Tour " + (10 - newTurn.hand.length) + " --- <br>")
    }
    //si il y a un historique (si pas le premier tour)
    if (newTurn.history) {

        newTurn.cardPlayed.sort(function(a, b) {
            return a.value - b.value;
        });
        newTurn.history.forEach((history, index) => {
            setTimeout(function() {
                    for (let row = 0; row < 4; row++) {
                        for (let col = 0; col < 6; col++) {
                            if (!newTurn.history[index][row][col]) {
                                $('.l' + (row + 1) + 'col' + (col + 1)).html("");
                            } else {
                                let img = document.createElement("img");
                                img.alt = '';
                                img.src = '../src/' + newTurn.history[index][row][col].value + '.png';
                                $('.l' + (row + 1) + 'col' + (col + 1)).html(img);
                            }
                        }
                    }
                    $('#historique').append(newTurn.cardPlayed[index].playedByNickname + " a joué la carte " + newTurn.cardPlayed[index].value + "<br>")
                },
                index * 1500)
        });
    } else {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 6; col++) {
                if (!newTurn.board[row][col]) {
                    $('.l' + (row + 1) + 'col' + (col + 1)).html("");
                } else {
                    let img = document.createElement("img");
                    img.alt = '';
                    img.src = '../src/' + newTurn.board[row][col].value + '.png';
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
        img.src = '../src/' + card.value + '.png';
        img.alt = '';
        div.append(img);
        $('.hand').append(div);
    });
});
//fin de partie
socket.on('end', function(end) {
    if (end.winner.length == 1) {
        alert(end.winner[0] + " a gagné avec un score de " + end.score + ". Bien joué à lui.");
    } else {
        alert(end.winner.join(', ') + " sont nos gagnants d'aujourd'hui avec un score de " + end.score + ".  Bien joué à eux.")
    }

    $('.hand').html("");
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
            $('.l' + (row + 1) + 'col' + (col + 1)).html("");
        }
    }
    $('#ready').show();
    $('#training').show();
    $('#titleReady').show();
    $('#historique').html('');
});
// Evenement quand on clique sur une des cartes
$('body').on("click", ".handPlayer", function() {
    $(".handPlayer").removeClass("cardChoice");
    $(this).addClass("cardChoice");
    cardChosen = this.id.match(/\d+/g).map(Number);
});
$("#validerChoix").click(function() {
    //test si aucune carte n'est choisie
    if (cardChosen != -1) {
        //si training on procède différement
        if (training) {
            socket.emit('cardChosenTraining', cardChosen);
        } else {
            socket.emit('cardChosen', cardChosen);
            //On "bloque" le bouton après validation
            $("#validerChoix").prop("disabled", true);
        }
    }
});

//quand click sur ready on indique au serveur qu'on est prêt
$('#ready').click(function() {
    socket.emit('ready', '1');
    $('#ready').hide();
    $('#training').hide();
    $('#titleReady').hide();
    $('#validerChoix').show();
    $('#chooseForMe').show();
});
$('#training').click(function() {
    training = 1;
    socket.emit('training');
    $('#ready').hide();
    $('#training').hide();
    $('#titleReady').hide();
    $('#validerChoix').show();
    $('#chooseForMe').show();
});
//TCHAT
//Affichage ou non du tchat
$('#showHideBtn').click(function() {
    let tchat = $('.chats');
    if (tchat.is(":visible")) {
        $('.chats').hide(200);
    } else {
        $('.chats').show(200);
        $('#alertMessage').hide(200);
    }
});
//envoi message
$('.general_send').click(function() {
    let message = $('.general_input').val();
    socket.emit('general_chat', message);
    $('.general_input').val("");
});
//Envoi message via Entrer
$('.general_input').keypress(function(e) {
    if (e.which == 13) {
        let message = $('.general_input').val();
        socket.emit('general_chat', message);
        $('.general_input').val("");
    }
});
//envoi message
$('.room_send').click(function() {
    let message = $('.room_input').val()
    socket.emit('room_chat', message);
    $('.room_input').val("");
});
//Envoi message via Entrer
$('.room_input').keypress(function(e) {
    if (e.which == 13) {
        let message = $('.room_input').val()
        socket.emit('room_chat', message);
        $('.room_input').val("");
    }
});
$('.toggle_general_chat').click(function() {
    $(this).addClass("current_chat");
    $(".toggle_room_chat").removeClass("current_chat");
    $('#room_chat').hide();
    $('#general_chat').show();
});
$('.toggle_room_chat').click(function() {
    $(this).addClass("current_chat");
    $(".toggle_general_chat").removeClass("current_chat");
    $('#general_chat').hide();
    $('#room_chat').show();
});

//Scoreboard
$('#scoreboardBtn').click(function() {
    let scoreboard = $('#room_scoreboard');
    if (scoreboard.is(":visible")) {
        scoreboard.hide(200);
    } else {
        scoreboard.show(200);
    }
});
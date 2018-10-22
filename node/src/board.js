let playerModule = require("./player.js");

const generateBoard = function () {
    let board = [
        [],
        [],
        [],
        []
    ]
    return board;
};

//Initialise un tableau à partir de 4 cartes d'un deck
const init_board = function (board, deck) {
    board[0][0] = draw(deck);
    board[1][0] = draw(deck);
    board[2][0] = draw(deck);
    board[3][0] = draw(deck);
    return true;
};

//pioche une carte et la retire du packet
const draw = function (deck) {
    let card = deck[0];
    deck.shift();

    return card;
};

const putCards = function (cards, board) {
    //on commence par trier les cartes par ordre croissant
    cards.sort(function (a, b) {
        return a.value - b.value;
    });

    let cardValue;
    let selectedRow;
    let higherThanCard;
    let history = [];
    let malusPointForPlayer = [];

    // Cette première boucle parcourt uniquement les cartes
    cards.forEach((card) => {

        cardValue = card.value;
        lastCardValue = 0;
        selectedRow = -1;
        higherThanCard = 0;
        
        // Cette boucle parcourt les 4 lignes du board
        board.forEach((row, index) => {

            // Ici on est censé récuperer la dernière carte de la ligne en cours
            lastCardValue = row[row.length - 1].value;

            //Test si notre carte a une valeure supérieure ou non à la carte d'avant
            if (cardValue > lastCardValue) {
                //Si la valeur est plus petite que celle précédente, alors cette place est la "mieux"
                if (lastCardValue > higherThanCard) {
                    selectedRow = index;
                    higherThanCard = lastCardValue;
                }
            }
        });

        if (selectedRow < 0 || selectedRow > 3 || selectedRow === -1) {
            
            let resultTMP = getRowWithLowestMalusAndHighestValue(board)
            selectedRow = resultTMP.malusRow;
            
            malusPointForPlayer[card.playedBy] = playerModule.calculateMalus(resultTMP.malusCards);
            
            
            board[selectedRow] = [];
            board[selectedRow].push(card);
        } else {
            board[selectedRow].push(card);
        }

        //si c'est la 6ème, on gère les points
        if (board[selectedRow].length >= 6) {
            board[selectedRow] = [];
            board[selectedRow][0] = card;
        }
        
        //parsing and stringify object to clone it (otherwise it's always the same)
        history.push(JSON.parse(JSON.stringify(board)));
    });

    let board_History_Malus = {
        board: board,
        history: history,
        malus: malusPointForPlayer
    }

    return board_History_Malus;
};

const getRowWithLowestMalusAndHighestValue = function (board) {
    let selectedRow = -1;
    let malusMin = 999;
    let malusLine;
    let highestValue = [];
    let malusCards =[];
    let malusCarsTMP;
    for (let row = 0; row < 4; row++) {
        malusCardsTMP = [];
        malusLine = 0;
        for (let column = 0; column < board[row].length; column++) {
            malusLine += board[row][column].malus;
            malusCardsTMP.push(board[row][column]);
        }
        
        if(highestValue[malusLine]){
            if (highestValue[malusLine] < board[row][board[row].length - 1].value){
                highestValue[malusLine] = board[row][board[row].length - 1].value;
            }
        }else{
            highestValue[malusLine] = board[row][board[row].length - 1].value;
        }
      
        if (malusLine <= malusMin) {
            malusMin = malusLine;
            if (board[row][board[row].length - 1].value >= highestValue[malusMin]) {
                selectedRow = row;
                malusCards = malusCardsTMP;

            }
        }
    }
  
    return {malusRow: selectedRow, malusCards: malusCards};
};



module.exports = {
    generateBoard,
    init_board,
    putCards
};
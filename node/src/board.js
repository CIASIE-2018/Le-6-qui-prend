let playerModule = require("./player.js");
let deckModule = require("./deck.js");

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
    board[0][0] = deckModule.draw(deck);
    board[1][0] = deckModule.draw(deck);
    board[2][0] = deckModule.draw(deck);
    board[3][0] = deckModule.draw(deck);
    return true;
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
        if (card){
            //preventing odd behavior
            if (card.value){
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
            }
        }
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

function chooseCard(hand, board, playerInRoom){
    // Liste de toutes les possibilités
    let possibilities = [];
    hand.forEach((card, cardIndex) => {
        board.forEach((row, index) => {
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
            if (nbCartes + playerInRoom < 6) {
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
        return hand.length - 1;
    }
    possibilities = possibilities
        .filter(function(possibility) {
            return possibility.difference > 0 && possibility.nbCardsLine < 5;
        });

    if (possibilities.length == 0) {
        possibilities = { indexCard: BestCardToReplaceARow() };
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

        cardChosen = scores[0].indexCard;
        return cardChosen;
    }

}


module.exports = {
    generateBoard,
    init_board,
    putCards,
    chooseCard
};
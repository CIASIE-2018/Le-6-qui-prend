//Créer un tableau vide


    const generateBoard = function(){
        let board = [
            [],
            [],
            [],
            []
        ]
        return board;
    };

    //Initialise un tableau à partir de 4 cartes d'un deck
    const init_board = function(board, deck){
        board[0][0] = draw(deck);
        board[1][0] = draw(deck);
        board[2][0] = draw(deck);
        board[3][0] = draw(deck);
        return true;
    };

    //pioche une carte et la retire du packet
    const draw= function (deck) {
        let card = deck[0];
        deck.shift();

        return card;
    };

    const putCards= function(cards,board){
        //on commence par trier les cartes par ordre croissant
        cards.sort(function (a, b) {
            return a.value - b.value;
        });

        let cardValue;
        let higherThanCard;
        let selectedRow;

        // Cette première boucle parcourt uniquement les cartes
        cards.forEach((card) => {

            cardValue = card.value;

            higherThanCard = 0;
          

            // Cette boucle parcourt les 4 lignes du board
            board.forEach((row, index) => {

                // Ici on est sensé récuperer la dernière carte de la ligne en cours
                let lastCardValue = row[row.length - 1].value;
                
                if (cardValue > lastCardValue) {


                    //On cherche le meilleur endroit pour placer notre carte
                    if (lastCardValue > higherThanCard) {

                        selectedRow = index;
                        higherThanCard = lastCardValue;

                    }
                }
            });
   
            if(!selectedRow){
                
                selectedRow = getRowWithLowestMalusAndHighestValue(board);
   
                board[selectedRow] = [];
                board[selectedRow].push(card);
                
            }else{
                board[selectedRow].push(card);
            }


            
            //si c'est la 6ème, on gère les points
            if (board[selectedRow].length >= 6) {
                board[selectedRow] = [];
                board[selectedRow][0] = card;
            }
        });
        return board;
    };



    const getRowWithLowestMalusAndHighestValue = function (board) {
        let selectedRow = -1;
        let malusMin = 999;
        let malusLine;
        let highestValue = 0;
        for(let row = 0; row< 4; row++){
            
            malusLine = 0;
            for (let column = 0; column < board[row].length ; column++){
          
                malusLine += board[row][column].malus;
               
            }
     
            if(malusLine <= malusMin){
                
                if (board[row][board[row].length - 1].value > highestValue){
                    highestValue = board[row][board[row].length - 1].value;
          
                    malusMin = malusLine;
                    selectedRow = row;

                    
                }

            }
            
        }

        return selectedRow;
    };

    

module.exports = {
    generateBoard,
    init_board,
    draw,
    putCards
};
//Créer un tableau vide
let boardModule = {

    generateBoard: function(){
        let board = [
            Array(),
            Array(),
            Array(),
            Array()
        ]
        return board;
    },

    //Initialise un tableau à partir de 4 cartes d'un deck
    init_board: function(board, deck){
        board[0][0] = boardModule.draw(deck);
        board[1][0] = boardModule.draw(deck);
        board[2][0] = boardModule.draw(deck);
        board[3][0] = boardModule.draw(deck);
        return true;
    },

    //pioche une carte et la retire du packet
    draw: function (deck) {
        let card = deck[0];
        deck.shift();

        return card;
    },

    putCards: function(cards,board){
        //on commence par trier les cartes par ordre croissant
        cards.sort(function (a, b) {
            return a.value - b.value;
        });

        let cardValue;
        let higherThanCard;
        let row;

        // Cette première boucle parcourt uniquement les cartes
        for (cardIndex = 0; cardIndex < cards.length; cardIndex++) {

            cardValue = cards[cardIndex].value;

            higherThanCard = 0;
            row = -1;

            // Cette boucle parcourt les 4 lignes du board
            for (boardLine = 0; boardLine < board.length; boardLine++) {

                let lastCardValue = board[boardLine][board[boardLine].length - 1].value;
                // Ici on est sensé voir la dernière carte de la ligne en cours
                //Si la carte que souhaite posé le joueur est plus grande que la dernière carte de la ligne
                if (cardValue > lastCardValue) {


                    // Ici on sera d'obtenir à la fin du parcours entier du board la carte la plus proche de celle du joueur à la fin du parcours
                    if (lastCardValue > higherThanCard) {

                        row = boardLine;
                        higherThanCard = lastCardValue;

                    }
                }
            }
            // Si la carte ne peut pas être placée (Exemple sa carte est 1 donc aucune place pour elle), on supprime 
            // la ligne avec le moins de malus et on lui met pour lui et on place finalement sa carte.
            if(row === -1){
                
                row = boardModule.ligneASupprimer(board);
   
                board[row] = Array();
                board[row].push(cards[cardIndex]);
                
            }else{
                board[row].push(cards[cardIndex]);
            }


            
            //si c'est la 6ème, on gère les points
            if (board[row].length >= 6) {
                board[row] = Array();
                board[row][0] = cards[cardIndex];
            }
        }
        return board;
    },


    ligneASupprimer: function(board){
        let row = -1;
        let malusMin = 999;
        let malusLine;
        let HigherValue = 0;
        for(indexBoardi = 0; indexBoardi< 4; indexBoardi++){
            
            malusLine = 0;
            for (indexBoardj = 0; indexBoardj < board[indexBoardi].length ; indexBoardj++){
          
                malusLine += board[indexBoardi][indexBoardj].malus;
               
            }
     
            if(malusLine <= malusMin){
                
                if (board[indexBoardi][board[indexBoardi].length - 1].value > HigherValue){
                    HigherValue = board[indexBoardi][board[indexBoardi].length - 1].value;
          
                    malusMin = malusLine;
                    row = indexBoardi;

                    
                }

            }
            
        }

        return row;
    },

};
module.exports = boardModule;
let deckModule = require("./deck.js");

    const calculateMalus = function(cards) {
        let malus = 0;
        cards.forEach((card) => {
            malus += card.malus;
        });

        return malus;
    };

    //Créer une main à partir de 10 cartes d'un deck
    const generateHand = function(deck, player){
        let hand = [];

        for (let indexHand = 0; indexHand < 10; indexHand++){
            card = deckModule.draw(deck)
            card.playedBy = player;
            hand.push(card);
        }
        hand.sort(function (a, b) {
            return a.value - b.value;
        });

        return hand;
    };
    



module.exports = {
    generateHand,
    calculateMalus
};
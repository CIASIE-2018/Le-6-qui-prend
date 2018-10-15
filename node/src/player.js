let boardModule = require("./board.js");

let playerModule = {
    id: -1,
    pseudo: '',
    password: '',
    score: 0,
    room: undefined,
    //Créer une main à partir de 10 cartes d'un deck
    generateHand: function(deck) {
        let hand = [];
        for (let indexHand = 0; indexHand < 10; indexHand++)
            hand.push(boardModule.draw(deck));
        return hand;
    }
};

module.exports = playerModule;
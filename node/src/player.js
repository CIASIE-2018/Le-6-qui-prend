let boardModule = require("./board.js");

let playerModule = {
    
    //Créer une main à partir de 10 cartes d'un deck
    generateHand: function(deck){
        let hand = [];

        for (let indexHand = 0; indexHand < 10; indexHand++)
            hand.push(boardModule.draw(deck));

        return hand;
    }
    

};

module.exports = playerModule;
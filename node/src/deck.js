let deckModule = {

    generateCard: function(value,malus){
        let card = {
            value: value,
            malus: malus
        }
        return card;
    },

    //renvoie le deck mélangé
    generateDeck: function(){
        //génère une array de 1 à 104
        let deck = [];
        for (i = 1; i <= 104; i++) {

            // On test toutes les valeurs de cartes pour savoir le nombre de malus
            // On test les cartes qui sont divisibles par 11 qui ont un malus de 5
            if (i % 11 === 0) {

                // Sauf le 55 qui a un malus 6
                if (i === 55) {
                    deck.push(deckModule.generateCard(i, 6));
                    continue;
                }
                deck.push(deckModule.generateCard(i, 5));
                continue;
            }
            // On test si la valeur est divisible par 5 car 5, 15 , 25 ... ont 2 de malus
            if (i % 5 === 0) {

                // il faut par contre tester que la valeur n'est pas divisible par 10 car sinon le malus pour 
                // 10, 20, 30 ... est de 3
                if (i % 10 === 0) {
                    deck.push(deckModule.generateCard(i, 3));
                    continue;
                }
                // Sinon c'est que c'est 5,15,25 forcémeent
                deck.push(deckModule.generateCard(i, 2))
                continue;
            }
            deck.push(deckModule.generateCard(i, 1));
        }

        //mélange l'array
        for (let j, x, i = deck.length; i; j = parseInt(Math.random() * i), x = deck[--i], deck[i] = deck[j], deck[j] = x);

        return deck;
    },

    
};
module.exports = deckModule;
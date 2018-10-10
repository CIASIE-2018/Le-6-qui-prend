# Le-6-qui-prend
Groupe BERNARD Geoffroy BRIAND Lucas CORDIER Florian ROHRBACHER Léon

# Comment tester le jeu

## Setup
  + Installer nodeJs 
  + Cloner le repo
  + Se placer dans Le-6-qui-prend/node
  + Lancer la commande node app.js
  
## Test
  + Lancer au moins 2 clients à l'url localhost:8080
  + Indiquez le salon de jeu à rejoindre 
  + Indiquez votre pseudo
  + Pour commencer la partie, cliquez sur le bouton prêt sur tous les clients dans le salon
  + Pour jouer une carte, cliquez sur la carte à jouer puis cliquez sur le bouton Confirmer mon choix

# Règles du jeu

## Type de jeu
Jeu de cartes.


## Nombre de cartes

104 cartes numérotées de 1 à 104.

Chaque carte possède donc une valeur numérique (de 1 à 104) qui permettra de placer chaque carte dans le jeu et une valeur de "malus" de 1 à 7. Ces valeurs sont appellées "têtes de boeufs" et elles correspondent à des points de pénalités. Le but final du jeu est de récolter le moins de têtes de boeufs possibles.

## Préparation

On distribue 10 cartes à chaque joueur (de 2 à 10 joueurs). Une fois la distribution faite, on place les 4 prochaines cartes du paquet sur la table afin de former 4 rangées.

## Déroulement du jeu

### I. Mise en jeu des cartes.

Chaque tour, les joueurs choisissent une carte de leur jeu et la pose face cachée sur la table. Une fois tous les joueurs prêts nous retournons les cartes en même temps.

Celui qui a déposé la carte la plus faible commence et place sa carte dans une des 4 rangées selon des règles bien précises. Chaque joueur place ensuite sa carte et on répète le tour jusqu'à ce que les joueurs n'aient plus de carte.


### II. Comment placer sa carte

Règle 1 : Les cartes d'une série vont toujours dans l'ordre croissant (Ex: 12 14 16)
Règle 2 : Une carte doit toujours être déposée dans la série ou la différence entre la dernière carte et la nouvelle déposée est la plus faible.


Exemple de jeu correct: 


27  32  33  </br>
61 </br>
42  49 </br>
12  14  16 </br>


Exemple de jeu faux : 

27  32  33  49 </br>
61   </br>
42 </br>
12  14  16 </br>
(Ici le 49 devrait être placé sur la rangée du nombre 42)


### III. Encaissement des cartes

Tant que l'on peut déposer une carte dans une rangée tout va bien. 
Mais lorsqu'une rangée atteint 5 cartes. Celui qui va mettre la 6ème carte sur une rangée doit ramasser les 5 autres cartes et obtiendra donc les points de pénalités associés à celles-ci et sa 6ème carte forme alors le début d'une nouvelle rangée.


### IV. Exception

Si un joueur joue une carte plus faible que toutes les cartes disponibles exemple :

27 </br>
68 </br>
32 </br>
101 </br>

Si je joue la carte 12, je dois sélectionner une des 4 rangées pour prendre les points de pénalités de celle-ci et je place ma carte 12 à la place.

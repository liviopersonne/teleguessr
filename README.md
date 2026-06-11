# Teleguessr

## A Geoguessr clone for Telecom Paris

Ceci est un clone de Geoguessr fait pour contenir des images de l'intérieur de Télécom Paris et du plateau de Saclay.

Projet créé par TGC, association de jeux vidéo de Télécom Paris.

# Notes techniques

## Prendre des photos

Il faut utiliser une application spécifique pour prendre des photosphères

Ces applications ont été supprimées de l'app store, mais certaines apps sur des sites sombres marchent sur certains androids

> Appli qu'on a utilisé: BigKaka Cam

L'appli prend des photos gigantesques par défaut (8704 x 4352) il faut les réduire à (2872 x 1436) par exemple, pour éviter le lag

## Overview technique

Il y a 3 parties qui communiquent entre elles:

1. Le front-end: c'est le site `teleguessr.rezel.net`, l'interface graphique sur laquelle on joue
2. Le back-end: c'est la base de données `db.teleguessr.rezel.net`, sur laquelle sont stockées toutes les infos
3. L'api Google Maps: elle sert à faire apparaitre une carte interactive sur laquelle on peut placer notre pin en jeu

## Le front-end

C'est codé en Svelte avec des éléments de Typescript (Javascript), pour le run j'utilise `bun`, c'est un équivalent de `npm`

Pour lancer le front-end en dev, on peut faire: `bun run dev`

Pour lancer le front-end en prod, il faut d'apord compiler avec `bun run build` puis lancer avec `bun run start`

Les commandes bun sont définies dans le fichier `package.json`

Le front-end tourne par défaut sur le port 8090

### Choses à modifier

Il faut créer le fichier `frontend/.env`, créer les mêmes variables que `frontend/.env.example` et mettre:

- PUBLIC_PB_URL à http://localhost:8090 en dev et https://db.teleguessr.rezel.net en prod
- PUBLIC_MAPS_API_KEY à votre clé d'api Google Maps (voir la partie Google Cloud Console)

Attention à ne pas push ce fichier sur github (il est dans le .gitignore)

- `frontend/src/lib/game/result/result.ts` lignes 46 et 54, les variables `allowedOffset` indiquent la distance maximale qui donne 5000 points, vous pouvez la modifier si vous voulez

## Le back-end

C'est une base de données qui fonctionne avec pocketbase, dont l'exécutable est présent dans le dossier

Je peux vous fournir notre version de la db si vous voulez, sinon vous avez une version de base dans `backend/pb_data_example`

Pour lancer la db, il faut faire `./pocketbase serve` puis cliquer sur le lien admin affiché

Le compte admin est: id:myadmin@myemail.com, mdp:mypassword

Dans la db il y a des collections de plusieurs objets:

- `user`: Les utilisateurs du site (admin/non-admin, où ils ont guess, leur score, dans quelle game il sont)
- `game`: Les différentes parties disponibles sur le site (si elles sont visibles, à quel round elles en sont)
- `image`: Les images statiques dans le site (juste quelques logos)
- `link`: Les liens physiques entre les panoramas (non-utilisé)
- `map`: Les différents niveaux existants
- `panorama`: Les images des différents lieux avec leurs coordonnées
- `plane`: Les étages de Télécom avec leurs coordonnées et leur carte
- `world`: L'ensemble des panoramas existants

### Projet de lien entre les images

Au début, on voulait pouvoir se déplacer d'image en image pendant la partie, mais ça rendait le jeu beaucoup trop facile, et ça demandait trop de photos, donc on a décidé de retirer cette fonctionnalité. Il y a tout de même des restes de ça qu'il faut comprendre.

L'objet `link` est toujours présent dans la db, mais il est inutilisé et peut rester vide.

Dans un objet `map` il y a les attributs `world` et `places`, au début `world` correspondait justement à toutes les images entre lesquelles on pouvait jump pendant la partie, et les `places` étaient les lieux de spawn de chaque partie qu'il fallait deviner. Maintenant, `places` n'a pas changé mais `world` est en quelque sorte devenu inutile puisqu'on ne peut pas jump entre les images. Il faut cependant que **toutes les images dans `places` soient présentes dans le `world`**, sinon ça marche pas. En l'occurence, j'ai créé un gros `world` qui s'appelle "full world" et qui contient toutes les images.

### Quelques attributs importants

- `game.inProgress`: Vrai si la game est en cours, à noter que si une game est en cours, elle n'est plus visible sur le site (lorsque vous faites du dev, pensez à bien remettre ça à 0 après une game pour pouvoir la répéter)
- `game.round`: Le round actuel dans le niveau (en dev pensez à bien remettre ça à 0 après une game)
- `map.durationSecondes`: La durée qu'on a pour guess dans cette map, vous pouvez le modifier mais **40** c'était bien
- `map.modifier`: normal/nomove = on peut bouger, nmpz = no move pan zoom = on ne peut pas tourner ni zoomer (il me semble que ça marche pas mais vous pouvez essayer de jouer avec)
- `map.minDistanceMeter`: La distance à partir de laquelle on gagne des points, **300** c'était bien (**400** pour le round impossible)
- `map.minTelecomDistanceMeter`: Pareil mais pour les rounds à l'intérieur de Télécom, **70** c'était bien (**100** pour le round impossible)
- `panorama.height`: Mettre à l'étage correspondant (0-5) si l'image est dans Télécom, **-1** sinon (c'est pour doser le score, cf les 2 lignes au dessus)
- `panorama.centerHeading`: La direction vers laquelle on regarde quand on spawn (j'ai toujours laissé à 0, tout comme les variables suivantes de `panorama`)

### Comment remplir les coordonnées pour les images

Lorsque vous avez toutes les photos que vous voulez utiliser, il faut placer leurs coordonnées dans la db, la manière que je recommande de faire est:

- Pour les images à l'extérieur de Télécom, aller sur MyMaps, utilisez la vue satellite, et placez des pins en fonction des éléments géographiques, puis à la fin exportez tout en csv et reportez les coordonnées (attention les coordonnées peuvent être inversées lors de l'export)
- Pour les images à l'intérieur de Télécom:

1. Créez une `map` et une `game` avec ces images et un temps de guess de 9999 secondes
2. Lancez la game avec un compte admin
3. Pour chaque image, placer votre pin au bon endroit
4. Allez dans la db, rechargez la page, et regardez les coordonnées que vous avez choisi dans la collection `user`
5. Reportez les valeurs dans les données du `panorama`
6. Cliquez sur le bouton `next` situé juste au dessus de la carte pour les admin

(en vrai ça doit pas être trop compliqué d'ajouter un bouton admin qui modifie automatiquement la db)

## Le calcul du score

Pendant une partie, le score affiché bug, mais à la fin d'une partie il y a un scoreboard complet, vous pouvez le télécharger en format csv avec le bouton en haut à gauche.

Ensuite j'ai créé un google sheet où j'ai reporté les valeurs partie par partie, puis j'ai reporté les totaux et fait la somme sur une dernière page (avec le round impossible compte double). Vous pouvez voir ce document [ici](https://docs.google.com/spreadsheets/d/1mIQStI9lQJrkqjmPdq2wYTxGDWD1dC9ISAWNGtV-__0/edit?usp=sharing)

## L'api Google Maps

Pour intéragir avec l'api Google Maps, il faut créer un projet sur la [Cloud Console de Google](https://console.cloud.google.com/)

1. Connectez-vous à votre compte perso
2. Créez un projet Téléguessr
3. Tapez "Google Maps Platform" sur la barre de recherche
4. Activez les API si besoin, puis allez dans "Clés et identifiants"
5. Créez une clé d'API qui a accès à l'API "Maps JavaScript API" (ne partagez cette clé à personne !)
6. Dans les `Restrictions relatives aux applications`, choississez "Sites Web" et ne rajoutez pas de champ pour `Restrictions liées aux sites Web`
7. Ajoutez cette clé au fichier `frontend/.env`
8. Allez dans "Gestion des plans" et créez un ID de carte
9. Allez dans "Styles de carte" et créez le style de carte correspondant (j'ai gardé le style de base globalement)
10. Ajoutez votre id de carte dans le fichier `frontend/src/lib/game/guess/Guess.svelte` à la ligne 226
11. Activez le billing (connectez votre carte bleue) pour éviter que la map ait des couleurs bizarres

Normalement, vous avez 10000 requêtes gratuites par mois il me semble, mais en pratique on en utilise beaucoup moins (j'en ai utilisé 150 en tout) donc c'est gratuit !

## La VM

Pour host le site le jour de l'event, il faut utiliser une VM de Rezel, pour ce faire il faut demander une VM sur [hosting](https://hosting.rezel.net).

1 coeur de CPU suffit, et 2 Go de RAM suffisent.

Ensuite il faut ouvrir 2 ports sur la VM et les lier au reverse proxy et DNS de Rezel, normalement c'est à eux de s'en occuper mais ça va peut-être évoluer en 2027.

Globalement:

- Port 5173 (bun) -> `teleguessr.rezel.net`
- Port 8090 (pocketbase) -> `db.teleguessr.rezel.net` (on connecte la db au rproxy pour pouvoir y accéder depuis un navigateur)

Ensuite lors de l'event il faut se connecter en ssh à la VM pour lancer le front et back

## Récap des commandes à run

Lancer le back-end:

- dev: `./pocketbase serve`
- prod: `./pocketbase serve --http="0.0.0.0:8090"`

Lancer le front-end:

- dev: `bun run dev`
- prod: `bun run build` -> `bun run start` (qui run `PORT=5173 HOST=:: node build/index.js`)

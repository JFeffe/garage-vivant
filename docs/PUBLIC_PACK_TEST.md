# Essai local : public en pack

Cette version expérimentale est sur la branche locale `experiment/public-en-pack`, à partir de `BandLive_fix_12-10-26`. Elle n’est pas publiée. Les changements restent dans les fichiers de travail ; aucun commit ni push n’est nécessaire pour essayer le jeu.

## Ouvrir l’essai

Ouvrir `BandLive-test/LANCER-Public-pack.html` dans Chrome ou Edge. Choisir **Tester BandLive** ou **Tester le show classique**. Le bouton **Essai**, dans la petite barre du haut, permet de changer de scénario ou de recommencer. Ces scénarios utilisent des sauvegardes séparées de la partie normale et de l’ancien lanceur BandLive. Après une mise à jour du fichier, recharger la page conserve l’essai en cours.

Le scénario BandLive présente six musiciens et douze spectateurs, avec des cartes de proximité et des cartes initiales. Un spectateur doté d’**Onde de choc** commence à une résistance : le conquérir permet d’essayer rapidement une poussée. Les valeurs artificielles de ce scénario sont réservées au lanceur ; les nouveaux shows ordinaires commencent avec leur résistance normale.

Dans le show classique, cliquer **Lancer le show**. Le public de la grande scène se déplace sous les impacts et transmet les poussées par ses collisions. Pause, vitesse et replay restent disponibles.

## Scène dans une seule fenêtre

Les deux modes condensent leurs informations et commandes en haut. Il n’y a plus de barre en bas. La disposition ajuste la scène à la largeur **et** à la hauteur disponibles : musiciens, mains et public restent visibles sans défilement de la scène. Sur une fenêtre étroite, les musiciens BandLive sont répartis sur deux rangs.

Dans BandLive, **Fin du tour**, **Son** et **Cartes** restent directement accessibles. **Plus** contient Disposition, simulation, interruption, programmation et déroulement. Dans le show classique, **Plus** contient les changements de mode, la programmation, les commandes pour sauter le show et les cartes jouées. Les détails ouverts volontairement et les bilans peuvent défiler dans leur propre panneau ; la scène de jeu ne défile pas.

Les prévisualisations, les sprites et le glisser-déposer utilisent la même échelle que la scène. Un redimensionnement change uniquement l’affichage, pas les positions ou les règles de la foule.

## Règles à essayer

Le public est placé de façon irrégulière, sans rangées. Les positions appartiennent à la simulation, en coordonnées de scène, indépendantes de la taille de l’écran. Les mains des musiciens n’ont pas de collision avec le public.

| Effet | Règle du pack |
|---|---|
| Carte sur une personne | Cible une identité précise. |
| Ancienne carte de rangée | La cible et les personnes à proximité (rayon 125). |
| Carte collective / deux cibles | Ensemble du public / deux personnes distinctes, comme avant. |
| Éclat cuivré | Vérifie la présence d’une personne conquise proche au moment de jouer. |
| Se laisse entraîner | Mémorise une conquête proche pendant le tour ; le bonus reste acquis si les personnes sont séparées ensuite. |
| Onde de choc | 3 puissance dans le rayon proche ; pousse aussi les corps présents, y compris les personnes déjà conquises. |
| Vague d’enthousiasme | 2 puissance dans un rayon plus large (205). |
| Percée | Couloir de demi-largeur 48, à l’opposé du centre de la scène. Cibles ordonnées par distance ; traverse les conquises, continue après une nouvelle conquête, s’arrête au premier survivant. |
| Sous les projecteurs | Les personnes proches au déclenchement gardent +2 puissance subie jusqu’à la fin du tour. Non cumulable. |
| Chœur du public | Les personnes dans le rayon large gardent le style jusqu’à la fin de la chanson. |

Une carte fige ses cibles et sa puissance, puis les conquêtes et réactions se résolvent à ces positions. Les poussées et collisions se résolvent ensuite ; le public se stabilise avant l’action suivante. Les protections contre l’ennui et changements de style restent attachés aux personnes touchées.

Le preview utilise le même moteur que l’exécution sur une copie de l’état. Il montre les gains, les chaînes, les zones et les déplacements prévus en rose. La danse est visuelle et ne déplace pas les cibles pendant la visée. En mode Disposition, seuls musiciens et mains sont déplaçables dans les nouveaux shows.

Le show classique conserve sa lecture continue et ses cartes automatiques. Il utilise le même placement irrégulier et les mêmes corps circulaires, avec transmission de vitesse et séparation des corps. Ses impulsions musicales et réactions existaient déjà. Son pack est plus étalé pour éviter que tous les impacts couvrent trop de personnes.

## Sauvegardes et publication

Les nouveaux états portent `crowdVersion: 1`. Les anciennes répétitions et prestations sans ce marqueur gardent leurs rangées et leurs anciennes règles physiques, y compris en replay. La continuation d’une setlist conserve la version de physique du show initial. Aucune migration destructive du quartier n’est faite.

Pour intégrer cette expérience après validation humaine : relire le diff de la branche, préparer une nouvelle version et ses notes selon `CONTRIBUTING.md`, puis créer un commit et pousser la branche pour une PR. La fusion vers `main` constitue une étape distincte. Le numéro publié reste 0.7.20 pendant cet essai local.

## Reproduire et vérifier

```sh
npm ci
npm run docs:build
npm run crowd:test-file
npm test
npx playwright install chromium
npm run test:crowd
```

Les anciens tests de rangées utilisent explicitement `crowdPhysics: false` pour couvrir les anciennes sauvegardes. Les nouveaux tests couvrent les zones réelles, les réactions, les cinq conquêtes, les collisions, le preview exact, les sauvegardes et les replays, ainsi que les parcours navigateur ordinateur et tactile.

`tests/crowd-layout-browser.test.mjs` vérifie neuf fenêtres, de 1440 × 900 à 360 × 640 et 844 × 390 : personnes entièrement dans la fenêtre, absence de défilement interne/externe, visée alignée, jeu exact et conservation de l’état au redimensionnement. Le show classique est aussi vérifié avec six musiciens et vingt-quatre spectateurs, BandLive activé.

À observer pendant l’essai : lisibilité des statuts dans le pack, visibilité de la percée, ampleur des poussées, facilité de ciblage tactile et puissance des cartes de proximité. Les rayons et l’espacement sont un point de départ ; l’équilibrage complet des decks reste à évaluer avec des parties humaines.

## Choisir le mode au début du spectacle

À chaque arrivée sur scène, les commandes du haut proposent **Show classique** et **BandLive**, sans passer par Plus ni activer un réglage. Le choix est disponible avant la première chanson. Pour une formation ou une setlist incompatible, BandLive est désactivé et la raison est affichée. Chaque groupe suivant propose à nouveau le choix. Le spectacle BandLive utilise la réservation du groupe et applique ses résultats une seule fois dans la partie.

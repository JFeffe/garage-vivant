# BandLive · module expérimental local

BandLive relie les musiciens du quartier au spectacle jouable d’ENCORE. Activer **BandLive** dans **Réglages** fait apparaître son onglet et **Essayer BandLive** dans la préparation des Shows. L’option est désactivée par défaut et peut être retirée à tout moment.

Cette intégration est une répétition sans récompense utilisant les groupes actifs du quartier. Depuis **Groupes**, **Jouer avec BandLive** ouvre directement la préparation actuelle du groupe choisi, même après un import de quartier. Son nom, ses membres actuels et les compositions actives de son répertoire proviennent du monde. La formation libre et les chansons inventées pour le prototype ne sont plus proposées.

BandLive accepte **deux à six musiciens** du groupe. Ils sont tous sélectionnés par défaut jusqu’à six ; une case non cochée est désactivée lorsque six membres sont déjà choisis. Pour les groupes existants plus grands, choisir une formation de scène sans retirer de membres du quartier. La limite est aussi vérifiée par le moteur, pas seulement par l’interface.

Les identités, couleurs, instruments, styles et informations des musiciens proviennent du quartier. Leurs cartes restent liées à leur instrument : trois Note et deux cartes spéciales. Le décor de scène, les illustrations d’instruments, les accessoires des cubes et le son réutilisent ceux de Garage vivant.

## Jouer

- Choisir de **3 à 12 spectateurs** avant de prendre la scène. Trois restent sélectionnés par défaut. Un public plus grand augmente le défi sans changer les cartes, l’énergie ou les six tours.
- Chaque musicien apporte trois **Note** (1 énergie, 6 puissance sur une cible) et deux exemplaires de sa carte spéciale.
- La pioche est commune. Cinq cartes sont pigées au début de chaque tour, puis affichées sous leurs propriétaires. Chaque exemplaire est distinct.
- Le band dispose de trois points d’énergie par tour. Les cartes gratuites restent jouables à zéro énergie.
- Glisser une carte ciblée sur un spectateur. Déposer une carte collective ou de préparation dans la zone du public. Le glisser-déposer fonctionne à la souris et au toucher ; sélectionner une carte puis sa cible offre aussi un accès au clavier.
- Les noms, intentions et barres sont visibles. Les styles ont des symboles et une infobulle contenant seulement leur nom. Les informations détaillées des musiciens et du public s’ouvrent au survol ou au focus, sans fenêtre au clic.
- La fin du tour défausse toutes les cartes restantes, efface le bonus de prochaine puissance et remet l’énergie à trois. La défausse est remélangée quand la pioche est vide.
- À la victoire ou au dernier tour, **Retour au quartier · continuer** revient au menu Quartier et reprend la simulation à sa dernière vitesse non nulle, sans créer de nouveau monde. Le résultat du show reste enregistré ; **Rejouer la répétition** conserve le nombre de spectateurs.

| Instrument | Carte | Énergie | Effet |
|---|---|---:|---|
| Guitare | Solo | 2 | 8 puissance + tout le tempo sur une cible. Consomme le tempo. |
| Batterie | Pulsation | 1 | +4 tempo. |
| Basse | Soutien | 0 | +1 tempo et +3 à la prochaine carte de puissance du tour. |
| Chant | Refrain | 2 | 5 puissance sur chaque spectateur. |
| Clavier | Accord | 1 | +2 tempo et 2 puissance sur chaque spectateur. |
| Saxophone | Improvisation | 1 | Tout le tempo en puissance sur chaque spectateur. Consomme le tempo. |
| Trompette | Fanfare | 0 | +2 tempo. |
| Percussions | Roulement | 1 | +1 tempo et +5 à la prochaine carte de puissance du tour. |

Le tempo est commun, limité à dix comme dans ENCORE et conservé entre les tours. Le Solo et l’Improvisation en consomment la totalité. Les bonus de Soutien et de Roulement se cumulent ; une préparation ne les consomme pas. La prochaine carte de puissance les applique à chacune de ses cibles. Improvisation reste une carte de puissance même à zéro tempo.

## Chansons et public

Le public compte entre trois et douze spectateurs, disposés sur plusieurs rangées. Les trois premiers commencent avec 24, 20 et 25 résistance ; les suivants reprennent ces valeurs et les styles du répertoire. Conquérir **tout** le public gagne immédiatement. Les cartes collectives et les finales touchent tous les spectateurs encore à conquérir, quel que soit leur nombre. Deux passages de trois tours donnent six tours au maximum. **Toutes** les compositions actives possédées par le groupe sont proposées, avec leurs titres, styles, auteurs et maîtrises collectives. Choisir la première chanson au départ, puis une autre pour le deuxième passage. Si une seule chanson est disponible, la reprendre au deuxième passage conserve les six tours, sans fabriquer de morceau.

Sans groupe actif, la préparation donne accès à **Groupes** pour en créer un. Sans chanson active, elle invite à adopter une composition depuis ce même écran ; prendre la scène reste désactivé. Une chanson mise de côté ou possédée par un autre groupe n’est pas proposée. Les nouvelles répétitions relisent les membres, instruments et chansons actuels. Une répétition commencée conserve ses copies pour permettre la reprise du même tour.

Les règles restantes reprennent ENCORE : une chanson du style favori ajoute deux puissance ; **Attend un Solo** ajoute trois puissance à la carte Solo ciblée ; **S’ennuie** redonne trois résistance en fin de tour aux spectateurs non conquis. La finale de chaque chanson inflige trois puissance à tout le public avant l’ennui. Le départ de la deuxième chanson retire deux tempo. L’Improvisation du saxophone utilise le tempo, mais ne déclenche pas le bonus réservé à la carte Solo.

## Isolation et sauvegarde

Le moteur de BandLive et sa graine sont indépendants du moteur de spectacle classique et du hasard du quartier. La répétition prend des copies des musiciens et ne modifie ni leurs decks, ni leurs compétences, ni leurs besoins, ni les engagements ou la réputation. Le quartier attend dans l’onglet BandLive. La progression de répétition et son activation sont enregistrées séparément dans `garage-vivant-bandlive-v1`; recharger puis rouvrir BandLive reprend la même main et le même tour. Les sauvegardes et migrations du quartier n’ont pas changé.

Les nouvelles répétitions portent le format 2, l’identifiant du groupe et ceux des chansons sources. Les répétitions au format 1 restent lisibles, y compris leurs formations de plus de six musiciens et leurs chansons de prototype. Elles peuvent être terminées sans effacer leur progression. **Changer le band** prépare un autre groupe sans supprimer la répétition en cours : **Reprendre la répétition en cours** y revient avant de lancer la nouvelle scène. Un nouveau départ applique les groupes et la limite actuels.

Le calendrier continue d’utiliser les spectacles classiques. Le raccord des résultats de BandLive à une prestation réelle reste une étape ultérieure, après validation de la répétition. Aucun déploiement ou push n’est nécessaire pour tester ce module local.

## Validation

`npm test` inclut les règles BandLive : les huit cartes, tempo, bonus, cartes gratuites, cibles invalides, victoire, six tours, recyclage, reprise JSON, limite de six membres, reprise du format 1, répertoire complet, chanson unique, sélection actualisée, public de trois à douze, effets collectifs sur les rangées supplémentaires et isolation du monde. `npm run test:browser` inclut son parcours ordinateur et tactile : activation, accès depuis un groupe, compositions et auteurs, groupe de huit réduit à six sur scène, refus d’un septième membre, reprise d’une chanson, préparation sans perte de progression, états sans groupe/chanson, drag/drop, infobulles, sauvegarde des grands publics, retour au quartier après victoire ou fin de show, reprise de la simulation, désactivation et retour au spectacle classique. Les captures sont produites dans `test-results/`.

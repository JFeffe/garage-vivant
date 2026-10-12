# BandLive · module optionnel de spectacle

BandLive relie les musiciens du quartier au spectacle jouable d’ENCORE. Activer **BandLive** dans **Réglages** fait apparaître son onglet et **Essayer BandLive** dans la préparation des Shows. L’option est désactivée par défaut et peut être retirée à tout moment.

BandLive peut maintenant jouer un **vrai spectacle réservé**, avec les conséquences du calendrier, ou une **répétition sans récompense**. Les groupes actifs du quartier alimentent les deux parcours. Depuis **Groupes**, **Jouer avec BandLive** ouvre directement la préparation actuelle du groupe choisi, même après un import de quartier. Son nom, ses membres actuels et les compositions actives de son répertoire proviennent du monde. La formation libre et les chansons inventées pour le prototype ne sont plus proposées.

BandLive accepte **deux à six musiciens** du groupe. Ils sont tous sélectionnés par défaut jusqu’à six ; une case non cochée est désactivée lorsque six membres sont déjà choisis. Pour les groupes existants plus grands, choisir une formation de scène sans retirer de membres du quartier. La limite est aussi vérifiée par le moteur, pas seulement par l’interface.

Les identités, couleurs, instruments, styles et informations des musiciens proviennent du quartier. Leurs cartes restent liées à leur instrument : trois Note et deux cartes spéciales. Le décor de scène, les illustrations d’instruments, les accessoires des cubes et le son réutilisent ceux de Garage vivant.

## Jouer une répétition

- Choisir de **3 à 12 spectateurs** avant de prendre la scène. Trois restent sélectionnés par défaut. Un public plus grand augmente le défi sans changer les cartes, l’énergie ou les six tours.
- Chaque musicien apporte trois **Note** (1 énergie, 6 puissance sur une cible) et deux exemplaires de sa carte spéciale.
- La pioche est commune. Cinq cartes sont pigées au début de chaque tour, puis affichées sous leurs propriétaires. Chaque exemplaire est distinct.
- Le band dispose de trois points d’énergie par tour. Les cartes gratuites restent jouables à zéro énergie.
- Glisser une carte ciblée sur un spectateur. Déposer une carte collective ou de préparation dans la zone du public. Le glisser-déposer fonctionne à la souris et au toucher ; sélectionner une carte puis sa cible offre aussi un accès au clavier.
- Le public défile verticalement dans sa propre zone ; les musiciens et leurs cartes restent visibles. Pendant un glisser-déposer, approcher la carte du bord du public fait défiler ses rangées. Le défilement est conservé après avoir joué une carte.
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

## Répétition : chansons et public

Le public compte entre trois et douze spectateurs, disposés sur plusieurs rangées. Les trois premiers commencent avec 24, 20 et 25 résistance ; les suivants reprennent ces valeurs et les styles du répertoire. Conquérir **tout** le public gagne immédiatement. Les cartes collectives et les finales touchent tous les spectateurs encore à conquérir, quel que soit leur nombre. Deux passages de trois tours donnent six tours au maximum. **Toutes** les compositions actives possédées par le groupe sont proposées, avec leurs titres, styles, auteurs et maîtrises collectives. Choisir la première chanson au départ, puis une autre pour le deuxième passage. Si une seule chanson est disponible, la reprendre au deuxième passage conserve les six tours, sans fabriquer de morceau.

Sans groupe actif, la préparation donne accès à **Groupes** pour en créer un. Sans chanson active, elle invite à adopter une composition depuis ce même écran ; prendre la scène reste désactivé. Une chanson mise de côté ou possédée par un autre groupe n’est pas proposée. Les nouvelles répétitions relisent les membres, instruments et chansons actuels. Une répétition commencée conserve ses copies pour permettre la reprise du même tour.

Les règles restantes reprennent ENCORE : une chanson du style favori ajoute deux puissance ; **Attend un Solo** ajoute trois puissance à la carte Solo ciblée ; **S’ennuie** redonne trois résistance en fin de tour aux spectateurs non conquis. La finale de chaque chanson inflige trois puissance à tout le public avant l’ennui. Le départ de la deuxième chanson retire deux tempo. L’Improvisation du saxophone utilise le tempo, mais ne déclenche pas le bonus réservé à la carte Solo.

## Vrais spectacles du calendrier

1. Activer **BandLive** dans **Réglages**.
2. Dans **Shows**, réserver une date avec **deux à six musiciens** et **une ou deux compositions** du groupe. Les déplacements, confirmations et candidatures restent ceux du calendrier.
3. **Avancer jusqu’au show**, puis choisir **Jouer avec BandLive** avant de lancer la première chanson. Le spectacle classique reste disponible.
4. Jouer la setlist réservée dans son ordre. Une composition unique est reprise au deuxième passage ; deux compositions ont chacune trois tours. La victoire peut arrêter la prestation avant le deuxième passage.
5. Consulter le bilan puis **Retour au quartier · continuer**. Si un autre groupe attend, **Continuer la soirée** ouvre sa prestation ; le quartier reprend après la dernière.

Les jams, les setlists de plus de deux morceaux et les formations de plus de six musiciens restent jouables dans le spectacle classique. La préparation indique pourquoi BandLive n’est pas disponible pour cet engagement. Aucun membre du quartier n’est retiré pour satisfaire la limite du module.

Le lieu fixe le public interactif :

| Scène | Spectateurs | Barres à froid, répétées dans la foule |
|---|---:|---|
| Garage | 8 | 16, 13, 16 |
| Parc ou Canal | 10 | 19, 16, 20 |
| Grande scène | 12 | 24, 20, 25 |

Les styles favoris proviennent de la scène, même s’ils ne figurent pas dans le répertoire choisi. Les cartes, l’énergie et les six tours restent identiques. Ce public compact ne change ni les capacités des lieux ni la foule du groupe suivant, qui conserve le public classique de la soirée, y compris en passant par **Shows → Groupe suivant / terminer la soirée**, **Retour aux dates**, ou en interrompant la prestation. BandLive reprend aussi l’accueil transmis par le groupe précédent : une foule déjà réceptive commence avec des barres partiellement entamées.

**Victoire BandLive** signifie conquérir tout le public. Le **bilan du calendrier** tient aussi compte des spectateurs partiellement touchés : accueil entre 0 et 100, comparé aux attentes de la scène. Une prestation sans victoire totale peut donc recevoir un accueil favorable. Le bilan affiche ces deux informations et leurs effets.

La fin applique les règles de spectacle existantes : coordination, réputation de spectacle, moral temporaire, maîtrise du morceau final, renommée, émotions et liens des musiciens. Le coût d’énergie est de 15 par musicien ; **Tout donner** ajoute 1,5 par carte BandLive réellement jouée par ce musicien et conserve son effet de déchéance. Le bilan affiche les énergies avant et après. Aucun nouveau système de monnaie ou de récompense n’est ajouté.

Le résultat entre dans l’historique du groupe **une seule fois**. Recharger, rouvrir le bilan ou rejouer l’historique ne redonne aucun gain. **Rejouer BandLive · répétition** utilise la formation, les chansons, la foule et la graine enregistrées, sans effet sur le monde actuel. **Interrompre le show** réutilise l’annulation du calendrier : pas de résultat ni de récompense, coût d’interruption existant et libération des musiciens.

## Isolation et sauvegarde

Le moteur de cartes et sa graine restent indépendants du hasard du quartier. Les répétitions conservent leurs copies des musiciens, sans modifier leurs decks, besoins, engagements ou réputation. Leur progression et l’activation du module restent séparées dans `garage-vivant-bandlive-v1`.

Un vrai show est enregistré **dans sa prestation du quartier**, avec sa main, sa pioche, son tempo et sa setlist. Exporter/importer le monde ou recharger reprend cette prestation exacte, sans la remplacer par une répétition. Le quartier et le moteur automatique attendent la fin du show interactif. Les champs classiques de la prestation restent valides et les sauvegardes ordinaires conservent leur format.

Désactiver BandLive retire son usage des prochains spectacles. Une prestation interactive déjà engagée reste accessible pour être terminée ou interrompue ; sa progression n’est pas supprimée. Après son retour au quartier, l’onglet se masque si l’option est désactivée.

Les répétitions aux formats 1 et 2 restent lisibles, y compris les anciennes formations de plus de six musiciens. Les parties avec un public de scène et une setlist ordonnée utilisent le format 3. **Changer le band** et **Reprendre la répétition en cours** conservent le parcours de répétition. Les spectacles classiques et le calendrier continuent à fonctionner avec le module désactivé par défaut.

## Validation

`npm test` inclut les règles BandLive : les huit cartes, tempo, bonus, cartes gratuites, cibles invalides, victoire, six tours, recyclage, reprise JSON, limite de six membres, reprise du format 1, répertoire complet, chanson unique, sélection actualisée, public de trois à douze, effets collectifs sur les rangées supplémentaires et isolation du monde. `npm run test:browser` inclut son parcours ordinateur et tactile : activation, accès depuis un groupe, compositions et auteurs, groupe de huit réduit à six sur scène, refus d’un septième membre, reprise d’une chanson, préparation sans perte de progression, états sans groupe/chanson, drag/drop, infobulles, sauvegarde des grands publics, retour au quartier après victoire ou fin de show, reprise de la simulation, désactivation et retour au spectacle classique. Les captures sont produites dans `test-results/`.

Les tests de calendrier couvrent les confirmations et déplacements réels, la setlist ordonnée, les styles propres au lieu, le bilan unique, le rechargement, l’export/import, le replay isolé, l’interruption, la désactivation en cours de show et le groupe classique suivant. Les parcours navigateur vérifient aussi le bilan sur téléphone, la reprise du temps, les sorties alternatives par Shows et le défilement indépendant du public. Les modules et feuilles de style partagent une version de cache propre à BandLive ; le contrôle `cache-upgrade-browser` prépare les anciennes URL en cache avant de vérifier le démarrage avec le module désactivé, son activation et le rechargement.

`npm run audit:bandlive` simule 4 200 prestations avec les cartes approuvées. [Résultats et limites de l’équilibrage](BANDLIVE_BALANCE.md) · [données complètes](BANDLIVE_BALANCE.json).

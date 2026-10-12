# BANDLIVE Minuit — inventaire de portage du prototype V17

12 octobre 2026. Branche : `feat/bandlive-minuit`.

Le portage consiste à installer la scène et les interactions du prototype V17 sur le moteur BANDLIVE actuel. Copier l’application du labo entière remplacerait des règles et des parcours déjà livrés. Le moteur, les decks et le calendrier de `main` restent les références ; V17 fournit la référence visuelle.

## Sources vérifiées

- Jeu : `main` **0.7.18**, commit [`a50105a`](https://github.com/jutrasimon/garage-vivant/commit/a50105a216052963416c79a4ce429e582183092c), incluant la PR #25.
- Prototype : **V17**, commit `618b0ef3da32ba26f2c50685b58ad2be2e026eee`, [version approuvée](https://bandlive-visual-lab.jutrasimon.chatgpt.site), ambiance **Minuit**.
- Règles : `dist/bandlive.mjs`, `dist/bandlive-cards.mjs`, `dist/bandlive-concert.mjs`, `dist/bandlive-roster.mjs`.
- Vue actuelle : `dist/bandlive-view.mjs`, `dist/bandlive.css`, raccords dans `dist/app.mjs`.
- Apparence partagée : `dist/character-view.mjs`, `dist/show-view.mjs`, `dist/v5-view.mjs`.
- Parcours décrits dans `docs/BANDLIVE.md` et tests `tests/bandlive*.mjs`.

Audit du code et vérifications ciblées des calculs. Aucun portage de l’interface ni contrôle visuel navigateur n’est effectué dans cette branche à ce stade. Les écrans du labo déjà approuvés restent la référence. Le placement personnalisé enregistré dans le navigateur n’est pas contenu dans le dépôt du labo.

## Visuel à conserver

- Sol, scène, speakers, instruments et éclairage Minuit de V17. Scène descendue ; rail de plafond et lumières arrière visibles.
- Personnages mignons à petits corps. Musiciens agrandis de 25 % ; instruments devant leurs corps.
- Foule organique, fréquences et phases de danse individuelles. Les badges suivent leur personnage.
- Protection des spectateurs **86 × 112**, espacement de collision **8** : comportement approuvé à conserver. Pas de dépendance à un moteur physique externe.
- Musiciens et mains positionnables séparément. Les mains n’ont aucun collider et ne poussent rien.
- Noms stylisés au-dessus des musiciens, indépendants des mains. Cartes en éventail remontées devant la scène.
- Grand aperçu fixe à droite, conservé pendant le drag. Petit jeton et résultat près du curseur, hors de la boîte du spectateur ciblé.
- Popup prune/menthe, gain rose, rebond et étincelles de V17. Arc depuis le **musicien**. Projectiles sur une couche **au-dessus des cartes**.
- Dépôt invalide ou annulation : aucune ressource dépensée. Ambiance Minuit comme présentation par défaut du portage.

## 1. Ce qui manque à BANDLIVE et existe dans le labo

| Élément | État sur main | Travail de portage |
| --- | --- | --- |
| Scène Three.js Minuit | Scène BANDLIVE en DOM/CSS et canvas 2D ; aucune bibliothèque Three.js dans `dist/`. | Extraire la construction de scène de `app.js` du labo dans un renderer isolé, monté uniquement pour BANDLIVE. Ajouter le module Three.js local. |
| Sol, speakers et instruments en volume | Le jeu dispose d’illustrations SVG d’instruments et d’un décor distinct. | Porter les primitives et le sol du labo ; utiliser les huit instruments réels. |
| Spots ancrés au plafond | Les cônes actuels sont des décorations CSS de musiciens. | Porter `spotlight-geometry.js` et le rail ; fixture et sommet fixes, base du cône liée à la position du musicien. |
| Foule physique organique | Public dans une grille à quatre colonnes pour les nouveaux shows. | Porter `layout-physics.js`, `scene-collisions.js`, protection et preset ; résoudre le conflit avec les zones de gameplay décrit plus bas. |
| Déplacement séparé du musicien et de sa main | Main liée au bloc DOM du musicien. | État de disposition distinct, par identifiant ; séparer la position de l’acteur et celle de sa main. |
| Réglage uniforme des mains et véritable éventail | Chevauchement horizontal, sans angles d’éventail. | Porter `hand-geometry.js` avec les cartes réellement présentes ; recalculer la boîte lorsque la main change. |
| Noms au-dessus du musicien | Nom actuellement sous le portrait. | Ancrage au sprite, suivant sa danse, sans dépendance à la main. |
| Danse organique permanente | Réactions ponctuelles après conquête, dont la transe. | Porter les phases/fréquences individuelles ; respecter l’apparence réelle et les effets réduits. |
| Grand aperçu de carte à droite | Pas d’équivalent ; des résultats apparaissent près des spectateurs. | Adapter `card-preview.js` à `cardDefinition`, propriétaire réel et illustration réelle. Préserver l’aperçu pendant un drag. |
| Jeton et popup local V17 | Clone de la carte en taille normale pendant le drag. | Porter `card-drag-feedback.js` et sa DA ; alimenter le résultat avec `previewCard`. |
| Arc de visée avant le dépôt | Trajets visibles seulement pendant l’animation de jeu. | Porter `card-aim.js`, avec les identifiants réels et toutes les cibles concernées. |
| Projectile V17 au-dessus des mains | Canvas `.bl-effects` existant avec sa propre composition de couches. | Porter la couche de premier plan `concert-fx` ou son équivalent ; aucun élément d’effet ne doit intercepter le pointeur. |
| Sauvegarde/annulation de la disposition | Aucune disposition libre dans BANDLIVE. | Ajouter une préférence UI séparée du moteur et des récompenses. Adapter à la formation et à la taille du public. |

Modules géométriques du labo largement réutilisables : physique, filtrage des collisions, éventail, cônes. Modules d’interaction et `app.js` nécessitent des adaptateurs. **Ne pas porter `game-cards.js` et `card-effects.js` comme deuxième moteur de règles.**

## 2. Ce que le jeu possède et que le labo ne couvre pas

| Système de main à conserver | Différence du labo | Raccord nécessaire |
| --- | --- | --- |
| **2 à 6 musiciens**, **8 instruments** | Quatre musiciens et instruments fixes : clavier, guitare, basse, batterie. | Formation dynamique, placement initial et spots pour 2–6. Modèles à fournir pour chant, saxophone, trompette et percussions. |
| Noms, couleurs et identité personnalisés | Portraits fabriqués à partir d’un index et de couleurs prédéfinies. | Réutiliser `character-view.mjs` pour les textures/personnages : accessoires, accent, proportions actuelles. Relier le mouvement à l’identité. |
| Surnoms | `characterName` les gère ailleurs ; le snapshot des acteurs BANDLIVE ne copie pas `nickname` actuellement. | Écart déjà présent : compléter le contrat d’affichage/snapshot si les surnoms doivent apparaître sur scène. Échapper tous les noms insérés dans le DOM. |
| Deck de **5 cartes par musicien et par instrument** | `cardsFor()` fabrique une suite Note/spéciale suivant un compteur. | Lire `game.cards` et les collections réelles. Ne jamais fabriquer ou remplacer un deck depuis les réglages visuels. |
| **5 cartes au total dans la main commune**, réparties entre propriétaires | Trois cartes visibles par musicien par défaut ; quantités arbitraires 0–10. | Afficher `game.hand` regroupé par `actorId` : un musicien peut avoir 0 à 5 cartes. Le compteur de cartes du labo devient un outil de maquettage, pas une règle de partie. |
| Pioche, défausse et recyclage | Cartes réutilisables, sans consommation de main. | Retirer la bonne `card.id`, animer sa disparition, actualiser les éventails et préserver la consultation des piles sans révéler l’ordre. |
| **25 définitions** : Note + 8 spéciales initiales + 16 nouvelles | Seules Note et quatre spéciales sont affichées. | Cartes et previews pour toutes les définitions, descriptions longues et titres longs inclus. Réutiliser les cartes du jeu. |
| Choix de chanson et **2 passages de 3–5 tours** | Concert simplifié de 7 tours, sans chanson. | Conserver choix initial, deuxième chanson/reprise, couplet/refrains/finale, durée variable et retrait de 2 tempo au changement. |
| Public variable | Douze personnages et jauges de 10 fixes. | Répétitions 3–12 ; vrais shows 8/10/12 selon le lieu. Objectifs variables, départ parfois déjà rempli. |
| Styles et intentions réelles | Styles décoratifs ; intentions fixes `−1` ou `+2`. | Afficher style, attente de Solo ou ennui `−3`, avec leurs effets exacts. Aucune intention `+2 amour` inventée. |
| Bonus de style, Solo, alternance et conditions de carte | Calcul simplifié puissance/tempo/bonus. | `previewCard` et `playCard` restent les seuls resolveurs ; inclure les bonus, seuils, voisins conquis et Double frappe. |
| Cinq bonus de conquête et réactions en chaîne | Aucun effet mécanique de conquête. | Badge compact dans la protection existante, détails au survol/focus ; preview des cibles secondaires et animations depuis le spectateur déclencheur. |
| Statuts temporaires | Pas de chœur, projecteurs mécaniques, style du tour ni protection contre l’ennui. | Indicateurs compacts et expiration au bon tour/passage. Ne pas confondre l’éclairage décoratif avec le bonus « Sous les projecteurs ». |
| Cartes à deux cibles | Un seul dépôt. | Garder une première cible puis une seconde distincte, sans paiement anticipé ; preview des deux et annulation propre. |
| Variation : choisir une autre carte à défausser | Aucun choix supplémentaire. | Conserver le sélecteur de défausse et sa validation avant paiement. Le drag seul ne suffit pas. |
| Échange après spectacle | Aucun progrès de deck. | Garder le choix musicien/carte/spéciale, un seul échange facultatif après un vrai show, aucun pour répétition, replay ou interruption. |
| Programmation et groupes suivants | Une formation permanente. | Préserver premières parties/tête d’affiche, accueil transmis, nouveaux acteurs/decks/chansons, bilan et échange par groupe. |
| Bilan, historique et retour au quartier | Bouton de remise à zéro du concert. | Conserver accueil/attentes, conséquences et gains uniques, interruption, replay, continuation de soirée et reprise de la simulation. |
| Audio et effets réduits | Labo sans audio ; réduction de certaines animations seulement. | Conserver `enableAudio`, sons de carte/tir/impact et préférence `getReducedEffects`, en plus de `prefers-reduced-motion`. |
| Souris, tactile, clavier et focus | Pointer drag testé, inspection au focus, interaction plus limitée. | Garder sélection puis cible, Enter/Escape, labels accessibles et contrôles tactiles. Gérer le scroll pendant la visée. |

Les compétences, besoins, personnalité et qualité des chansons restent des informations du quartier. Ils ne doivent pas devenir des multiplicateurs de dégâts pendant un portage visuel : le moteur BANDLIVE actuel ne les utilise pas ainsi.

## 3. Conflits prioritaires

### A. Foule libre contre rangées/voisins — arbitrage de design principal

Le moteur ne déduit pas les voisins de leurs coordonnées à l’écran. `audienceColumns`, `cardTargets` et `conquestTargets` utilisent l’ordre de `game.fans`, avec quatre colonnes maximum. Rangée, gauche/droite, devant/derrière interviennent dans cinq nouvelles cartes de zone/voisinage et dans les cinq effets de conquête.

Déplacer librement un spectateur ne change donc pas ses voisins mécaniques. Une Percée peut toucher une personne visuellement à gauche ; une rangée peut sembler traverser plusieurs groupes physiques. Changer ces relations en fonction de la physique modifierait les règles, l’équilibrage et le déterminisme.

**Recommandation pour ce portage :** garder les places logiques du moteur, produire une disposition organique avec de petits décalages lisibles autour de ces places, et montrer les liens/zones concernés au survol et pendant la visée. Le mode Disposition peut garder des déplacements libres, mais doit montrer les relations logiques. Ne jamais recalculer le gameplay à partir des collisions. La disposition libre exacte du labo et l’interprétation strictement géographique des effets actuels ne peuvent pas être promises simultanément sans cette convention.

### B. Preview simplifié contre vrai resolveur

Vérifications exécutées sur la même cible d’objectif 24, chanson et style favori Punk :

| Cas contrôlé | Moteur main 0.7.18 | Calcul V17 |
| --- | --- | --- |
| Note, aucun bonus de préparation | +8 conquête, dont +2 de style | +6 |
| Solo, tempo 4, bonus 3, intention Solo | +20, dont style +2 et attente Solo +3 | +15 |
| Note conquiert une cible avec Onde de choc | Cible conquise puis +3 aux voisins `f1` et `f4` | Seulement la cible directe |

Le preview de main appelle `playCard` sur une copie : les deux premières vérifications confirment qu’il ne modifie pas le jeu original. Adapter ses événements et son état final au popup V17, plutôt que recopier ses formules dans la vue. Afficher les gains plafonnés, les ressources, la pioche/défausse éventuelle, les statuts et les chaînes.

### C. Moment d’application de la carte

Sur main, `perform()` applique `playCard`, sauvegarde, puis joue l’animation. Dans V17, l’énergie est consommée au départ et les jauges changent dans le callback d’arrivée du projectile. Copier ce callback ferait résoudre ou appliquer la carte une deuxième fois, ou laisserait un état incomplet au rechargement.

Garder la transaction immédiate et unique de main. L’animation reçoit les valeurs avant/après et les événements réels, sans écrire dans les règles. Même convention pour les conquêtes, le bilan et les récompenses ; interrompre une animation ne rejoue pas la transaction.

### D. Mise à jour de la vue et durée de vie du renderer

`render()` remplace actuellement `root.innerHTML` après les cartes et beaucoup d’actions. Le labo monte une scène une fois puis anime continuellement. Les combiner directement détruirait/recréerait canvas, textures, handlers et capture du pointeur à chaque action.

Séparer montage/démontage de la scène et mise à jour de ses données. Un renderer, un RAF et des observateurs contrôlés ; arrêt quand BANDLIVE est masqué, nettoyage au changement de show et à la désactivation. Les sprites, mains, halos et cônes sont indexés par identifiant stable. La danse n’écrit ni dans le RNG de BANDLIVE ni dans le monde.

### E. Taille d’écran et cadre de l’application

V17 impose **760 px minimum en largeur et 960 px en hauteur**. Le jeu est testé notamment en **1280 × 720** et **390 × 844**, avec navigation, liste de personnages et inspecteur. Copier `body`, `header`, `footer`, `#app`, `#world` et les sélecteurs génériques du labo provoquerait scroll, écrasement de styles et contenu hors écran.

Prévoir un cadre de concert adapté à l’espace réel, conserver les proportions et la DA, et limiter les styles au namespace BANDLIVE. Adapter la place de l’aperçu droit sur mobile : il ne doit pas retirer les cibles ni couvrir la main. Conserver les entrées/sorties du jeu et le bouton Son. Le rendu réduit sur téléphone sera une adaptation de la DA, pas la copie pixel pour pixel du grand écran.

## 4. Autres conflits à traiter

| Risque | Mesure prévue |
| --- | --- |
| Nouveaux badges hors des 86 × 112 approuvés | Intentions/styles/bonus sous forme de petits symboles et détails en infobulle. Vérifier la boîte UI complète et la danse ; conserver les dimensions de collision approuvées. |
| Main réduite après consommation de carte | Garder le centre enregistré de la main ; recalculer angles et dimensions sans déplacer le musicien ni pousser la foule. |
| Collision physique pendant le drag d’une carte | Distinguer déplacement de disposition et action de jeu. Le fantôme, preview et arc sont des overlays, jamais des corps. |
| Cible conquise qui disparaît | Garder sa place logique et sa boîte. Conserver explosion/transe/émotion comme réactions visuelles sans changer les relations de voisinage. |
| Preview/détails masquant une personne | Reprendre le placement du popup hors de la protection ciblée ; intégrer les badges/statuts et le grand aperçu aux zones à éviter. Sur collectif, présenter un résumé local et le détail global à droite. |
| Mauvais identifiant après une pioche ou un groupe suivant | Remplacer les indices `(m,c)` du labo par `actor.id`, `card.id`, `fan.id`. Le même identifiant `f0` peut revenir dans un autre show : associer la disposition au contexte de formation/prestation. |
| Placement exact seulement dans le navigateur du labo | Les préférences du Site et de GitHub Pages ont des origines différentes. Ajouter un export/import de disposition ou embarquer un preset explicitement capturé ; copier le code ne transfère pas le `localStorage`. |
| Preset prévu seulement pour quatre musiciens et douze spectateurs | Généraliser le placement initial, les IDs, les spots et les bornes pour toutes les formations/publics autorisés. Conserver l’organisation irrégulière, sans réintroduire une grille visuelle rigide. |
| Mise en scène différente des lieux du jeu | Minuit est une présentation visuelle ; ne pas modifier l’heure, les styles du lieu, la capacité classique ou les objectifs. Utiliser les 8/10/12 participants interactifs réellement créés. |
| Deux systèmes de drag actifs | Remplacer/raccorder les handlers HTML natifs et tactile existants, éviter un double dépôt ou clic après drag. Conserver le choix à deux cibles, la défausse, Escape, perte de capture, blur et resize. |
| Scroll et coordonnées de visée | Une seule conversion entre coordonnées écran/viewport/scène ; recalcul après scroll, redimensionnement et ouverture de l’inspecteur. Les projectiles et arcs partent du sprite, pas de la main. |
| Texte actuel qui ne tient pas dans une carte | Utiliser toutes les vraies descriptions et illustrations. Vérifier les titres longs, les deux cibles et les règles de zone ; grand aperçu complet, sans changer la taille des cartes individuellement. |
| Rendu autonome du labo dépendant de globals | Injecter état, callbacks, conteneur et préférences ; retirer les accès à ses boutons fixes, données de démonstration, victoire/reset et faux footer. |
| Apparence des personnages perdue | Transformer les dessins partagés en textures ou réutiliser leurs fonctions ; ne pas conserver `portrait(index)` du labo. Mettre à jour les textures quand identité/couleur changent, préserver snapshots historiques. |
| Sensibilité aux animations et coûts GPU | Effets réduits accessibles depuis BANDLIVE, danse/particules atténuées, DPR plafonné et géométrie simple. Prévoir un état de repli si WebGL échoue, sans empêcher de retrouver le quartier. |
| Fuite de contextes/textures/RAF | Réutiliser le renderer et libérer les ressources au démontage ; ne pas recréer Three.js après chaque carte. Vérifier un enchaînement de plusieurs groupes et les allers-retours entre vues. |
| Taille et chargement | Three.js du labo fait **687 458 octets bruts**. Charger le renderer au besoin ; garder les autres vues légères. Aucun besoin d’un nouveau backend ou serveur de jeu. |
| `.js` du labo contre `.mjs?v=…` du jeu | Porter les modules internes selon la convention du dépôt ; adapter le graphe d’import/cache et sa vérification. `tests/assets.test.mjs` ne parcourt actuellement que les `.mjs`. |
| Export HTML autonome | `scripts/build-bandlive-test.mjs` utilise Rollup et inline les styles. Vérifier que Three.js et ses imports sont inclus, sans dépendance externe ni ressource manquante dans le fichier de test. |
| Documentation contradictoire | Le README mentionne encore une « main commune » alors que la vue a déjà des mains par musicien. Mettre à jour la documentation depuis le comportement porté et conserver les explications des règles de zone. |

## 5. Frontière d’intégration proposée

La commande de jeu reste : **sélection/drag → choix requis → `previewCard` → `playCard` → sauvegarde/bilan existants**. Le nouveau renderer et les overlays présentent ce résultat.

| Fichier ou famille | Intervention attendue |
| --- | --- |
| `dist/bandlive-view.mjs` | Montage de scène, binding des mains/acteurs/fans, interactions, preview, choix complémentaires, bilan et contrôles. Garder la coordination avec le monde. |
| `dist/bandlive.css` | Remplacer la présentation de scène/drag par Minuit, en isolant les styles. Garder préparation, chansons, programmation et récompense. |
| Nouveaux modules de scène/placement/overlay et Three.js local | Porter les modules réutilisables du labo, avec noms/conventions du dépôt et cycle de vie explicite. |
| `dist/character-view.mjs`, `dist/show-view.mjs` | Réutiliser portraits/accessoires et huit illustrations ; ajouter seulement les raccords nécessaires. |
| `dist/bandlive.mjs` | Garder les règles et le preview partagé. Une éventuelle donnée d’affichage comme le surnom est distincte d’un changement de règles. |
| `dist/bandlive-concert.mjs`, `dist/bandlive-roster.mjs` | Garder création des vrais shows/répétitions, snapshots, récompenses et enchaînement ; compléter seulement les données visuelles nécessaires. |
| `dist/app.mjs` / styles du cadre | Intégration au cycle des vues, effets réduits et place disponible ; ne pas remplacer la simulation ni le calendrier par ceux du labo. |
| `scripts/build-bandlive-test.mjs`, tests d’assets/cache/browser | Adaptation des assets embarqués, sélecteurs et validations visuelles. |

Les règles du dashboard de variables ne pilotent pas actuellement le moteur de cartes BANDLIVE. Ce portage visuel n’ajoute pas automatiquement ce raccord. Les sliders de taille/éventail sont des préférences de vue ; les sliders de quantité du labo ne deviennent pas une source de cartes.

## 6. Ordre proposé et validation

1. **Brancher les vraies données et le preview réel** sur une scène Minuit montée une seule fois ; 2–6 musiciens, 8 instruments et 3–12 spectateurs.
2. **Porter placement, protection, danse et éclairage**, puis les mains dynamiques en éventail. Rendre les relations de zone lisibles dans la foule organique.
3. **Porter aperçu, jeton, popup, arc et projectiles**, en conservant deux cibles, choix de défausse, clavier et tactile.
4. **Raccorder les écrans périphériques** : chansons, programmation, piles, son, interruptions, bilan, échange et retour au quartier.
5. **Valider formats d’écran, reprise, cache et build autonome**, puis préparer la version et ses notes avant fusion.

Réutiliser les tests moteur existants `bandlive`, `bandlive-conquest`, `bandlive-decks`, `bandlive-concert`, plus les tests géométriques utiles du labo. Les tests browser devront changer leurs assertions de grille pour vérifier la visibilité et les relations logiques ; leurs validations de commandes, preview exact, reprise et récompense restent pertinentes. Garder les sélecteurs de commande quand possible pour limiter les changements.

Parcours indispensables : 2/4/6 musiciens ; huit instruments ; mains vides et plusieurs cartes du même musicien ; publics 3/8/10/12 ; chaînes et statuts ; duo et Variation ; vraie soirée avec deux groupes ; échange unique ; rechargement/export/import ; interruption ; retour et reprise du quartier ; desktop 1280 × 720 et mobile 390 × 844 ; projeté au-dessus des cartes ; aucun overlay n’intercepte le drag.

Pour la livraison, `CONTRIBUTING.md` exige `test:quick`, `docs:build`, `test:smoke`, version supérieure au dernier main et patch notes/cache synchronisés. Cette branche d’inventaire ne réserve pas encore un numéro de livraison et n’est pas prête à fusionner. Aucun conflit Git ne peut être déclaré pour un portage non encore écrit. **Aucune PR ouverte** n’était présente dans ce dépôt au contrôle de l’audit ; les zones de concurrence les plus probables restent `bandlive-view.mjs`, `bandlive.css`, `bandlive.mjs`, le contrat des personnages et les fichiers de release/cache.

Le principal travail est donc un **portage de vue avec adaptation des données et des parcours**, accompagné d’une convention lisible pour la topologie du public. Aucun nouveau moteur de jeu, backend ou système de récompense n’est requis.

# Simulations et correctif V7.3

Version 0.7.3 — 11 octobre 2026. Le [plan de test V7 complet](./PLAN_TEST_V7.md) garde les essais humains à exécuter. La V7.3 corrige quatre défauts de transitions existantes ; aucune mécanique ajoutée ni équilibrage global modifié.

## Protocole reproductible

`npm run audit:simulation` : douze graines (2040, 1 à 11) avec huit personnages, plus 713/714 avec quatre puis douze personnages, paramètres par défaut, quinze jours **écoulés** par partie. Aucun partenaire préparé, groupe imposé, sac arrangé ou action forcée. Les prestations réelles sont résolues avec les commandes moteur existantes `skipShow`/`nextSlot`, puis la boucle quartier reprend. Une soirée éventuelle à la dernière minute est terminée sans avancer l’horloge du quartier.

Validation exacte du monde après sauvegarde/rechargement chaque jour (JSON canonique), puis 240 minutes d’avenir comparées avec une copie rechargée. Les temps d’anomalie sont des **minutes-personnes observées**, ou minutes-demande pour l’expiration : ils ne comptent pas autant de bugs indépendants. Le banc observe activités, trajets, attente, besoins, émotions, projets, compétences, invitations, formations et spectacles.

Avant : moteur publié V7.2 `c13b861088347ffcc2508eb54d285499b8278093`. Après : V7.3, même protocole et mêmes graines. Une correction change des tirages ultérieurs ; les trajectoires avant/après ne doivent pas rester identiques. C’est le futur de deux copies de la même version qui doit l’être.

Données : [V7.2 avant correction](./AUDIT_V7_3_BASELINE.json), [V7.3 après correction](./AUDIT_V7_3.json), [stabilité V7.3 sur vingt graines](./BALANCE_V7_3.json). Le [rapport V7.2](./BALANCE_V7_2.md) reste historique.

## Défauts et corrections

| Défaut confirmé | Transition corrigée | Preuve ciblée |
|---|---|---|
| Un appel changeait de morceau pendant les cycles alors que sa demande gardait l’ancien | Le morceau de la demande est la cible jusqu’à fermeture ; instruments encore variables | Plusieurs cycles, deux morceaux, maîtrise de l’œuvre non annoncée inchangée, rechargement |
| Le meneur réinitialisait le cycle de décision des autres participants | Chacun conserve son propre compteur et sa décision de départ | Deux participants au seuil, départ du second à son maximum personnel |
| Une demande déjà commencée pouvait dépasser son échéance | Même admissibilité pour admission, travail et entretien ; expiration ferme les participants avant nouveaux gains | Échéance sur séance en cours, maîtrise inchangée à cette minute |
| Une chanson finalisée libérait le brouillon du coauteur, mais laissait sa séance continuer | Fin normale de toutes les séances associées ; prochain choix habituel, même si coauteur en trajet | Une chanson, séance du coauteur fermée, crédits conservés, sauvegarde valide |

Les quatre tests reproduisaient leur défaut avant correction et réussissent après. Un cinquième test importe la vraie fixture V7.2 : seul le numéro de version change, sans tirage, puis continuation identique et refus de corruption. Les anciennes actions encore liées à un projet terminé ferment au prochain tick, avant déplacement ou nouveau travail ; une ancienne répétition reprend le morceau annoncé avant le prochain gain. Aucun gain historique n’est compensé.

## Mesures avant et après

| Mesure | V7.2 avant | V7.3 après |
|---|---:|---:|
| Parties arrivées à quinze jours | 16 | 16 |
| Sauvegardes quotidiennes validées | 240 | 240 |
| Continuations rechargées identiques (240 min) | 16 | 16 |
| Parties par défaut : groupe formé avant J10 | 12/12 | 12/12 |
| Spectacles résolus | 42 | 43 |
| Chansons terminées | 280 | 300 |
| Chansons adoptées | 101 | 113 |
| Mauvais morceau sur appel (minutes-personnes) | 5538 | 0 |
| Pratique au-delà du maximum + 15 min (minutes-personnes) | 12 | 0 |
| Demande jouée après échéance (minutes-demande) | 55 | 0 |
| Séance de composition / brouillon désalignés (minutes-personnes) | 100 | 0 |

Aucun blocage ni anomalie détectée parmi les invariants instrumentés après correction. Cela ne garantit pas l’absence de tout défaut. Les différences de volume de chansons/shows reflètent les nouvelles trajectoires ; aucune production n’a été offerte. Les chansons terminées ont requis entre deux et dix séances en V7.3.

| Partie | Premier groupe (jour écoulé) | Groupes actifs à J15 | Chansons | Shows |
|---|---:|---|---:|---:|
| 2040 / 8 pers. | 4.21 | 2 (2, 2 membres) | 27 | 1 |
| 1 / 8 pers. | 3.31 | 2 (3, 2 membres) | 16 | 3 |
| 2 / 8 pers. | 5.28 | 2 (2, 2 membres) | 14 | 4 |
| 3 / 8 pers. | 4.09 | 3 (2, 2, 2 membres) | 22 | 4 |
| 4 / 8 pers. | 6.43 | 2 (2, 2 membres) | 20 | 3 |
| 5 / 8 pers. | 4.12 | 2 (2, 2 membres) | 14 | 2 |
| 6 / 8 pers. | 6.25 | 1 (4 membres) | 23 | 1 |
| 7 / 8 pers. | 9.23 | 1 (2 membres) | 10 | 1 |
| 8 / 8 pers. | 3.97 | 3 (2, 2, 2 membres) | 25 | 4 |
| 9 / 8 pers. | 4.13 | 2 (2, 2 membres) | 22 | 3 |
| 10 / 8 pers. | 2.58 | 2 (2, 2 membres) | 22 | 4 |
| 11 / 8 pers. | 6.47 | 4 (2, 2, 2, 2 membres) | 16 | 2 |
| 713 / 4 pers. | 6.58 | 1 (2 membres) | 8 | 2 |
| 714 / 4 pers. | 6.16 | 0 (— membres) | 7 | 1 |
| 713 / 12 pers. | 3.59 | 3 (2, 4, 2 membres) | 26 | 5 |
| 714 / 12 pers. | 2.45 | 3 (2, 2, 2 membres) | 28 | 3 |



### Stabilité prolongée

`npm run audit:groups` : 20/20 groupes naturels avant J10, 48 groupes actifs à J30 dont 40 âgés d’au moins sept jours. Parmi 92 personnages attachés à au moins 60/100, 82 ont un seul groupe. 729 démarrages de pratique, 67 départs autonomes ; maximum de deux appartenances simultanées dans les mesures J30.

Les graines 2040, 1 et 2 sont prolongées à J90 : 7 groupes actifs, dont 7 âgés d’au moins trente jours ; 21/22 personnages fortement attachés dans un seul groupe. Les garde-fous de formation/stabilité passent. Ils ne garantissent ni un groupe pour chaque personne ni une formation stable dans chaque partie.

## Points d’équilibre et systèmes en retrait

Le plaisir moyen par partie est de 92,03 à 94,27/100, et aucun temps sous le seuil critique de plaisir n’a été observé ; ce besoin peut manquer d’enjeu. Les populations de quatre personnages passent 39,96 % et 21,51 % de leur temps-personne sous le seuil critique social : moins d’occasions est aussi une conséquence normale du quartier réduit, mais l’expérience peut être trop frustrante. Le gain instrumental principal va de +20,10 à +71,30 points, celui d’écriture de +6,85 à +71,14 en quinze jours ; juger si les plateaux restent perceptibles et si la carrière prend assez de temps. Ces observations sont intégrées à E73-01/02/03, sans coefficient modifié arbitrairement.

La déchéance reste en retrait : 23 séances terminées et deux interrompues sur les seize parties, jauge moyenne par partie de 0,01 à 1,92/100. Les chaînes avancées et l’absence extrême au show sont donc surtout vérifiées par cas contrôlés, sans forcer leur fréquence naturelle. Les invitations produisent 364 acceptations, 201 refus, 49 expirations et trois annulations.

Composition en plusieurs séances et adoption sont observées ; certains projets sans travail existent parce qu’une nouvelle séance peut être interrompue avant l’arrivée. Un petit quartier peut aussi finir sans groupe actif après des départs/dissolutions : ce n’est pas un prétexte à créer un groupe offert. Une œuvre finie n’est pas automatiquement un hit ni un morceau de scène maîtrisé.

Les quatorze [raccords débranchés](./gdd/raccords-v7.md) restent déclarés dans l’interface et les DDD : inspiration, agenda général, souvenirs/chimie vers l’apprentissage, pression de recherche sociale additionnelle, seuil absolu d’archive, anciennes nuances et humeur, repondérations supprimées, drame d’absence, albums/fans, transfert d’œuvres et réunion autonome de groupe. Aucun tuyau raccordé par un mécanisme de secours.

## Limites des preuves

Des graines reproductibles ne couvrent pas toutes les parties ni les paramètres extrêmes. Le saut de spectacle exécute les résultats réels, mais ne vérifie pas l’expérience de jeu humain, la qualité sonore ni toutes les décisions manuelles en show. Les tests Chromium et six viewports contrôlent le rendu et les interactions ; l’appareil tactile réel et l’audio restent à tester. Les abandons après quatorze jours sans travail sont surtout couverts par tests ciblés, puisque le temps de départ laisse peu de recul à une œuvre créée tard. Les paramètres d’équilibre n’ont pas été rendus parfaits par cet audit.

## Vérifications de livraison

`npm test` : 25 tests agrégés, zéro échec (nombre de tests, pas nombre de lignes du plan jouées). `npm run audit:simulation`, `npm run audit:groups`, construction VitePress et tests Chromium/présentation sur six viewports font partie des contrôles locaux et CI. Les résultats publiés et le statut Pages sont liés dans la PR de livraison ; les essais humains restent à renseigner dans le plan.

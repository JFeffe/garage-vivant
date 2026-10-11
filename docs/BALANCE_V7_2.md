# Équilibrage et réception V7.2

Mesure du 11 octobre 2026. Protocole reproductible : `npm run audit:groups`. Résultats détaillés : [JSON](./BALANCE_V7_2.json).

8 personnages, paramètres par défaut, 30 jours écoulés, puis prolongement des graines 2040, 1 et 2 à 90 jours ; commandes de saut des spectacles existantes, aucune intervention sur groupes ou relations.

Les spectacles sont résolus par les commandes de saut existantes ; leurs tirages et conséquences sont réellement appliqués. Le temps arrêté sur scène ne compte pas comme une journée écoulée. Les migrations sont vérifiées aux jours 3, 5, 10 et 30, puis la continuation exacte sur 240 minutes. Aucune préparation de relations ou création manuelle dans ces mesures.

## Résultats

- Première formation avant 3 jours : 3/20 ; avant 5 jours : 11/20 ; avant 10 jours : 20/20.
- Jour 30 : 48 groupes actifs dans les 20 parties ; 39 ont au moins sept jours d’existence.
- Musiciens dont le meilleur attachement atteint 60 : 77 ; 71 n’appartiennent qu’à un seul groupe actif (92.2%).
- Maximum d’appartenances actives au jour 30 : 2. Départs cumulés : 65. Répétitions effectivement démarrées : 700.

Les deux critères de cette passe sont atteints : au moins 80 % de formation naturelle au jour 10 et majorité en groupe unique parmi les musiciens attachés. L’[audit V7.1](./AUDIT_V7_1_RELATIONS.md) mesurait zéro groupe dans dix parties à dix jours. Le nouveau test ne reproduit pas exactement l’ancien comportement de prestation ; il applique désormais la boucle entière et conserve les graines anciennes dans les vingt graines de réception.

| Graine | Premier groupe, jour écoulé | Groupes actifs à J10 | À J30 | Actifs depuis ≥7 j | Attachement ≥60 / groupe unique |
|---|---:|---:|---:|---:|---:|
| 2040 | 4.21 | 2 | 3 | 2 | 4 / 4 |
| 1 | 3.31 | 2 | 3 | 3 | 4 / 4 |
| 2 | 5.28 | 2 | 2 | 2 | 6 / 6 |
| 3 | 4.09 | 1 | 2 | 2 | 4 / 3 |
| 4 | 6.43 | 2 | 3 | 2 | 4 / 4 |
| 5 | 4.12 | 3 | 2 | 2 | 5 / 4 |
| 6 | 6.25 | 2 | 2 | 2 | 4 / 4 |
| 7 | 9.23 | 1 | 3 | 3 | 1 / 0 |
| 8 | 3.97 | 1 | 3 | 2 | 4 / 3 |
| 9 | 4.13 | 2 | 2 | 1 | 4 / 4 |
| 10 | 2.58 | 2 | 2 | 2 | 3 / 3 |
| 11 | 6.47 | 1 | 1 | 1 | 4 / 4 |
| 12 | 3.26 | 2 | 4 | 1 | 2 / 1 |
| 13 | 5.33 | 2 | 2 | 2 | 5 / 5 |
| 14 | 4.37 | 2 | 2 | 1 | 3 / 3 |
| 15 | 6.18 | 2 | 2 | 2 | 3 / 3 |
| 16 | 2.07 | 3 | 3 | 3 | 6 / 6 |
| 17 | 2.52 | 1 | 2 | 2 | 4 / 4 |
| 18 | 6.06 | 1 | 3 | 3 | 5 / 4 |
| 713 | 8.10 | 1 | 2 | 1 | 2 / 2 |

## Prolongement à 90 jours

Les trois graines prolongées conservent huit groupes actifs au total, tous créés depuis au moins trente jours. Les 19 musiciens dont l’attachement atteint 60 appartiennent chacun à un seul groupe ; le maximum d’appartenances actives est un dans ces trois parties. Les sauvegardes au jour 90 sont valides. Cette observation sur trois graines complète la réception à J30 sans la généraliser à toutes les parties.

| Graine | Groupes actifs à J90 | Actifs depuis ≥30 j | Attachement ≥60 / groupe unique | Pratiques démarrées, cumul |
|---|---:|---:|---:|---:|
| 2040 | 3 | 3 | 6 / 6 | 232 |
| 1 | 3 | 3 | 6 / 6 | 206 |
| 2 | 2 | 2 | 7 / 7 | 214 |

## Ajustements mesurés

Le premier raccord complet (affinité favorable +0,9, seuil 12, émission 14 %, acceptation de base 20 %, attente 60 min et invitation 6 h) formait un groupe dans 13/20 parties à dix jours et ne démarrait que quatre pratiques. Il cumulait encore des freins de première formation et de réunion. Ce résultat a motivé une révision commune : favorable +1,2, défavorable −0,4, érosion persistante 0,0002×(tension−20), émission 22 %, acceptation de base 40 %, appel 50 %, attente 120 min et invitation 12 h. Le départ par attachement faible a été ramené à 8 % par examen. Aucune hausse générale des moments techniques ou des gains de scène.

Les DDD [Groupes](./gdd/groupes.md), [Relations](./gdd/relations.md) et [Interactions](./gdd/interactions.md) décrivent les coefficients effectivement livrés. Le plan initial proposait d’autres nombres ; ceux-ci restent des hypothèses historiques, pas les règles actives. Les compteurs enregistrent tentatives, résultats, propositions, acceptations, adoption, appels, démarrages, départs et dissolutions ; les gains/pertes d’affinité sociale et l’érosion sont mesurés séparément.

## Limites de la mesure

Ces vingt graines et huit personnages ne garantissent pas toutes les parties, ni les sacs modifiés, grandes populations ou réglages extrêmes. Les commandes de saut ne constituent pas une validation de plaisir humain ou de balance des cartes. Les tests couvrent aussi les invariants de populations 2–24 et les migrations réelles, mais le critère d’expérience chiffré porte sur huit personnages. La stabilité observée inclut des départs et reformations ; aucune protection secrète ne maintient un groupe à zéro. Les systèmes reportés restent listés dans [Raccords](./gdd/raccords-v7.md).

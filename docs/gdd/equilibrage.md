# DDD — Atelier d’équilibrage

Version 0.7.13. **Réglages → Atelier d’équilibrage** permet de modifier les paramètres exposés du moteur sans toucher au code. Ce module ne crée aucune règle de jeu : les valeurs de référence sont celles de V0.7.10.

## Parcours de conception

1. Rechercher un paramètre ou choisir son système : formation, répétitions, départs, attachement, relations, besoins, effets d’actions ou présence aux spectacles.
2. Modifier les champs numériques. Chaque ligne montre la référence, la valeur actuellement utilisée, l’unité, les limites et l’effet attendu.
3. Relire le nombre de changements en attente. **Appliquer les changements** valide tout le profil puis le remplace atomiquement. Une erreur ne modifie aucun paramètre du monde.
4. Observer la partie. Les prochaines évaluations utilisent les nouvelles valeurs ; le journal conserve la liste des paramètres changés avec leurs anciennes et nouvelles valeurs.
5. **Annuler les modifications** abandonne le brouillon. **Préparer les valeurs par défaut** prépare une remise à zéro, sans l’appliquer. Le bouton de chaque ligne réinitialise uniquement cette valeur dans le brouillon.

**Valeurs personnalisées** montre les différences avec les références, y compris dans le brouillon. Fermer l’onglet du navigateur perd les modifications non appliquées ; naviguer entre les vues du même monde les conserve. Changer de monde recharge son propre profil.

## Portée, sauvegardes et partage

Les valeurs appliquées appartiennent au monde, dans le champ optionnel `design`. Elles sont conservées par la sauvegarde automatique, l’export JSON complet et l’import d’une partie. Une nouvelle partie utilise les références ; un ancien monde dépourvu de ce champ garde exactement les règles par défaut. Aucun objet de règles global n’est modifié : les simulations de deux mondes restent indépendantes.

Le format de sauvegarde reste **0.7.3** avec une extension optionnelle validée. Les anciennes versions du jeu ne garantissent pas la prise en compte de cette extension : utiliser une version qui possède l’atelier pour reprendre une partie personnalisée.

**Exporter le profil** exporte le brouillon validé, sans changer la partie. **Importer un profil** remplace uniquement le brouillon, puis demande une application explicite. Les clés inconnues, les valeurs non numériques ou hors limites et les formats inconnus sont refusés. Le seuil de rupture ne peut pas dépasser celui de mise en couple. Les durées et seuils entiers refusent les décimales. Taille maximale du fichier de profil : 256 Ko.

Les profils utilisent `format: "garage-vivant-design-1"` et un dictionnaire `values`. Seules les différences avec les valeurs de référence sont stockées. Les probabilités sont des fractions : `0.315` signifie **31,5 %**. Les durées sont en minutes simulées.

## Limites intentionnelles

- Les **multiplicateurs généraux**, déjà présents sous l’atelier, restent des contrôles à application immédiate. Ils se cumulent avec les nouvelles valeurs et font partie de la sauvegarde complète, mais **pas du profil exporté par l’atelier**.
- Aucun changement d’équilibrage n’est appliqué pendant un spectacle en cours. Le brouillon peut être préparé, puis appliqué après le spectacle.
- Les échéances déjà enregistrées ne sont pas réécrites : changer le délai de départ initial affecte les nouvelles adhésions ; changer l’expiration d’invitation affecte les nouveaux appels. Les règles évaluées au fil du temps, comme l’éligibilité ou l’usure, utilisent immédiatement le profil après application.
- Le module ne prétend pas exposer tous les nombres du code. Les cycles et fourchettes personnelles des actions, plateaux d’apprentissage, effets des traits, cartes et règles internes BandLive, formules de qualité, adoption et plafonds de risque ne deviennent pas modifiables ici. Les champs sans consommateur réel ne sont pas affichés.
- Il n’y a ni optimisation automatique, ni compensation cachée, ni garantie qu’un réglage extrême produise une partie intéressante. La validation protège le format et les invariants explicités, pas l’équilibre ludique.
- Un profil constitue des différences avec les références de cette version. Si ces références changent dans une version future, les valeurs non surchargées suivront cette évolution.

## Architecture

`design-defaults.mjs` conserve les constantes partagées. `group-rules.mjs` et `v7.mjs` réexportent les références historiques pour les consommateurs existants. `design-rules.mjs` décrit les champs, leurs bornes, les catégories et les valeurs effectives via `rule(world, id)` ; il valide et applique les profils. `design-dashboard.mjs` ne possède qu’un brouillon d’interface et utilise ce contrat.

Le moteur, les groupes, les départs vers les spectacles et l’érosion relationnelle lisent le monde fourni explicitement. Les explications des invitations utilisent les délais actifs plutôt que des textes fixes. `restore()` valide le profil avant les migrations et contrôles restants, sans modifier l’objet fourni par l’appelant.

Tests : `tests/design.test.mjs` couvre isolation, effets réels, rejet atomique, continuation déterministe et anciens mondes. `tests/design-browser.test.mjs` couvre recherche, filtres, préparation/application, erreur, annulation, profil exporté/importé, rechargement et largeur mobile.

## Catalogue des paramètres

Les références ci-dessous proviennent du catalogue partagé du moteur. Elles ne sont pas une photographie des valeurs de ta partie : l’atelier affiche celles-ci dans **En jeu**.

### Groupes · formation

| Paramètre | Référence | Unité | Bornes |
|---|---:|---|---|
| Affinité minimale | 12 | points | -100 à 100 |
| Amour minimal | 25 | points | 0 à 100 |
| Tension maximale | 60 | points | 0 à 100 |
| Délai avant une formation | 2880 | min | 0 à 43200 |
| Délai avant recrutement | 1440 | min | 0 à 43200 |
| Délai entre propositions | 1440 | min | 1 à 43200 |
| Chance de proposer un groupe | 0.315 | probabilité | 0 à 1 |
| Chance de proposer un recrutement | 0.12 | probabilité | 0 à 1 |
| Poids du recrutement | 1.5 | × | 0 à 10 |

### Groupes · répétitions

| Paramètre | Référence | Unité | Bornes |
|---|---:|---|---|
| Intervalle des décisions | 360 | min | 1 à 10080 |
| Chance d’appeler une répétition | 0.5 | probabilité | 0 à 1 |
| Chance pour un groupe fragile | 0.75 | probabilité | 0 à 1 |
| Seuil de fragilité | 40 | points | 0 à 100 |
| Durée d’une invitation | 720 | min | 1 à 10080 |
| Attente sur place | 120 | min | 1 à 1440 |

### Groupes · départs

| Paramètre | Référence | Unité | Bornes |
|---|---:|---|---|
| Intervalle d’évaluation | 720 | min | 1 à 10080 |
| Délai initial de départ | 4320 | min | 0 à 43200 |
| Attachement faible | 20 | points | 0 à 100 |
| Risque d’insatisfaction | 0.08 | probabilité | 0 à 0.3 |
| Écart pour préférer un autre groupe | 25 | points | 0 à 100 |
| Risque de choisir l’autre groupe | 0.15 | probabilité | 0 à 0.3 |

### Groupes · attachement

| Paramètre | Référence | Unité | Bornes |
|---|---:|---|---|
| Poids · Affinité | 0.3 | × | 0 à 2 |
| Poids · Style musical | 0.1 | × | 0 à 2 |
| Poids · Chimie musicale | 0.1 | × | 0 à 2 |
| Poids · Réputation | 0.2 | × | 0 à 2 |
| Poids · Tension | 0.15 | × | 0 à 2 |

### Relations

| Paramètre | Référence | Unité | Bornes |
|---|---:|---|---|
| Gain d’affinité favorable | 1.2 | points | 0 à 20 |
| Perte d’affinité défavorable | 0.4 | points | 0 à 20 |
| Érosion par la tension | 0.0002 | points / min | 0 à 0.05 |
| Naissance du lien amoureux | 0.035 | probabilité | 0 à 1 |
| Seuil d’avance | 5 | points | 0 à 100 |
| Seuil de mise en couple | 40 | points | 0 à 100 |
| Seuil de rupture | 25 | points | 0 à 100 |
| Chance de mise en couple | 0.08 | probabilité | 0 à 1 |
| Chance de rupture | 0.15 | probabilité | 0 à 1 |

### Besoins

| Paramètre | Référence | Unité | Bornes |
|---|---:|---|---|
| Usure · Énergie | 0.065 | points / min | 0 à 2 |
| Usure · Connexion sociale | 0.035 | points / min | 0 à 2 |
| Usure · Plaisir | 0.04 | points / min | 0 à 2 |
| Usure · Expression | 0.05 | points / min | 0 à 2 |

### Actions · effets

| Paramètre | Référence | Unité | Bornes |
|---|---:|---|---|
| Détente · Plaisir | 0.12 | points / min | -2 à 2 |
| Détente · Énergie | 0.16 | points / min | -2 à 2 |
| Socialisation · Plaisir | 0.35 | points / min | -2 à 2 |
| Déchéance · Plaisir | 0.5 | points / min | -2 à 2 |
| Déchéance · Énergie | -0.18 | points / min | -2 à 2 |
| Pratique · Plaisir | 0.26 | points / min | -2 à 2 |
| Pratique · Énergie | -0.055 | points / min | -2 à 2 |
| Composition · Expression | 0.65 | points / min | -2 à 2 |
| Composition · Plaisir | 0.2 | points / min | -2 à 2 |
| Composition · Énergie | -0.03 | points / min | -2 à 2 |
| Jam · Expression | 0.7 | points / min | -2 à 2 |
| Jam · Plaisir | 0.5 | points / min | -2 à 2 |
| Jam · Connexion sociale | 0.6 | points / min | -2 à 2 |
| Jam · Énergie | -0.05 | points / min | -2 à 2 |

### Spectacles · présence

| Paramètre | Référence | Unité | Bornes |
|---|---:|---|---|
| Protection avant spectacle | 360 | min | 0 à 10080 |
| Marge d’arrivée | 10 | min | 0 à 1440 |
| Déchéance permettant une absence | 90 | points | 0 à 100 |
| Risque d’absence par point | 0.02 | probabilité / point | 0 à 0.2 |

## Lire les calculs dans l’Atelier

Chaque réglage dispose d’un volet **Comprendre le calcul et ses conditions**, utilisable au clavier et au toucher. Les formules utilisent les valeurs du brouillon et se mettent à jour pendant la saisie. Les explications précisent les déclencheurs, multiplicateurs, plafonds et exceptions ; les exemples de besoins montrent des gains ou pertes bruts, avant les autres effets et les limites des jauges.

Le volet ne simule pas une prédiction de la partie : les caractéristiques des personnages et les tirages aléatoires continuent d’intervenir. Les modifications restent en attente jusqu’à **Appliquer les changements**.

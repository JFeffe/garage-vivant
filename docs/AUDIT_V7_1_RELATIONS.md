# Audit V7.1 — Relations, confiance et formation des groupes

Audit du 10 octobre 2026 (heure de Montréal), avant exécution de la V7.2. Aucun changement de mécanique effectué.

## Version vérifiée

GitHub `main` pointe sur `75f60044a68d4602cf4ebc5d9f3f9b9aaaa3fd03`. Le workflow de publication 38081774248 est terminé avec succès pour ce commit. `dist/release.mjs` annonce 0.7.1 et les sources exécutables locales sont identiques à `main`.

Cela confirme la version du dépôt et du dernier déploiement réussi ; le cache de l’onglet et la sauvegarde exacte du concepteur ne sont pas inspectés. Voir Confiance est néanmoins compatible avec la V7.1 actuelle et ne prouve pas une ancienne version.

## Confiance : retrait non réalisé

Le menu Relations propose encore Confiance. `relationship` initialise `trust=10`, les interactions et moments musicaux le modifient, `formationEligible` exige 18 dans les deux sens, `acceptance` l’utilise pour les invitations/engagements et la validation des sauvegardes le conserve. Des effets de show le modifient également. Le DDD Relations le présente encore comme actif.

Ce n’est donc ni une simple valeur historique ni un défaut d’affichage : le retrait demandé n’a pas été réalisé. Une correction doit couvrir le schéma courant, les calculs, l’interface, les tests et la documentation, tout en préservant les historiques anciens.

## Méthode de reproduction

Parties neuves, huit personnages, `createWorld(seed, 8)`, paramètres par défaut, aucun scénario ou intervention. Avance minute par minute pendant 14 400 minutes de quartier (dix jours écoulés depuis le départ). Le pilote termine les éventuels shows avec les fonctions de skip existantes pour ne pas confondre pause de scène et temps simulé ; aucun groupe et donc aucun show de groupe n’a été rencontré dans ces échantillons. Relevés quotidiens, liens orientés sur les 56 relations possibles.

Graines V7.1 : 2040 (défaut), 1–8, 713. Comparaison historique V7 sur 2040, 1 et 713, depuis le commit `8e78d34f44ec7721bc462fe11f40f04f01aa72a7` extrait séparément, même pilote et mêmes réglages. La trajectoire aléatoire peut différer entre versions ; ce n’est pas un test causal isolant chaque changement V7.1.

## Résultats après dix jours écoulés

| Graine V7.1 | Groupes formés | Affinité moyenne | Affinité directionnelle maximale | Paires avec affinité ≥22 dans les deux sens |
|---|---:|---:|---:|---:|
| 2040 | 0 | 0.37 | 11.65 | 0 |
| 1 | 0 | 2.91 | 10.63 | 0 |
| 2 | 0 | 2 | 8.7 | 0 |
| 3 | 0 | 3.09 | 17.36 | 0 |
| 4 | 0 | 0.6 | 4.85 | 0 |
| 5 | 0 | 2.52 | 10 | 0 |
| 6 | 0 | 1.98 | 8.53 | 0 |
| 7 | 0 | 1.55 | 11.8 | 0 |
| 8 | 0 | 2.69 | 15.79 | 0 |
| 713 | 0 | -0.69 | 4.22 | 0 |

**Résultat : zéro groupe dans dix simulations sur dix.** Aucune paire admissible n’a été relevée aux points quotidiens ; à la fin des dix jours, même le maximum directionnel reste sous le premier seuil d’affinité dans chaque monde.

| Graine V7 | Groupes formés | Affinité moyenne | Affinité maximale |
|---|---:|---:|---:|
| 2040 | 0 | 2.84 | 11.69 |
| 1 | 0 | 2.77 | 16.21 |
| 713 | 0 | 0.08 | 3.69 |

Le problème se reproduit donc déjà sur la V7 examinée : il n’est pas exclusivement introduit par la V7.1. Cela ne démontre pas que toute partie restera sans groupe indéfiniment.

## Blocage identifié

Les affinités commencent à zéro. Un échange favorable social ajoute seulement 0,4 d’affinité par direction aux paramètres par défaut ; un défavorable retire 0,5. Les gains musicaux peuvent ajouter des bonus, mais les relations sont réparties entre partenaires. La tension persistante érode aussi l’affinité chaque minute, et les liens peu fréquentés décroissent légèrement chaque heure.

La formation conserve un seuil de 22 d’affinité réciproque, plus confiance 18, tension <40, et complicité 10 ou affinité réciproque 40. Même dans le cas social idéal sans perte ni autre effet, passer de 0 à 22 demande 55 échanges favorables avec le même partenaire. Ce calcul illustre l’écart d’échelle ; ce n’est pas une durée réelle prédite puisque musique, conflits et refroidissement modifient le résultat.

Dans la graine par défaut, dix jours donnent 221 échanges favorables, 82 neutres et 150 défavorables sur l’ensemble du quartier, mais l’affinité maximale atteint seulement 11,65. Sept paires satisfont déjà le seuil réciproque de confiance 18 : supprimer la confiance seule ne résoudrait pas le verrou d’affinité observé.

Les affinités sont surtout proches de zéro dans cet échantillon, pas uniformément très négatives. La sauvegarde réelle pourrait différer par ses réglages, son historique, sa population ou ses migrations ; cet audit ne prétend pas expliquer individuellement tous ses liens.

## Couverture manquante

Les tests vérifient de nombreuses règles, imports et reprises, mais les scénarios de groupes/musique utilisent fréquemment `createGroup(..., {manual:true})` ou des affinités initiales très élevées. La suite n’impose pas une formation naturelle effective dans une fenêtre de dix jours avec les réglages par défaut. Le succès de la CI ne validait donc pas le rythme de l’expérience autonome.

## Suite retenue : correction intégrée à la V7.2

La recommandation initiale de corriger séparément la base avant la V7.2 est remplacée : traiter les défauts et les nouvelles règles dans une seule implémentation, pour éviter un double équilibrage de mécanismes différents.

1. Retirer réellement confiance dans la V7.2, avec les nouvelles règles de formation.
2. Recalibrer ensemble vitesse des liens, conséquences de tension et seuils de formation à la cadence réelle. Ne pas fabriquer un groupe à date fixe ni forcer un seuil après X jours.
3. Ajouter une vérification reproductible de la chaîne naturelle rencontres → liens → groupe, sur plusieurs graines, accompagnée de mesures et sans exiger chaque partie identique.
4. Reprendre les paramètres proposés dans le plan V7.2 après ce diagnostic : son seuil 30 et ses probabilités additionnelles aggraveraient le verrou si appliqués directement aux gains actuels. Ils ne constituent pas une correction validée.
5. Tester une sauvegarde migrée en plus des parties neuves. Ne pas réinitialiser les relations existantes pour masquer le problème.

Les correctifs ne sont pas appliqués dans cet audit. La V7.2 n’est ni exécutée ni déployée.

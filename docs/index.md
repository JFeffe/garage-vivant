# Garage vivant — Guide V7.4

[Jouer à Garage vivant](https://jutrasimon.github.io/garage-vivant/)

**Version 0.7.4.** Les voisins pigent six actions d’éveil dans leur sac : Détente, Socialiser, Pratiquer, Jam, Composer et Déchéance. Dormir reste hors sac. Durées personnelles, projets persistants et demandes de participation rythment leur vie ; les règles V7 des besoins, émotions, traits et relations restent en place.

La [V7.3](./AUDIT_V7_3.md) corrige quatre transitions observées en simulation : morceau annoncé, départ individuel en répétition, expiration d’une séance en cours et fin des coauteurs. Aucun nouveau système ajouté.

## Observer et comprendre

La fiche montre sac, défausse, retraits en attente, fourchettes et séance. Une pige consomme le jeton même si la recherche échoue. Les acquisitions vont directement au sac ; seuls les jetons défaussés peuvent être retirés. L’entrée en socialisation est acceptée une fois, puis chaque échange produit directement un résultat et le destinataire décide de rester ou partir.

Pratiquer prépare la technique et les morceaux sans combler l’expression. Ensemble, il faut un morceau et un groupe commun. Jam commence solo, accueille d’autres musiciens et peut continuer seul ; il n’avance pas directement le répertoire ni la coordination. Composer développe plusieurs projets sur plusieurs séances. Déchéance lie excès rapprochés, jetons nuisibles et cartes ajoutées aux shows.

Les [quinze DDD](./gdd/documentation.md) décrivent les règles effectivement codées. Commence par [Actions](./gdd/actions.md), [Interactions](./gdd/interactions.md), [Musique](./gdd/musique.md) ou [Déchéance](./gdd/decheance.md). Les [raccords débranchés](./gdd/raccords-v7.md) sont aussi visibles dans Réglages. Le [plan de test complet V7 à V7.4](./PLAN_TEST_V7.md) propose un parcours rapide puis la réception de tous les systèmes, avec preuves et limites.

## Groupes autonomes

Les groupes ont leurs initiatives : adopter des chansons, appeler une pratique, réserver un spectacle. Leur fiche donne Coordination, réputation, compétences des membres, attachement, répertoire et histoire. Une proposition de groupe reste incertaine ; l’attachement à un groupe établi freine les nouvelles associations. La confiance n’est plus une dimension active.

La chanson garde ses auteurs, et son propriétaire unique apparaît dans le catalogue. Le groupe la conserve après départ d’un auteur. Répéter place une invitation dans la file personnelle, à consulter à la fin de l’activité avant la prochaine pige. Le premier arrivé attend sans gains ; deux membres présents commencent. Un spectacle confirmé prend priorité et calcule les départs depuis les positions réelles. Une dissolution est définitive. [DDD Groupes](./gdd/groupes.md).

Dans **Groupes → Archives**, retrouve les groupes dissous, leurs anciens membres, morceaux, spectacles et histoire. Les boutons Actifs/Archives indiquent leur nombre ; un groupe consulté qui se dissout reste accessible dans sa fiche.

## Classer les compositions

Dans Journal, Compositions et chansons réunit projets et morceaux. Recherche un titre, auteur ou groupe ; combine qualité, genre, rattachement, type et état. Trie par qualité, date, avancement ou maîtrise du contexte choisi. Les morceaux faibles, archives et abandons sont masqués par défaut mais restent consultables. Une chanson faible reste jouable si les autres possibilités manquent.

Ouvre la fiche pour voir auteurs, rattachement, qualité, sources et maîtrise individuelle/collective. Un projet montre son avancement et son potentiel provisoire. Les nouvelles banques de noms distinguent groupes et chansons, avec unicité persistante. [Compositions et catalogue](./gdd/compositions.md).

## Du garage à la scène

1. Dans Groupes, choisis un band ou invite un voisin pour en créer un. Un échange favorable admissible peut aussi créer ou agrandir un groupe.
2. Adopte des morceaux, pratique avec tes partenaires et prépare une setlist dans Shows.
3. Choisis une des quatre dates et un créneau ; les petites scènes acceptent le premier band confirmé, les grosses sélectionnent leurs candidatures.
4. Surveille énergie, déchéance, maîtrise et cartes. Les membres restent libres de refuser leurs engagements.
5. Avancer jusqu’au show simule les trajets. Sur scène, le quartier se fige ; Pause, inspection et Sauter gardent le même résultat.
6. Consulte le bilan, puis poursuis avec le groupe suivant ou termine la soirée.

La [scène](./gdd/shows.md), le [sommeil](./gdd/sommeil.md), les [besoins](./gdd/personnages.md) et les [relations](./gdd/relations.md) gardent leurs DDD. [Technique](./gdd/technique.md) explique la migration des parties V1–V7 et la reprise déterministe.

## Rechercher les règles

**Ctrl+Espace** ou Rechercher dans le jeu ouvre les mêmes contenus que VitePress. Essaie plateaux, défausse, coauteurs, qualité relative, chaîne de déchéance ou noms. Les [notes de version](./versions.md) décrivent les changements ; le [plan V7.2](./PLAN_V7_2.md) conserve les décisions, arbitrages et limites de réalisation.

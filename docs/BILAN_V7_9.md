# V7.9 — Personnalisation et groupes vivants

Cette version réutilise les systèmes présents : identité, accessoires, commandes de départ, création de groupe, adoption et invitations de répétition. Elle ne crée ni albums, ni nouveaux besoins, ni mécanique de sauvetage automatique.

## Intégration avec main

Cette livraison initialement préparée sous le numéro 7.6 devient **7.9** après les versions BandLive 7.6, 7.7 et 7.8. Le module BandLive, son activation optionnelle, ses spectacles du calendrier, ses historiques, ses contrôles tactiles et ses tests sont conservés. L’éditeur d’équilibrage sera développé séparément après cette fusion. Les 69 tests moteur/interface/documentation de l’ensemble intégré passent.

## Décisions

- Chansons : crédit Composition explicite, coauteurs cliquables et propriétaire séparé.
- Personnages : nom, surnom facultatif, apparence partagée, suppression confirmée et crédits conservés.
- Carte : huit options persistantes, actions individuelles et collectives indépendantes.
- Shows : consultation sans pause imposée; spectacles toujours prioritaires.
- Nouvelle partie : configurations de 1 à 4 groupes possibles selon population, ou départ sans groupe. Import inchangé.
- Formation : 28 → 31,5 % de proposition (+12,5 % relatif); recrutement inchangé.
- Persistance : appels de pratique 75 % sous 40 de coordination, sinon 50 %; première évaluation de départ après 72 h. Répertoire requis, invitations refusables, gains réels seulement.

## Validation

Les suites moteur/interface/doc et le parcours Chromium vérifient identité, affichage, crédits, suppression, sauvegardes, réglages et navigation Shows. Six formats de scène, de l’ordinateur au téléphone portrait/paysage, restent vérifiés.

Seize parties avec configuration initiale **varied**, quinze jours écoulés : **242 chansons et 98 spectacles**, aucun état invalide ni anomalie d’activité observé, 240 validations quotidiennes exactes et 16 continuations de quatre heures exactes. Les 16 parties conservent au moins un groupe à J15. Dans les douze quartiers de huit personnages, 11 ont un groupe d’au moins trois membres à J15. Ce protocole utilise les groupes initiaux et ne mesure donc pas à lui seul l’amélioration de la formation naturelle. [Données des parties](./AUDIT_V7_9.json).

Un défaut ancien de référence partagée dans le journal a été trouvé sur la graine 14 à trente jours : recruter pouvait réécrire les participants d’événements antérieurs. Les identifiants sont maintenant copiés à l’émission; un test de recrutement avant/après rechargement protège le correctif.
 Le [plan manuel](./PLAN_TEST_V7.md) inclut H01–H10. Les [raccords non branchés](./gdd/raccords-v7.md) restent inchangés.

## Limites explicites

Les portraits sont fixes; l’allure anime la carte. Les noms historiques du journal ne sont pas réécrits après un renommage. Les préférences de carte sont propres au navigateur, hors export du monde. Un groupe sans répertoire ne peut pas appeler une répétition de chanson : il doit composer puis adopter normalement. Les configurations initiales donnent une histoire commune via affinités et coordination, pas un répertoire inventé. Aucun album, groupe immortel ou objectif chiffré de nombre de groupes. Dans le petit quartier de quatre personnages, la graine 713 passe encore environ 60 % des minutes-personnes sous le seuil social critique : constat conservé, sans retoucher arbitrairement la boucle des besoins.

## Formation naturelle sans groupe initial

Vingt graines identiques à V7.5, trente jours chacune et trois prolongements à 90 jours. [Données V7.9](./BALANCE_V7_9.json) · [référence V7.5](./BALANCE_V7_5.json).

| Mesure | V7.5 | V7.9 |
|---|---:|---:|
| Première formation avant J5 | 13/20 | 13/20 |
| Première formation avant J10 | 20/20 | 20/20 |
| Au moins un trio atteint avant J10 | 9/20 | 11/20 |
| Groupes actifs à J30 | 37 | 46 |
| Actifs âgés d’au moins sept jours | 37 | 44 |
| Groupes actifs de trois membres ou plus | 29 | 26 |
| Pratiques effectivement commencées | 906 | 1 016 |
| Départs cumulés | 58 | 47 |

Le réglage réduit les départs et conserve davantage de groupes, dont davantage de duos. Il ne rend pas toutes les formations plus rapides ni tous les bands plus grands : le délai de première formation n’améliore pas les comptes J5/J10 de cette cohorte. Le départ préconfiguré répond directement au souhait de voir des bands dès le début. Les trois prolongements à J90 et les vingt continuations exactes après rechargement passent; les seuils de non-régression n’ont pas été assouplis.

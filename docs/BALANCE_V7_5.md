# Équilibrage des groupes V7.5

11 octobre 2026. Version livrée 0.7.5, format de sauvegarde inchangé 0.7.3. Mandat : rendre la formation légèrement plus facile et permettre aux duos de recruter davantage, en conservant les groupes durables et les refus.

## Diagnostic et règles retenues

En V7.4, la probabilité de proposer un recrutement comptait le band cible comme une appartenance concurrente. Un musicien très attaché à son propre groupe proposait donc rarement de le compléter. Une adhésion relançait aussi une attente de 48 h chez le recruteur et le candidat. Les formations fonctionnaient, mais les duos dominaient encore après plusieurs semaines.

Les [règles courantes](./gdd/groupes.md#formation-et-recrutement) gardent les mêmes transitions et les mêmes critères relationnels :

| Paramètre | V7.4 | V7.5 |
|---|---|---|
| Base de proposition d’une nouvelle formation | 22 % | 28 % |
| Base de proposition d’un recrutement | 22 %, pénalisé par le groupe cible | 12 %, groupe cible exclu de la pénalité |
| Poids du choix d’un groupe existant | 1 × poids d’attrait | 1,5 × poids d’attrait |
| Attente avant recrutement | 48 h chez les deux partenaires | 24 h chez le candidat, aucune attente chez le recruteur |
| Date de dernière adhésion après recrutement | Réinitialisée chez les deux | Nouvel adhérent seulement |
| Attente avant nouvelle formation | 48 h chez les deux | Inchangée |

Ces bases sont des chances de **proposer** après un échange favorable admissible, pas les chances de rejoindre automatiquement. L’acceptation reste séparée et conserve la réticence des candidats déjà engagés ailleurs. Affinité réciproque ≥12 ou amour réciproque ≥25, tension <60, liens avec au moins la moitié des membres et délai de paire de 24 h restent inchangés. Un refus reste possible. Aucun membre offert, quota de taille, plafond d’appartenances ni recrutement sans rencontre.

## Comparaison sur vingt graines

Même protocole avant/après : huit personnages, graines `2040`, `1` à `18`, `713`, paramètres par défaut ; 30 jours écoulés, prolongement de 2040/1/2 à 90 jours. Les commandes existantes de saut des spectacles résolvent leurs vrais résultats. Aucune création de band ni préparation des relations. Rechargements exacts aux jours 3/5/10/30, puis continuation comparée de 240 minutes.

La référence est le moteur V7.4 au commit `c5dcda6485cf42e6091a32d1029542a6f7b5baba`, avec l’instrumentation d’audit enrichie pour relever les tailles et le premier trio, sans changement de règles. La version corrigée utilise `recruitmentProposal=0.12`, `recruitmentWeight=1.5` et les autres coefficients du DDD. `npm run audit:groups` produit les résultats courants ; un argument de chemin permet de conserver un rapport distinct.

| Observation | V7.4 | V7.5 |
|---|---:|---:|
| Première formation avant J5 | 11/20 | 13/20 |
| Première formation avant J10 | 20/20 | 20/20 |
| Parties ayant déjà eu un band ≥3 membres avant J10 | 2/20 | 9/20 |
| Première arrivée à trois membres, médiane des parties ayant atteint ce seuil | 15,80 j | 10,65 j |
| Bands actifs à J30 | 48 | 37 |
| Parmi eux, bands ≥3 membres | 17/48 | 29/37 |
| Bands actifs âgés d’au moins 7 jours à J30 | 40/48 | 37/37 |
| Musiciens attachés ≥60 avec une seule appartenance à J30 | 82/92 | 116/127 |
| Maximum d’appartenances simultanées observé aux contrôles de J30 | 2 | 2 |
| Répétitions réellement commencées, cumul à J30 | 729 | 906 |
| Départs cumulés à J30 | 67 | 58 |
| Bands actifs à J90 sur les trois prolongements | 7 | 5 |
| Parmi eux, âgés d’au moins 30 jours | 7/7 | 5/5 |
| Musiciens attachés ≥60 en groupe unique à J90 | 21/22 | 20/22 |

Les nombres de bands sont cumulés entre parties, pas dans un seul quartier. « Déjà eu un trio » compte le premier franchissement, même si ce band évolue ensuite ; les tailles ci-dessous sont celles des groupes encore actifs à J30.

| Taille à J30 | V7.4 | V7.5 |
|---|---:|---:|
| 2 | 31 | 8 |
| 3 | 11 | 13 |
| 4 | 3 | 6 |
| 5 | 3 | 2 |
| 6 | 0 | 4 |
| 7 | 0 | 4 |

[Référence V7.4](./BALANCE_V7_5_BASELINE.json) · [Résultats V7.5 et coefficients](./BALANCE_V7_5.json). Les rapports V7.2/V7.3 restent conservés. Les seuils de réception CI vérifient ≥16/20 premières formations avant J10, ≥16/20 parties ayant eu un trio avant J30, une majorité de bands actifs ≥3 membres et une majorité d’attachés en groupe unique ; ils ne sont jamais appliqués comme quotas au moteur.

## Seize parties complètes de quinze jours

Le contrôle `npm run audit:simulation` rejoue douze graines à huit personnages et quatre variantes à quatre/douze personnages. Il observe actions, projets, morceaux réellement travaillés, échéances, besoins et scènes, valide exactement les 240 sauvegardes quotidiennes et compare les seize continuations de 240 minutes. [Données complètes](./AUDIT_V7_5.json).

À J15, 11/12 quartiers de huit personnages ont un band actif d’au moins trois membres, contre 2/12 dans le [contrôle V7.3](./AUDIT_V7_3.md), dont le moteur de groupes est celui conservé en V7.4. Les seize parties totalisent 274 chansons, 138 adoptions et 46 prestations. Aucun des invariants observés n’est violé, aucun blocage ni écart de rechargement n’est relevé.

## Validation et limites

Cinq tests ciblés couvrent recrutement successif à trois/quatre membres, recruteur attaché, délai de candidat, liens avec la moitié de l’effectif, tension, réticence au multigroupe, refus partagé entre commande et autonomie, et choix d’un band existant. Les suites moteur/documentation et Chromium sont exécutées avant publication ; le plan humain ajoute [G28–G30](./PLAN_TEST_V7.md).

L’amélioration concerne surtout la croissance des duos : la première formation est seulement légèrement avancée sur cette cohorte. À J30, 19/37 bands comptent trois ou quatre membres, mais huit en ont six ou sept ; aucun plafond n’est ajouté pour les empêcher. Dans les deux quartiers de quatre personnages à J15, le band reste un duo : population, rencontres et affinités limitent encore le recrutement. Ces mesures ne garantissent pas un effectif dans une partie particulière.

La stabilité et l’appartenance unique restent majoritaires, mais pas absolues. Les niveaux de plaisir élevés, la pression sociale des petits quartiers et le rythme d’apprentissage demandent encore la réception humaine déjà prévue. Les quatorze [raccords débranchés](./gdd/raccords-v7.md) restent identiques ; aucun tuyau supplémentaire n’est débranché ou remplacé. Recharger une ancienne partie ne donne aucun musicien automatiquement : ses prochains échanges appliqueront les nouveaux réglages, en gardant membres, œuvres, archives et horodatages.

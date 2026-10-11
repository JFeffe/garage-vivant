# V7.2 — Groupes autonomes, attachement et répertoire

**Statut : réalisé en V0.7.2 ; publication de main après validation.** Décisions du 10 octobre 2026. Base examinée : V0.7.1, commit `75f60044a68d4602cf4ebc5d9f3f9b9aaaa3fd03`.

Ce document distingue les décisions du concepteur des arbitrages proposés dans son mandat de design simple. Les formules et nombres nouveaux ci-dessous sont une première configuration exécutable, à éprouver : ils ne sont ni des paramètres déjà validés en simulation, ni des nombres dictés par le concepteur. L’exécutant doit consigner tout ajustement dans une section Réalisation.

## Corrections intégrées à la V7.2 après audit

L’[audit V7.1](./AUDIT_V7_1_RELATIONS.md) reproduit zéro groupe en dix jours dans dix parties neuves : confiance encore active et affinités trop faibles pour la formation. **La correction fait partie de la V7.2, dans la même implémentation que les nouvelles règles de groupe.** Ne pas recalibrer puis livrer séparément l’ancien mécanisme destiné à disparaître.

Les intentions validées restent : liens lents mais utiles, variance, expérimentation initiale, stabilisation des groupes établis, multigroupe possible et marginal à maturité. Les coefficients proposés (dont affinité 30 et proposition 6 %) sont des hypothèses à remplacer si les mesures les invalident, pas des contraintes de conception.

### Ce que les nouveautés corrigent — et ce qu’elles ne corrigent pas

- Retirer confiance supprime une dépendance obsolète, mais ne rend pas les affinités suffisantes à lui seul.
- Appels de pratique et attachement favorisent la vie d’un groupe déjà créé. Ils ne débloquent pas sa première formation.
- Réputation, invitations et répertoire peuvent soutenir sa stabilité après création ; cela doit être observé, pas supposé.
- La chaîne complète à calibrer est : occasions de rencontre → évolution des liens → admissibilité → proposition → acceptation → pratique → attachement → maintien ou départ.

### Lot de correction dans l’implémentation

1. Conserver les mesures V7.1 comme référence ; instrumenter occasions, résultats relationnels, pertes par tension, paires admissibles, propositions et acceptations. Pas de modification des liens pour préparer le test.
2. Implémenter les règles finales V7.2 et supprimer les chemins anciens ainsi que confiance ; paramètres de relations et groupes regroupés dans des configurations explicites.
3. Calibrer ensemble gains/pertes relationnels, érosion par tension, seuils, fréquence de proposition et acceptation. Préserver les liens graduels ; ne pas multiplier tous les gains aveuglément ni empiler des probabilités rares sans mesurer le délai total.
4. Tester la boucle complète avec pratiques, attachement, réputation et départs actifs. Un réglage provisoire du seul démarrage ne constitue pas la validation finale.
5. Vérifier la continuité des sauvegardes V7.1 : aucune remise à zéro des relations et aucun groupe créé par migration pour masquer le défaut. Les nouveaux calculs agissent sur leur évolution future.

### Critères de réception d’expérience proposés

Sur au moins 20 graines prédéfinies, huit personnages, paramètres par défaut, sans création manuelle ni liens gonflés : au moins 80 % des parties doivent avoir formé naturellement un groupe après dix jours écoulés. C’est une cible de test proposée pour éviter le défaut observé, jamais un quota ou un mécanisme déclenché au jour 10. Rapporter aussi les résultats aux jours 3 et 5 et les graines qui échouent.

Sur 30 jours et davantage, mesurer survie des groupes, rotation et appartenances. Parmi les musiciens dont le meilleur attachement est au moins 60, la majorité doit appartenir à un seul groupe actif ; un multigroupe occasionnel reste autorisé. Vérifier que des groupes réellement actifs survivent au-delà de plusieurs cycles de délai de 48 h, sans protéger artificiellement les groupes qui ne pratiquent pas. Documenter résultats et ajustements ; ces critères ne sont pas annoncés comme déjà atteints.

Conserver les tests d’invariants, mais ajouter cette réception de bout en bout : des groupes créés artificiellement dans les tests unitaires ne prouvent pas l’émergence autonome. Aucune nouvelle mécanique de secours (groupe forcé, affinité offerte, jeton injecté, délai secret). Les sections suivantes conservent le plan initial ; la section Réalisation en fin de document décrit le code retenu.

## 1. Expérience recherchée

Les musiciens expérimentent des associations au début. Lorsqu’un groupe fonctionne, ses membres s’y investissent, répètent, développent leur répertoire et jouent ensemble durablement. Plusieurs appartenances restent possibles ; elles doivent devenir marginales chez les musiciens attachés à un groupe établi. Éviter huit groupes par personne et une rotation incessante des membres.

Le groupe prend des initiatives à partir de ses données : adopter des chansons, appeler une pratique, chercher et réserver un spectacle. Les individus réalisent les activités physiques avec leurs besoins, actions et relations propres.

Cette passe couvre les groupes, leur répertoire, les invitations, les raccords aux actions et aux spectacles, la lisibilité, l’architecture, les migrations et la documentation. Elle ne refond pas la scène entière.

**Hors périmètre :** albums, palmarès, diffusion commerciale, économie, nouveau système de fans persistants, litiges ou transferts de chansons, groupe solo autonome, résurrection d’un groupe dissous, nouveaux besoins ou personnalité de groupe, agenda général, nouvelle action du sac, refonte des cartes. Les exemples de groupes célèbres et de palmarès expriment l’expérience souhaitée, pas des fonctionnalités à créer.

## 2. Décisions à respecter

| Sujet | Direction retenue |
|---|---|
| Architecture | Entités cohérentes, fonctions partagées et paramétrées, règles centralisées ; pas d’obligation de classes ou d’héritage |
| Confiance | Retirée du design ; éliminer ses consommateurs résiduels sans remplacement caché |
| Formation | Proposition occasionnelle et acceptation, plutôt que création automatique après un échange favorable |
| Conditions | Bonne affinité ou amour ; chimie musicale favorable mais facultative |
| Multigroupe | Possible ; appartenances et attachement existants freinent les nouvelles associations |
| Délai | 48 h après création ou adhésion réussie ; aucune attente initiale aux personnages sans groupe |
| Genre | Design simple, couleur issue des fondateurs puis du répertoire ; aucune mécanique d’album |
| Compétences | Moyenne, minimum et maximum des membres pour chaque compétence/instrument |
| Coordination | Nom conservé ; peut remonter tant qu’elle reste supérieure à zéro |
| Attachement | Valeur calculée par personnage et par groupe : coordination, affinités, compatibilité musicale, chimie, réputation |
| Réputation | Reconnaissance globale distincte des fans ; chansons et spectacles contribuent |
| Auteurs | Individus seuls ou coauteurs ; crédit permanent |
| Adoption | Une chanson, un groupe propriétaire ; auteur et propriétaire sont distincts |
| Départ d’auteur | Chanson et maîtrise collective restent au groupe ; auteur toujours crédité |
| Autonomie | Pratique, adoption et inscription aux spectacles |
| File personnelle | Invitations de pratique uniquement dans cette passe, hors sac |
| Spectacle | Engagement prioritaire ; départ calculé selon le trajet ; présence normale sans nouveau refus ordinaire |
| Départs | Faible attachement ou attrait nettement supérieur d’un autre groupe |
| Dissolution | Coordination zéro ou moins de deux membres ; histoire conservée, aucune reprise |
| Moral de scène | Fonctionnement V7.1 conservé pour cette passe |
| Présentation | Libellés d’activité lisibles malgré effets d’action/émotion et proximité des personnages |

La propriété unique a reçu l’accord général sur le répertoire. La dissolution sous deux membres a été proposée à la clôture du sujet et sert ici de règle simple d’exécution. Le détail chiffré, le genre et la réputation relèvent du mandat de design confié à l’exécutant. Toute évolution doit être signalée, sans présenter une proposition comme une ancienne règle du jeu.

## 3. État réel du code

| Point d’entrée V7.1 | État actuel et changement requis |
|---|---|
| `engine.mjs: formationEligible`, `interaction`, `formationPlan`, `createGroup` | Affinité/confiance/complicité, création automatique, délai 12 h : remplacer par politique unique ; retirer les chemins concurrents ou morts |
| `v7.mjs: partnerWeight` | Bonus `1 + development/8` : utiliser l’attachement individuel au groupe commun |
| `life.mjs: acceptance`, `invite` | Confiance et règles manuelles distinctes : partager admissibilité/conséquences ; gérer `createGroup` retournant `null` |
| `life.mjs: rehearse` | Démarrage immédiat des partenaires : remplacer par invitations différées |
| `life.mjs: lifeMinute` | Adoption horaire déterministe, répertoire inférieur à trois, groupes du joueur exclus : adoption pondérée pour tous |
| `life.mjs: repertoire`, `eligibleSongs` | Pas de propriété exclusive : distinguer disponibilité, propriété et sélection active |
| `calendar.mjs: calendarMinute`, `bookShow` | Recherche autonome déjà présente : raccorder, ne pas ajouter un second moteur de réservation |
| `life.mjs: assemble`, `travelEngagement`, `nextSlot` | Départ collectif jusqu’à 180 min avant : calcul individuel du trajet et audit des filtres de présence |
| `life.mjs: initializeGroup`, décroissance, `revive` | Coordination 18, déclin après inactivité, relance : conserver évolution et supprimer la relance |
| `engine.mjs: removePerson` | Nettoyage d’appartenances lors du retrait du quartier : partager avec départ de groupe sans supprimer le personnage |
| `stage.mjs`, `calendar.mjs` | Moral actif : conserver effets et historique |
| `v5-view.mjs`, `v7-view.mjs`, `app.mjs`, `index.html` | Vues et commandes anciennes : actualiser libellés, raisons et informations |

**Écart confirmé :** `trust` est encore initialisé, validé, affiché et modifié dans interactions, moments musicaux et bilans de show. Le retirer seulement de la formation laisserait la confiance active ailleurs. Le plan V7 reportait explicitement l’attachement individuel ; le bonus commun de coordination n’est pas une valeur personnelle déjà enregistrée.

## 4. Architecture et contrats

### 4.1 Organisation

Conserver des objets de données sérialisables et privilégier la composition. Pas de hiérarchie artificielle Personnage/Groupe/Chanson. Une classe éventuelle doit garantir un invariant utile ; la sauvegarde ne doit pas dépendre de prototypes JavaScript.

Extraire un domaine `groups.mjs` et une configuration `group-rules.mjs` (noms adaptables aux conventions). Dépendances des orchestrateurs vers le domaine, sans imports réciproques du moteur par ses règles. Passer explicitement monde, temps, paramètres et générateur aléatoire. Séparer calcul pur, décision, application et affichage.

Lectures d’inspecteur sans hasard ni mutation. Toutes les commandes autonomes et manuelles utilisent les mêmes services d’application. Une commande invalide renvoie sa raison et ne laisse aucun membre, nom, propriété ou invitation partiellement modifié.

| Service proposé | Contrat |
|---|---|
| `getAttachment` | Score et contributions explicables, lecture pure |
| `getGroupSkillSummary` | Moyenne/min/max et identités des extrêmes par compétence |
| `getGroupStyle` | Genre dominant et répartition |
| `canForm`, `canJoin`, `canAdopt` | Admissibilité et raisons, sans tirage |
| `proposeMembership`, `applyMembership` | Tirages enregistrés, application atomique et délais |
| `adoptSong` | Propriété unique, crédit intact, entrée de répertoire unique |
| `requestRehearsal`, `resolveInvitation` | Demande commune, invitations individuelles idempotentes |
| `evaluateGroupDecision` | Initiative admissible, horloge persistante |
| `leaveGroup`, `dissolveGroup` | Nettoyage, anciens membres, historique |
| `planShowDeparture` | Heure et route fondées sur le coût réel du déplacement |

Partager aussi la clôture d’action : sommeil, séances, compteurs, défausse. Une interruption termine l’action ; aucune reprise automatique ni restitution de jeton.

### 4.2 Données

- **Groupe :** identité, fondateurs, membres, anciens membres, coordination, réputation, répertoire et historique conservés ; état terminal, date/motif de dissolution, horloges de décision, demande de pratique active ajoutés.
- `development` peut rester le champ interne de coordination pour éviter une migration cosmétique. Toute interface parle de Coordination ; aucun deuxième compteur équivalent.
- **Appartenance :** relation unique personnage/groupe, dates d’entrée/sortie et motif ; préserver fondateurs et anciens membres même après retrait d’un personnage du quartier.
- **Attachement :** calcul dérivé, sans accumulation autonome ni copies divergentes. Tout cache doit être invalidé sur changement de membres, relations, coordination, répertoire ou réputation.
- **Chanson :** auteurs inchangés ; `ownerGroupId`, `adoptedAt`, provenance de migration. Contexte de création séparé du propriétaire.
- **Répertoire :** chanson, maîtrise, répétitions et sélection active/inactive. Désactiver ne détruit ni propriété ni maîtrise.
- **Invitation personnelle :** identifiant, référence à la demande de groupe, création, expiration, état/réponse, motif.
- **Demande de pratique :** groupe, lieu, morceau, invités, expiration, état, référence de séance. Les invitations ne copient pas un état de séance indépendant.

## 5. Formation et recrutement

### 5.1 Admissibilité proposée

Une paire est admissible avec affinité au moins 30 dans les deux directions **ou** amour au moins 25 dans les deux directions ; tension inférieure à 60 dans les deux sens. Une attirance unilatérale ne suffit pas. Retirer confiance et seuil de complicité : avoir déjà joué ensemble n’est pas obligatoire.

Les deux partenaires respectent 48 h depuis leur dernière création/adhésion réussie. À l’initialisation, ce délai est déjà écoulé. Un groupe actif commun empêche un nouveau groupe doublon avec cette paire. Aucun plafond global artificiel de groupes ou de membres.

Rejoindre un groupe nécessite que la moitié de ses membres, arrondie au supérieur, satisfasse les conditions relationnelles avec le candidat. Ce filtre remplace une simulation de vote ; ne pas ajouter de vote collectif.

### 5.2 Proposition et acceptation

Après un échange favorable admissible, tirer une proposition ; ce résultat ne crée plus automatiquement un groupe. Avec `n` groupes actifs et `Amax` le meilleur attachement de l’initiateur :

`P(proposition) = 0,06 / (1 + n²) × max(0,05 ; 1 − Amax/100)`.

Sans groupe : 6 % par occasion admissible. Au plus une proposition par paire pendant 24 h, acceptée ou refusée. Cette protection contre les sollicitations répétées est distincte des 48 h après adhésion. Vérifier en simulation la fréquence à la cadence réelle des échanges.

Options : créer un duo, ou rejoindre un groupe admissible de l’un des deux partenaires. Choix pondéré `1 + attrait/25`, sans priorité absolue à rejoindre. Attrait = attachement prospectif du candidat ; pour un duo, coordination initiale 18, réputation 0 et profils des fondateurs. L’option précise qui invite qui.

Acceptation initiale proposée, depuis le point de vue du destinataire :

`P0 = clamp(0,20 + affinité/200 + amour/400 + chimie/1000 − tension/250 + attrait/500 ; 0,10 ; 0,95)`.

Puis `P = P0 / (1 + 0,75 × nDest) × max(0,10 ; 1 − AmaxDest/100)`. Chimie positive mais jamais condition obligatoire. Les probabilités restent strictement inférieures à une certitude.

Sur succès : une mutation d’appartenance et délai des deux partenaires actualisé. Sur refus : aucune appartenance/jeton modifié ; conserver la réaction de refus existante, sans inventer une sanction. Journaliser conditions, chance, tirage, résultat, groupe et partenaires. Une banque de noms épuisée refuse proprement la création sans résultat partiel.

La commande manuelle saute le hasard d’émission de proposition mais respecte admissibilité, délais et acceptation. Une dérogation de laboratoire reste explicitement identifiée et distincte du jeu normal.

## 6. Identité, genre et compétences

Conserver nom, identifiant, création, fondateurs, membres et anciens membres. Réutiliser les banques de noms V7.1 et le registre d’unicité, sans suffixe ou doublon de secours.

**Couleur musicale minimale proposée :** sans répertoire, tirer une fois un genre parmi ceux des fondateurs, pondérés par leur nombre. Après adoption, genre dominant = genre le plus fréquent des chansons actives. En cas d’égalité, conserver le précédent s’il est à égalité ; sinon utiliser l’ordre stable du catalogue de genres. Pas de nouveau tirage à chaque affichage. Sans chanson active, revenir à la couleur initiale sauvegardée.

Montrer éventuellement la répartition sans créer une nouvelle statistique de gameplay. Pas de matrice inventée de sous-genres ni d’intention supplémentaire obligatoire. Les instruments participent déjà à la chimie existante.

Pour chaque compétence existante, calculer moyenne, minimum et maximum des membres actuels. Exclure les anciens ; zéro est une valeur réelle, une compétence absente relève de la validation et ne devient pas un zéro inventé. Une ligne et une échelle par compétence, trois repères fusionnés s’ils coïncident, détails des ex æquo. Ces valeurs décrivent le groupe, elles ne remplacent pas les compétences des musiciens réellement présents sur scène.

## 7. Attachement individuel

Une valeur 0–100 par personnage et groupe. Bien jouer ensemble et aimer y rester sont distincts. Le groupe donne la base de coordination ; liens, préférences et réputation modulent le résultat.

Première formule proposée :

`A = clamp(C + 0,30 × (F−50) + 0,10 × (S−50) + 0,10 × (H−50) + 0,20 × R − 0,15 × T ; 0 ; 100)`.

- `C` : coordination du groupe.
- `F` : moyenne des affinités ressenties par le personnage envers les autres membres, bornées 0–100 pour ce calcul ; exclure l’auto-relation.
- `S` : proportion des chansons actives du même genre que le personnage, ×100 ; sans chanson, proportion des fondateurs de ce genre.
- `H` : moyenne des chimies existantes avec les autres membres.
- `R` : réputation du groupe.
- `T` : moyenne des tensions ressenties envers les autres membres.

Exemple : C=70, F=20, S=50, H=50, R=90, T=50 donne 71,5. Le succès peut retenir quelqu’un malgré des relations difficiles. Avec C=18, F=40, S=50, H=60, R=0, T=0, le résultat est 16 : les jeunes groupes sont fragiles, d’où la période de grâce avant départ. Ces exemples sont des calculs de contrôle, pas une validation d’équilibrage.

Les chansons participent déjà à réputation et style : pas de troisième bonus de qualité caché. La chimie comporte déjà du genre ; conserver des poids modestes pour limiter le double comptage.

Remplacer le bonus de partenaires par `1 + A/8`, selon l’initiateur, pour le groupe actif partagé le plus attractif. Conserver les autres poids de partenaires. Le même attachement sert aux invitations, au multigroupe et aux départs. Afficher les contributions tout en respectant les règles de découverte de la chimie et le mode laboratoire : ne pas révéler une valeur cachée via une nouvelle infobulle.

## 8. Réputation et moral

### 8.1 Réputation

Reconnaissance globale distincte des fans et du nombre brut de spectacles. Conserver une composante issue des résultats de shows, et ajouter un catalogue :

`catalogue = 0,20 × moyenne des qualités des trois meilleures chansons possédées × min(1 ; nombrePossédé/3)`.

Sans chanson : zéro. Réputation = composante spectacles + catalogue, bornée 0–100. Les résultats existants modifient la composante spectacles, jamais une seconde fois le total. Pas de hasard à chaque lecture : la variance provient des compositions, adoptions et spectacles. Une chanson mise de côté reste possédée et contribue, évitant de manipuler le score par masquage.

Migration : composante spectacles = `max(0 ; ancienneRéputation − catalogue)`. Conserver ainsi la valeur affichée quand possible ; si le catalogue dépasse l’ancien score, signaler le recalcul. Diffusion et fans persistants restent hors périmètre. Ne pas transformer les spectateurs d’une prestation en compteur permanent.

### 8.2 Moral de scène conservé

Base 60, show réussi +6, public déçu jusqu’à −15, candidature refusée −8 ; effets s’effaçant en 48 h. Conserver influence sur occasions, puissance des cartes et interprétation. Aucun nouveau rôle dans les départs, aucune fusion avec attachement/coordination/réputation.

## 9. Auteurs, propriété et répertoire

Les individus composent seuls ou avec des coauteurs. Le contexte de composition ne transfère pas automatiquement la propriété. La composition collective conserve les restrictions V7.1 de groupe commun.

Adoption admissible : groupe actif, chanson terminée, sans propriétaire, au moins un auteur membre actuel. Projet inachevé non admissible. Une adoption fixe groupe et date, conserve les auteurs, ajoute une entrée unique au répertoire. Maîtrise collective initiale zéro sauf maîtrise historique migrée ; maîtrises personnelles inchangées.

Après départ d’un auteur, chanson et maîtrise restent au groupe. L’œuvre reste dans son registre personnel avec propriétaire indiqué et cliquable. Aucune copie, cession ou adoption par un second groupe.

Distinguer possession et sélection active. « Mettre de côté »/« Réactiver » remplace un retrait ambigu : propriété et maîtrise ne sont pas supprimées. Œuvres faibles/archivées restent consultables et utilisables manuellement. Après dissolution, la chanson appartient toujours au groupe historique ; sa remise en circulation est reportée.

### Adoption autonome proposée

Examen toutes les 6 h de quartier, décalage initial sérialisé par groupe ; au plus une adoption à chaque examen. Inclure les groupes contenant le personnage joueur. Supprimer la limite autonome historique de trois chansons.

Si des chansons non faibles sont disponibles, les privilégier en excluant les faibles de ce tirage ; sinon considérer les faibles. Poids de sélection : `1 + qualité/10 + 2 si genre dominant identique`. Chance d’adoption : `clamp(0,15 + qualité/200 + 0,15 si même genre ; 0,15 ; 0,80)`. Échec sans effets, nouvel examen à l’échéance normale.

Revérifier la propriété à l’application. Si plusieurs groupes traitent la même œuvre pendant une minute, tirer une fois leur ordre de traitement avec le hasard du monde : un seul l’obtient. Les autres abandonnent cette tentative avec raison explicite. La commande manuelle adopte après validation, sans loterie supplémentaire pour ignorer le choix du joueur.

## 10. Autonomie du groupe

Trois initiatives : adoption, appel de pratique, candidature/réservation. Elles sont virtuelles, sans réunion physique et sans jeton individuel consommé. Réutiliser le calendrier autonome existant et ses contraintes, sans moteur parallèle.

Proposition de pratique : examen toutes les 6 h ; 35 % de lancer une invitation si groupe actif, chanson active et aucune demande/séance du groupe déjà ouverte. Morceau choisi avec poids `1 + (100−maîtrise)/20`. Choisir le lieu parmi les lieux déjà compatibles ; pas de nouveau bâtiment/matériel.

Le groupe consulte les données de ses membres, mais n’obtient ni énergie, ni humeur, ni sac, ni personnalité supplémentaire. La réservation garde confirmation des participants et conflits du calendrier. Après confirmation, pas de loterie ordinaire de présence au départ.

Ordre de résolution : dissolution et engagements urgents, départs individuels, adoption, appels de pratique ; les décisions de réservation revalident l’état au moment de leur passage. Toutes les horloges utilisent le quartier, aucune ne progresse pendant le mode show figé.

## 11. File personnelle : invitations seulement

Les demandes sont hors sac. Un jeton acquis va toujours dans le sac ; seul un jeton déjà défaussé peut être retiré. Pas de conversion d’invitation en jeton, pas de remboursement après refus.

Priorités après fin d’action : départ de spectacle dû, sommeil dû, invitations valides, puis pige normale. Invitation de pratique non interruptive. Show confirmé interruptif, y compris du sommeil, avec clôture cohérente.

FIFO par création puis identifiant ; une entrée par personne/demande, une demande active par groupe. Pas de remplacement silencieux des invitations d’un autre groupe. Nettoyer les expirations même durant une longue action. Émettre une nouvelle demande uniquement après fermeture de l’ancienne et expiration du délai normal.

À l’examen : groupe actif, membre actuel, morceau actif possédé, demande ouverte, trajet compatible avec prochain départ de show. Invalide/expirée : retirer avec motif, sans tirage. Sinon :

`P(acceptation) = clamp(0,20 + attachement/150 + (énergie−50)/250 − détresse/500 ; 0,05 ; 0,95)`.

Énergie <15 : refus sans tirage. Sommeil dû : dormir, ne pas résoudre la demande. Sur refus, examiner la suivante ; sur acceptation, commencer Pratiquer hors sac et arrêter le parcours. File vide : une seule pige. Pas de pénalité relationnelle nouvelle au refus de pratique.

Sauvegarder réponse et état : recharger ne reroule rien. Afficher groupe, morceau et expiration. La commande manuelle lance la même demande, pas une interruption forcée des membres.

## 12. Répétition physique

Expiration de la demande proposée : 6 h après émission. Tous les invités ont la même référence de groupe, lieu et séance.

Premier arrivé : attente maximale de 60 min, sans gains de pratique, coordination ou social ; besoins normaux. Sans deuxième membre, fermer sa participation puis reprendre priorités ordinaires. S’il ne reste aucun participant présent ou en route et toutes les réponses sont résolues, fermer la demande immédiatement. Une demande expirée ne recrute plus ; elle n’interrompt pas une répétition déjà commencée.

Deux membres présents démarrent. Les suivants peuvent rejoindre avant expiration tant que la séance reste active. Leur acceptation fait admission : aucun deuxième tirage à l’arrivée. Une personne en route vers une séance fermée termine explicitement ce déplacement sans téléportation, puis reprend les priorités normales.

Cycles et fourchettes V7.1 restent. Même morceau pour les participants pendant un cycle ; changements collectifs parmi les œuvres actives du groupe. Chaque personne décide de continuer/quitter selon les règles de pratique. À une seule personne, la pratique personnelle peut continuer, mais gains collectifs cessent.

Réutiliser gains instrumentaux, plateaux et maîtrises ; crédit uniquement au groupe annoncé et aux présents réels. Un autre groupe commun n’est pas crédité. Invitation, trajet et attente n’entretiennent pas la coordination. Les échanges musicaux existants accompagnent la pratique ; pas de séance sociale concurrente ni d’initiative sociale supplémentaire du groupe.

## 13. Spectacles prioritaires

Pas de spectacle dans la file. Candidature et réservation confirmée restent distinctes. À confirmation, enregistrer participants et vérifier conflits.

Pour chaque participant, utiliser la route et la vitesse réelles, en comptant les pas des différents segments. Arrivée cible proposée : 10 min avant le créneau. `départ = heureShow − 10 − tempsTrajet`. Actualiser avant départ si la position change. Une confirmation trop tardive pour un trajet réalisable doit être refusée explicitement, sans téléportation.

Au départ : clôturer l’action, désinscrire des séances, ajuster sommeil, conserver défausse et créer le déplacement. Les musiciens partent à des heures différentes pour arriver à temps. Une personne arrivée attend son show sans repiger une activité incompatible.

Pas de nouveau refus ordinaire. Exception proposée : déchéance <90, aucune absence aléatoire ; à partir de 90, `P(absence) = (déchéance−90) × 0,02`, soit 0–20 %. Un seul tirage mémorisé par participant/réservation au départ prévu. Journal et bilan identifient l’absent et la cause.

Utiliser les présents et la formation minimale existante. Aucun musicien fictif, carte de secours ou remplacement automatique. Une formation insuffisante annule explicitement son créneau, pas toute la soirée. Les conséquences relationnelles spécifiques du « drame » d’absence restent reportées, sans pénalité cachée.

Auditer les filtres d’énergie actuels : ils ne doivent pas produire des absences ordinaires contraires à cette règle. L’énergie influence la performance selon ses règles, pas un refus supplémentaire. Ne pas créer une recharge magique pour contourner le filtre. Conserver seulement la récupération d’attente réellement justifiée par les règles existantes et la documenter.

Au lancement, le quartier se fige ; besoins, groupes, files et délais ne vieillissent pas sur le temps de présentation. Après la soirée, reprendre les priorités normales. Ne pas utiliser l’ancienne tolérance d’arrivée comme substitut au calcul correct du trajet.

## 14. Départs de membres

Examen proposé toutes les 12 h, après grâce de 48 h dans le groupe. Pas de tirage par minute ou affichage.

- Attachement <20 : risque de départ 15 % par examen, sinon zéro.
- Autre groupe déjà rejoint avec attachement supérieur d’au moins 25 : ajouter 15 %.
- Total plafonné à 30 %. Au plus un départ par personnage/passage ; examiner d’abord son groupe le moins attractif.

Pour un groupe potentiel, seule une invitation réelle et admissible compte ; ne pas partir pour un groupe imaginaire. Une adhésion réussie influence le prochain examen, sans expulsion automatique de toutes les autres appartenances. L’expérience recherchée est une stabilité émergente, pas une exclusivité forcée.

Si départ prévu vers un show confirmé de ce groupe dans les prochaines 6 h, reporter l’examen après le créneau afin d’honorer l’engagement. Au-delà, retrait du participant d’une réservation future et revalidation ; annulation explicite si formation insuffisante. Cette protection ne ressuscite pas un groupe dissous.

Départ : retirer appartenance, conserver ancien membre/date/motif et fondateur historique, nettoyer invitations/séances, recalculer agrégats. Personnage, auteurs et maîtrises individuelles restent. Ne pas ajouter de malus relationnel ou émotionnel arbitraire au départ lui-même.

## 15. Dissolution définitive

Déclencheurs : coordination zéro ou moins de deux membres. Coordination positive, même 5, peut remonter. Conserver évolution V7.1 : coordination initiale 18 ; −0,24/h après 48 h sans activité commune réelle. Pratiques et shows gardent leurs gains existants.

Transition idempotente : état terminal, date et raison, historique et dernière formation conservés. Les appartenances deviennent historiques et ne freinent plus la formation d’un nouveau groupe. Aucune initiative de groupe dissous.

Annuler demandes/invitations, fermer participations, retirer candidatures, annuler réservations futures via les services existants, libérer créneaux. Pas de récompense ni de pénalité de spectacle joué. Un show déjà lancé termine son snapshot ; le quartier gelé empêche normalement cette concurrence.

Chansons toujours rattachées au groupe historique. Supprimer bouton et commande de relance ; `revive` ancien renvoie une erreur explicite. Les mêmes individus peuvent créer ultérieurement une nouvelle identité avec nouveau nom, sans récupérer automatiquement chansons/réputation/coordination.

## 16. Confiance et raccords débranchés

Rechercher `trust`, Confiance et aliases dans données, schémas, formules, UI, journal, tests et docs. Retirer gains/pertes, seuils et poids, y compris acceptation, moments musicaux et bilans. Supprimer un terme signifie le supprimer, pas le remplacer silencieusement par affinité. Hors règles redéfinies ici, conserver les autres termes et documenter la variation de probabilité résultante.

Archiver éventuellement les anciennes données dans la migration, sans lecteur actif. Les événements historiques restent historiques ; ne pas prétendre que la confiance n’a jamais existé.

Conserver le registre V7.1 des raccords inactifs. Le bonus coordination→partenaires est remplacé par attachement→partenaires. Cela n’autorise pas inspiration, agenda général, souvenirs→humeur, souvenirs/chimie→plateaux ou personnalité→pige. Diffusion, fans permanents et drames spécifiques d’absence restent reportés.

## 17. Interface et contrôle manuel

Fiche groupe : identité, couleur, fondateurs/membres/anciens, coordination, réputation détaillée, moral, compétences agrégées, attachement par membre, répertoire possédé/actif, invitations et prochaines initiatives. Fiche personnage : appartenances, facteurs d’attachement, file, compositions et propriétaires.

Liens cliquables auteurs/chansons/groupes. Infobulles réutilisent les composants existants ; aucune information essentielle exclusivement au survol, pas de nouveau framework.

Commandes conservées ou adaptées : former/inviter, appeler une pratique, adopter, mettre de côté/réactiver, réserver/modifier/annuler, quitter un groupe. Mêmes règles que simulation, motifs de refus visibles. Pas de téléportation/acceptation forcée dans les commandes normales.

### Libellés d’activité

Réserver des positions distinctes aux activités et aux effets d’action/émotion. Éviter tout recouvrement du texte, y compris personnages regroupés, déplacement, bord d’écran, noms longs et effets simultanés. Lisibilité et contraste sur ordinateur/mobile ; ne pas masquer une autre information utile pour régler une collision.

La capture signalée n’a pas pu être ouverte dans cette session : aucune analyse visuelle précise n’est présumée. Reproduire le signalement dans le jeu et conserver des captures avant/après à l’exécution.

## 18. Migration et sauvegardes

Ajouter V7.1→V7.2 à la chaîne existante V1→V7.1. Copier la sauvegarde originale, migrer une copie puis valider avant adoption. Versionner moteur, release, paquet et verrous lors de l’implémentation, pas à la livraison de ce plan.

1. Supprimer confiance des règles et schéma actifs ; conserver au besoin une archive inactive.
2. Construire appartenances depuis groupes. Date ancienne inconnue explicitement inconnue ; grâce initialisée à la migration, sans fausse date historique.
3. File initialement vide ; réservations existantes restent des engagements, pas des invitations.
4. Horloges/décalages initialisés une fois avec hasard sérialisé. Réimport V7.2 ne reroule ni délai ni réponse.
5. Groupes archivés convertis en dissous, dates/histoire conservées ; groupes zéro/sous deux membres traités de façon cohérente.
6. Initialiser composante de réputation et calculs dérivés ; rendre les changements inspectables.
7. Chanson dans un seul répertoire : propriétaire = ce groupe, même archivé. Sans répertoire : propriétaire nul. Le contexte de création ne vaut pas adoption.
8. Plusieurs répertoires : arbitrage proposé = plus grande maîtrise, puis groupe créé le plus tôt, puis identifiant. Marquer comme résolution de migration, jamais comme adoption historique inventée. Archiver les autres maîtrises sans les détruire, retirer leur disponibilité pour de nouvelles réservations des non-propriétaires.
9. Réservation déjà confirmée et show en cours : préserver morceaux/participants pour cette prestation uniquement. Aucun droit d’adoption future créé par cette compatibilité.
10. Replays/snapshots conservent leur version, tirages et résultats ; pas de récompenses réappliquées. Déterminer si le moteur de scène nécessite une nouvelle version ou seulement la préparation.

Rapport de migration : propriétés résolues, groupes dissous et engagements conservés. Ne pas supprimer une œuvre, inventer un remplacement ou libérer secrètement la propriété pour sauver une réservation.

## 19. Paramètres initiaux centralisés

| Paramètre | Valeur proposée, sauf mention validée |
|---|---|
| Délai création/adhésion réussie | 48 h, validé |
| Nouvelle proposition même paire | 24 h |
| Affinité mutuelle ou amour mutuel | 30 ou 25 |
| Tension de formation | <60 |
| Proposition sans groupe | 6 % par échange favorable admissible |
| Adoption | Examen toutes les 6 h |
| Pratique | Examen toutes les 6 h ; émission 35 % |
| Expiration invitation | 6 h |
| Attente premier arrivé | 60 min |
| Énergie minimum acceptation pratique | 15 |
| Examen départ/grâce | 12 h / 48 h |
| Attachement faible | <20 ; départ 15 % |
| Groupe alternatif plus attractif | Écart ≥25 ; +15 % |
| Départ maximum | 30 % par examen |
| Engagement proche protégeant départ volontaire | 6 h |
| Marge arrivée show | 10 min |
| Absence extrême | Déchéance ≥90, 0–20 % |
| Coordination initiale/déclin | 18 ; −0,24/h après 48 h, conservés |

Les formules complètes sont dans les sections de domaine. Mesurer leurs effets combinés et ajuster les paramètres documentés ; aucune mécanique corrective cachée.

## 20. Documentation et recherche

À l’implémentation, ajouter un DDD Groupes pour identité, formation, attachement, réputation, autonomie, départs/dissolution. Musique conserve instruments, pratique/Jam et liens vers Groupes. Une formule a un propriétaire documentaire ; éviter les copies divergentes.

| Document | Mise à jour |
|---|---|
| Groupes, nouveau DDD | Règles, formules, données, commandes et exemples |
| Actions | Priorité show/sommeil/file/sac, invitations et interruptions |
| Relations/Interactions | Suppression confiance, propositions et attachement dans les partenaires |
| Musique | Répétitions appelées, arrivées, cycles et crédit aux présents |
| Compositions | Auteurs/propriétaire, adoption, catalogue et maîtrise |
| Shows | Trajets, présence, exceptions, annulation et compatibilité |
| Sommeil/Temps | Interruptions prioritaires, horloges gelées |
| Déchéance | Absence exceptionnelle sans nouveau système de drame |
| Personnages/Traits | Références actives à confiance retirées, aucun trait inventé |
| Technique | Modules, schémas, migration, hasard et idempotence |
| Raccords | Consommateurs remplacés et limites maintenues |
| Architecture documentaire | Nouveau domaine, responsabilités et navigation |
| Guide/README/versions/changelog | Fonctionnement livré, version réelle et limites |

VitePress indexe le plan comme plan et les DDD comme règles livrées. La recherche du jeu reste centrée sur le guide et les DDD, sans mélanger règles proposées et actives. Adapter le test actuellement fixé à 14 DDD lors de l’ajout du quinzième. Vérifier recherches « attachement », « adoption », « propriétaire », « invitation », « dissolution », « coordination », « absence » et ancres.

## 21. Ordre d’implémentation

1. Capturer état V7.1, tests, sauvegarde réelle et inventaire de confiance/commandes ; branche dédiée.
2. Extraire services et configuration sans changer les règles, puis schéma/migration/validation V7.2.
3. Attachement, compétences, couleur, réputation et inspecteurs ; instrumentation de la chaîne relationnelle identifiée par l’audit.
4. Formation/recrutement partagés ; confiance retirée partout ; anciens chemins désactivés.
5. Propriété/adoption, migration multirépertoires, catalogue et liens.
6. Autonomie de pratique, file, attente, séance et nettoyage ; cycles existants réutilisés.
7. Départs de show, présence, compatibilité réservations/replays ; aucune refonte de scène.
8. Départs de membres et dissolution terminale ; relance supprimée.
9. Interface et collisions des libellés ; commandes manuelles exercées.
10. Calibrage intégré des relations et groupes avec tous les nouveaux systèmes actifs, réception sur parties neuves et migrées ; puis DDD, recherche, CI et section Réalisation avec écarts explicites.

Ce document livre le plan. Il ne permet pas d’annoncer la V7.2 déjà codée ou publiée ; l’exécution et la publication suivent la demande correspondante du concepteur.

## 22. Vérifications et critères de réception

### Domaine

- Formation par affinité/amour, amour unilatéral insuffisant, chimie facultative, confiance absente, délais, pas de doublon, nom épuisé sans mutation partielle.
- Commandes manuelles/autonomes cohérentes ; ancien bloc de création automatique retiré.
- Attachements différents selon membres, groupe réputé malgré mauvais liens, groupe dissous exclu, inspection sans RNG, pas d’auto-relation.
- Compétences zéro, ex æquo, départ et donnée manquante invalide.
- Adoption exclusive concurrente, coauteurs, départ d’auteur, mise de côté et propriétaire historique ; maîtrise jamais remise à zéro à tort.
- File avant pige, refus puis suivante, expiration, dédoublonnage, sommeil, groupe/personnage supprimé, réponse persistante ; jetons inchangés.
- Premier arrivé sans gains, deuxième démarre, retardataire rejoint, un restant sans crédit collectif ; groupe parallèle non crédité.
- Shows : routes différentes, départ depuis chaque action/sommeil, arrivée à temps, aucun refus normal, absence extrême une fois, pas de recharge ou téléportation de secours.
- Départ : grâce, faible attachement, alternative réelle, protection engagement proche, anciens membres et nettoyage.
- Dissolution zéro/sous deux membres, récupération à coordination positive, idempotence, relance rejetée, œuvres conservées.
- Réputation sans double crédit, moral conservé, replays/récompenses appliqués une seule fois.

### Sauvegardes

Vraie V7.1 et fixtures V1–V7 : chanson partagée, groupe archivé, réservation confirmée, show en cours. Reprise exacte pendant file, réponse, trajet et pratique. Monde V7.2 rechargé = même futur sous mêmes commandes. Import corrompu n’écrase pas une sauvegarde valide ; aucun nouveau tirage/cooldown à l’import.

### Parcours et présentation

Former, inviter/refuser, adopter, ouvrir auteur/propriétaire, appeler une pratique, observer réponses différées, réserver/jouer, quitter et consulter historique. Ordinateur et tactile ; agrégats coïncidents, motifs d’attachement, file périmée, noms longs, personnages groupés/effets simultanés. Conserver les six tailles de scène des tests existants.

### Expérience et équilibre

Ensemble fixe de graines, au moins 30 jours de quartier puis durée plus longue pour stabilité. Mesurer premier groupe, groupes actifs/dissous, appartenances par personne, durée des appartenances, rotations, propositions/refus, adoptions, invitations expirées, pratiques tenues, shows et absences.

Observer : groupes qui se forment effectivement ; multigroupe possible mais pas norme des musiciens établis ; groupes durables ; absence de famine du sac ou de file interminable ; pas de renouvellement permanent de duos fragiles ; pas de disparition d’œuvres. Ne pas affirmer une fréquence atteinte avant simulation. Si les tendances contredisent l’expérience, ajuster les paramètres centralisés, consigner résultats et raisons.

Commandes : `npm test`, `npm run docs:build`, `npm run test:browser`, contrôle ancres/index et `git diff --check`. Mettre à jour les tests aux nouvelles règles en conservant les garanties V7.1. La CI valide ensemble code et documentation avant publication.

## 23. Livraison attendue

Une seule autorité par règle ; invitations indépendantes du sac ; shows à l’heure ; attribution/propriété compréhensibles ; groupes stables sans exclusivité forcée ; départs/dissolutions sans références cassées ; confiance et relance réellement retirées ; interfaces lisibles ; migrations, DDD et recherche conformes.

Compte rendu séparant réalisé, paramètres ajustés, limites et raccords débranchés. Toute règle non exécutée est nommée. Aucun agenda, diffusion, fans permanents, résurrection ou mécanisme de secours ajouté pour masquer un raccord manquant.

## Réalisation 0.7.2 — 11 octobre 2026

Domaine partagé `groups.mjs`, paramètres `group-rules.mjs`, callbacks de moteur `groupContext`. Proposition/acceptation, recrutement, attachement dérivé, agrégats, couleur, réputation, adoption exclusive, files de pratique, départ individuel de spectacle, départs de membres et dissolution terminale sont raccordés. La création directe de laboratoire reste explicitement manuelle. Les fiches, le catalogue et la carte exposent ces données ; quinze DDD et leurs liens structurent la recherche du jeu et VitePress.

### Écarts chiffrés et design des trous

Les paramètres du tableau initial étaient des hypothèses. L’audit de la boucle complète les remplace par : affinité réciproque ≥12 ou amour ≥25, tension <60, proposition 22 % avant freins, acceptation de base 40 %, délai réussi 48 h et paire 24 h ; favorable +1,2, défavorable −0,4 et érosion 0,0002. Attachement = Coordination +0,3(F−50)+0,1(S−50)+0,1(H−50)+0,2R−0,15T. Les choix d’adoption/pratique sont examinés chaque 6 h, appels avec chance 50 %, invitation 12 h et attente sur place 120 min ; participation de base 55 %. Départ faible <20 : 8 % par examen ; alternative réelle +25 : 15 %. Grâce 48 h, examen 12 h. Spectacle : marge 10 min, absence seulement ≥90, au maximum 20 %. Toutes ces règles sont expliquées dans les DDD propriétaires et vérifiées avec le hasard sérialisé.

Le seuil de formation bas correspond aux affinités progressives réellement produites ; aucun seuil caché, lien offert, groupe forcé ou jeton injecté. La première configuration complète échouait encore à la cible et aux réunions ; le [rapport](./BALANCE_V7_2.md) conserve les ajustements et résultats sur vingt graines, jours 3/5/10/30. La répartition de réputation préserve l’ancien total lorsqu’il couvre le nouveau catalogue ; sinon ce catalogue devient visible, sans double crédit horaire.

### Conservation et migration

Sauvegarde d’origine dans `garage-vivant-before-v7-2`, validation sur copie. Confiance archivée, supprimée du moteur sans remplacement par une nouvelle jauge ni terme de substitution dans les moments techniques ou bilans. Qualités, sources, auteurs et maîtrises personnelles conservés. Ancien partage : meilleure maîtrise, date de groupe puis identifiant ; autres entrées archivées avec l’arbitrage, sans copie de chanson. Les anciennes setlists déjà confirmées continuent grâce à une exception enregistrée. Les nouveaux choix respectent la propriété unique. Archives, coordination zéro et moins de deux membres sont terminales ; réservation future annulée, prestation déjà commencée conservée.

### Limites laissées explicites

Aucun album, palmarès, diffusion, nouveau compteur de fans, transfert ou litige de chanson, réunion sociale autonome, agenda général ou résurrection. Le moral et la scène gardent leurs règles existantes. Une absence extrême est journalisée et la présence revalidée ; pénalités relationnelles spécifiques du drame reportées. Inspiration, souvenirs/chimie vers les plateaux et autres raccords V7.1 restent débranchés. Le registre moteur et le DDD Raccords donnent les identifiants et consommateurs encore actifs.

### Réception

`npm test` comprend migrations V1–V7.1 réelles, ownership et auteurs, état terminal, attente sans gains, file FIFO sans effet sur sac, arrivées et absence unique, sauvegarde/continuation, disposition de libellés et formation sur vingt graines. `npm run audit:groups` mesure la boucle entière sur trente jours avec rechargements, puis trois graines jusqu’à quatre-vingt-dix jours. `npm run docs:build` construit les règles et les index. Chromium vérifie interface ordinateur/tactile, recherches, catalogue, fiches, commandes et spectacles. Le rapport et la PR donnent les résultats effectifs de ces commandes ; les tests ne prétendent pas à un équilibre définitif.

Le [plan de test de la V7 complète](./PLAN_TEST_V7.md) donne les cas et résultats attendus pour les règles conservées, actions, groupes, scène et migrations. Il sépare les automatisations réussies des essais humains restant à consigner.

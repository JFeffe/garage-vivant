# DDD — Compositions, chansons et catalogue

Version 0.7.9. Les séances de composition développent des projets persistants. Le catalogue conserve les œuvres et permet de masquer les productions peu utiles sans les supprimer.

## Plusieurs projets et coauteurs

Un personnage possède autant de projets en cours qu’il en crée. Une nouvelle séance reprend un projet admissible avec probabilité 0,8 lorsqu’il en existe ; les 0,2 restants ouvrent un projet. Le choix entre projets repris est uniforme. Une commande explicite peut sélectionner un projet ou demander une nouvelle œuvre.

Chaque projet contient auteur initial, coauteurs, noms conservés, groupe éventuel, dates, travail, cible, séances, minutes et contributions. Chaque brouillon conserve séparément échantillons émotionnels, sources et travail créatif ; alterner ne mélange pas les origines.

Composer solo reste possible. En collectif, seuls les membres d’un groupe actif commun peuvent demander à rejoindre la composition. Une admission acceptée partage le même projet ; les minutes travaillées sont attribuées à chaque présent. La finalisation crée une seule chanson pour ce projet. Elle termine aussi les séances des coauteurs encore associés à ce projet, même en trajet : leur brouillon est libéré et ils passent au choix normal suivant (priorités, file, puis sac). Un nouveau projet exige une nouvelle action, jamais le remplacement silencieux du projet terminé dans l’ancienne séance. Les contributions et crédits déjà acquis restent conservés. Les auteurs restent attribués à l’œuvre, même si le groupe se défait. Le rattachement collectif n’est pas déduit de tous les groupes actuels d’un auteur.

## Durée et travail

La fourchette personnelle concerne une séance, pas la durée totale de l’œuvre. Cible nouvelle = `300 + (écriture ×0,45 + instrument principal ×0,25) ×6` unités. Les anciennes cibles migrées sont préservées. Une œuvre prend généralement plusieurs séances ; aucun compteur ne la termine automatiquement à 75 minutes.

Travail/min = `Rythme de composition × (0,85 + discipline/300) × max(0,1 ; 1 + effets writing des traits) × (1 + min(exaltation,détresse)/100 ×1,5)`. L’élan utilise les deux axes : une forte intensité simultanée peut accélérer le travail jusqu’à ×2,5. Il ne garantit pas une meilleure qualité. Le rythme varie avec les états existants ; aucune nouvelle jauge d’inspiration ou d’ambition n’est ajoutée.

Sous 25 % : idée ; ensuite : ébauche ; à la cible : prête. La finalisation se fait à la fin d’une séance de composition. Une séance interrompue conserve ses gains. Un projet sans travail réel depuis 14 jours simulés devient abandonné ; consulter sa fiche ne prolonge pas sa vie. Un projet abandonné est inachevé, distinct d’une chanson faible et jouable. La reprise d’un abandon n’est pas ajoutée automatiquement.

## Qualité et provenance

La qualité garde le calcul existant : compétences + expression émotionnelle + ensemble + traits + variation − surcharge, borné 0–100. Pour plusieurs auteurs présents, la part compétences est pondérée par leurs minutes de contribution ; à défaut, elle utilise le compositeur courant. Compétences = écriture ×0,45 + instrument ×0,25. Expression = intensité/100 × (6 + créativité ×0,12). Surcharge = `max(0 ; intensité−72) × (100−stabilité)/190`. Ensemble est borné 0–12 ; variation est tirée entre 3 et 13. Les traits de qualité existants restent actifs.

Les premières 75 minutes créatives échantillonnées gardent l’origine émotionnelle. Exaltation et détresse donnent les tonalités correspondantes ; sous 10 d’intensité, posée. Les sources du projet réunissent les événements réellement présents, sans inventer de souvenir. Une idée de jam peut nourrir le prochain projet une fois par auteur dans les 24 heures.

Écho simulé = qualité ×0,65 + intensité ×0,2 + tirage 0–18, borné. Un écho ≥80 marque un succès simulé ; ce n’est pas un accueil de spectacle déjà joué. La chanson terminée produit les effets émotionnels existants. Les six nuances historiques restent conservées dans les anciennes chansons et débranchées pour les nouvelles.

## Classement relatif et archives

À la sortie d’une nouvelle chanson, recalculer les références. Pour chaque auteur, prendre les cinq meilleures autres chansons, puis leur médiane ; il faut au moins trois autres œuvres. Pour plusieurs auteurs ayant une référence, utiliser leur moyenne. La chanson évaluée ne compte pas dans sa propre référence. Sous référence −12, elle est faible ; les notes ne sont pas réécrites.

Le classement faible est automatique et réévaluable. L’archive manuelle reste distincte et conservée dans `songArchive`. Restaurer une chanson la rend active et la marque `keepActive`, pour ne pas la remasquer immédiatement par classement automatique. Le seuil absolu historique `archiveThreshold` n’a plus de consommateur actif.

Les chansons faibles restent jouables. L’adoption autonome écarte les faibles si des œuvres non faibles sont admissibles, puis pondère qualité et genre selon [Groupes](./groupes.md). Elle ne possède pas de filtre supplémentaire pour l’archive manuelle. L’archive du catalogue masque l’œuvre sans désactiver une entrée de répertoire ni retirer la propriété ; mettre de côté au répertoire exclut le morceau des nouveaux choix de pratique et setlist. Aucun classement ne supprime une setlist confirmée ou un spectacle historique.

## Catalogue et maîtrise

Dans Journal, Compositions et chansons propose recherche par titre/auteur/groupe, filtres combinables par auteur, groupe, rattachement personnel/collectif, genre, type, état et plage de qualité des chansons. États : actifs, tous, faibles, archives et abandons. Le potentiel d’un projet n’est pas présenté comme une note finale.

Tri par qualité croissante/décroissante, date, avancement et maîtrise du contexte choisi. Sans auteur ou groupe choisi, aucune maîtrise globale n’est inventée. La fiche distingue compétence instrumentale, maîtrise individuelle du morceau et maîtrise par chaque groupe. Les rattachements de création et les répertoires qui utilisent l’œuvre sont distincts.

La liste affiche jusqu’à 50 résultats puis Voir davantage. La fiche d’un projet actif permet de demander à un de ses auteurs de le reprendre par la commande d’action existante ; le personnage peut refuser et le sommeil garde sa priorité. Les détails s’ouvrent dans une fenêtre ; fermer retrouve filtres et position. La fiche personnage propose un accès au catalogue filtré et limite ses projets affichés à cinq. Les nouvelles identités de groupes/auteurs actualisent les choix sans reconstruire un contrôle en cours d’édition.

## Noms et unicité

Deux banques distinctes génèrent noms de groupes et titres de chansons par permutations. Les groupes combinent identité collective, qualificatif et contexte ; les chansons combinent phrase, image, mouvement et lieu. Un registre persistant commun réserve les noms de groupes, projets et chansons, y compris archives et abandons.

La comparaison normalise casse, accents et ponctuation. Les groupes générés ne répètent pas leur identité centrale de quatre mots. Les noms manuels doivent aussi éviter une identité de groupe trop proche. Les titres d’un projet et de sa chanson terminée sont une seule réservation. Les tirages dépendent du hasard du monde ; après collisions, un parcours déterministe cherche une combinaison libre.

Les noms historiques ne sont pas réécrits ; les nouvelles créations ne les réutilisent pas. Aucun suffixe numérique automatique. Banque finie : son épuisement doit refuser explicitement la création, jamais livrer un doublon ou boucler sans fin. Groupe et Chanson sont identifiés par libellés et guillemets dans les points d’entrée, au-delà de la couleur.

Liens : [Actions](./actions.md), [Musique](./musique.md), [Shows](./shows.md), [Technique](./technique.md).

## Auteurs et propriétaire du morceau

Les individus restent les auteurs permanents. Le contexte `groupId` de création ne transfère rien automatiquement. Une chanson finalisée commence avec `ownerGroupId: null`, puis un groupe peut l’adopter. Le groupe devient son seul propriétaire, conserve sa maîtrise et la garde après départ d’un auteur ou dissolution. L’auteur la voit encore dans son catalogue, avec le groupe propriétaire cliquable.

Filtres de groupe et de rattachement utilisent le propriétaire pour les chansons terminées ; les projets gardent leur contexte de création. La maîtrise personnelle dépend du musicien sélectionné, la maîtrise collective du propriétaire. Mettre un morceau de côté conserve propriété et maîtrise. Aucune copie ni deuxième adoption. Le [DDD Groupes](./groupes.md) décrit admissibilité, choix autonome, commandes et migration des anciens répertoires partagés.

## Crédit de composition visible · V7.9

Le crédit **Composition :** est explicite dans le catalogue, le détail du morceau, la fiche du personnage, le répertoire du groupe et les chansons disponibles à adopter. Tous les coauteurs sont affichés; leur nom ouvre leur fiche tant qu’ils vivent dans le quartier. Le surnom apparaît aussi si présent. Le propriétaire est une information séparée; adopter une chanson ne remplace jamais ses auteurs. Après suppression d’un auteur, son dernier nom reste lisible sans lien vers une fiche inexistante.

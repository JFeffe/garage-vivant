# DDD — Personnages, besoins et émotions

Version 0.7.10. Ces règles décrivent le moteur livré; les anciennes propositions se trouvent dans les plans historiques.

## Identité et personnalité

Un voisin possède nom, âge, couleur, instrument, style, compétences et six dimensions de personnalité entre 0 et 100. L’âge est éditable sans vieillissement automatique. Les populations nouvelles restent amateurs; aucune migration ne réduit leurs compétences.

| Dimension | Consommateurs actifs V7 |
|---|---|
| Créativité | Progression qualitative, expression d’une chanson, idées de jam et chimie musicale. |
| Extraversion | Érosion du besoin social; accessoire/gestuelle hérités et cartes personnelles. |
| Empathie | Poids et qualité du soutien; apprentissage entre musiciens, gains relationnels des moments musicaux, chimie. |
| Discipline | Travail des projets, consolidation musicale, chimie, décisions de candidature aux shows. |
| Stabilité | Décroissance et réaction émotionnelles; intensité descriptive des souvenirs; pénalité d’intensité extrême en composition. |
| Ambition | Choix autonomes de candidatures aux shows. |

Ces valeurs ne modifient pas les jetons ni la pige. Les anciens scores, priorités et curseurs d’attrait musical/social sont retirés de l’expérience V7.1. Le [catalogue des traits](./traits.md) distingue sources permanentes et conditionnelles.

## Quatre besoins

| Besoin | Sens | Usure de base par minute |
|---|---|---|
| Énergie `energy` | Réserve physique et fatigue | −0,065 |
| Lien social `social` | Sentiment de connexion | −0,035 |
| Plaisir `fun` | Divertissement | −0,04 |
| Expression `expression` | Satisfaction créative | −0,05 |

Chaque valeur est bornée entre 0 et 100; 100 signifie comblé. L’usure est multipliée par le réglage Usure des besoins. Le social est aussi multiplié par `1 + extraversion/200`, ou par 0,5 pour Solitaire. L’usure d’énergie est suspendue pendant l’action Dormir, trajet inclus. Les autres besoins continuent à s’user.

Le confort est supprimé, avec sa jauge et ses effets. Ni nourriture, ni travail, ni argent ne sont ajoutés. L’énergie nulle ne déclenche pas un ancien choix forcé : elle exerce une pression de détresse et peut empêcher un engagement; le sommeil reste programmé hors sac.

## Seuils personnels et pressions continues

Pour chaque besoin, l’initialisation tire une limite basse entre 20 et 35, une limite critique 15 points plus bas, avec minimum 5, et une limite de satisfaction entre 85 et 95. Les limites sont sauvegardées et ne sont pas retirées à chaque chargement.

| Zone | Condition | Pression par minute |
|---|---|---|
| Critique | valeur strictement sous la limite critique | +0,10 détresse |
| Basse | sous la limite basse, hors critique | +0,04 détresse |
| Comblée | valeur à partir de la limite haute incluse | +0,035 exaltation |
| Intermédiaire | aucune des conditions ci-dessus | aucune pression |

La zone critique remplace la zone basse. Plusieurs besoins contribuent simultanément; les deux axes peuvent monter ensemble. Sortir d’une zone arrête sa pression sans effacer ce qui s’est accumulé. Le temps est mesuré en minutes simulées, pas en nombre d’images affichées. La fiche expose valeur, seuils, zone active, taux et sources d’activité.

## Deux jauges indépendantes

Exaltation `exaltation` et détresse `distress` ont chacune leur plage 0–100. Aucun plafond partagé ni humeur globale ne les remplace. À chaque minute : ajout des pressions puis retrait de `(0,025 + stabilité × 0,00065) × Retour émotionnel` sur chaque axe, puis bornage.

Un événement positif au sens d’une hausse de jauge utilise `montant × max(0; 1 + modificateurs reaction) × (1,15 − stabilité/300)`. Une baisse applique son montant directement. Cela vaut aussi pour une hausse de détresse : « positif » désigne ici le signe numérique. Les pressions des besoins utilisent leurs taux annoncés directement, sans ce multiplicateur d’événement.

Les trois dernières sources d’événement par axe sont conservées. Les pressions actuelles sont inspectables séparément. L’axe dominant sert à l’affichage et à la phase créative; il ne calcule pas une humeur ni un score d’action. À égalité, l’exaltation est dominante; sous 10, l’étiquette d’affichage est Paisible.

## Fiche et historique

La fiche montre les deux courbes, quatre besoins, sac, traits conditionnels, sommeil et séance. Une mesure personnelle toutes les 30 minutes garde 96 points, soit jusqu’à 48 heures. Le quartier garde 168 moyennes horaires des deux axes. Les données anciennes d’humeur ne nourrissent plus les graphiques.

Vue détaillée et Organiser conservent ordre, largeur, colonne et modules masqués dans une préférence locale séparée du monde. Les contrôles en cours d’édition gardent leur focus et leur position. Le catalogue recherchable dans Réglages décrit tous les traits, dont Solitaire et le trait Relax débranché.

Liens : [actions](./actions.md), [sommeil](./sommeil.md), [traits](./traits.md), [interactions](./interactions.md), [raccords](./raccords-v7.md).

## Personnaliser et supprimer · V7.10

Le bouton **Nom et apparence** ouvre l’éditeur. Le nom reste l’identité principale; le surnom facultatif (24 caractères) apparaît entre guillemets sur la carte, la fiche et la liste. Les références et les auteurs utilisent toujours l’identifiant, pas le nom. Couleur, six accessoires existants, foulard et quatre allures sont éditables. `character-view.mjs` centralise le dessin du cube et des accessoires; les portraits de fiche, liste et liens sont générés à partir de cette même apparence. Les shows conservent un instantané de l’identité au début de la représentation. L’allure anime la carte; les portraits restent fixes.

**Supprimer** demande une confirmation. Au moins un voisin reste dans le quartier. Pendant un spectacle, la suppression est refusée sans mutation. Les activités sont fermées, les relations actives et partenaires sont nettoyés, les réservations à venir du personnage sont annulées. Les groupes passent par leur départ normal, avec dissolution définitive sous deux membres; leurs archives restent accessibles. Les compositions et projets conservent l’auteur et son dernier nom. Le rôle joueur passe au premier voisin restant si nécessaire. Aucun remplacement automatique n’est créé.

Un ancien monde sans surnom conserve son contenu et son RNG; le champ facultatif est validé quand présent. Aucune migration de skin ni réinitialisation.

## Paramètres personnalisables · V0.7.11

Les paramètres exposés de ce domaine se règlent dans [l’Atelier d’équilibrage](./equilibrage.md). Les chiffres de référence de ce DDD décrivent les valeurs par défaut ; le profil de la partie peut les remplacer. Les formules et conditions non exposées sont conservées.

# Contribuer à Garage vivant

Le jeu est une application web statique ; le code exécutable est dans `dist/`. Le README décrit le comportement actuel et les tests. Lire les éventuelles instructions `AGENTS.md` applicables. Le plan V7 documente les choix de conception et les DDD décrivent les arbitrages livrés; respecter le mandat confié et la version décrite dans le README.

## Branches et modifications

Partir de la dernière version de `main` et créer une branche claire, par exemple `fix/sidebar-scroll` ou `feat/cube-accessories`. Décrire le mandat et limiter les changements à ce mandat. Préserver les modifications des autres et les sauvegardes existantes. Pas de force-push sur `main`.

## Attribution et commits

Utiliser le nom et l’adresse associés à son propre compte GitHub, ou son adresse privée GitHub si souhaité. Pour Git en ligne de commande, configurer `user.name` et `user.email` dans ce dépôt avant de créer des commits ; vérifier l’identité configurée. Ne pas inventer d’identité et ne pas attribuer son travail à Simon.

Créer des commits cohérents, avec un titre concret : `fix: stabilise le scroll de la fiche personnage`, par exemple. Expliquer dans le corps le problème, le changement et les vérifications lorsque le titre ne suffit pas. Ne pas committer de secrets, jetons, fichiers temporaires ou environnements locaux.

## Documentation et validation

Respecter le README, les conventions existantes et les instructions applicables. Mettre à jour la documentation si le comportement, l’utilisation ou les sauvegardes changent. Vérifier les tests pertinents listés dans le README ; la vérification automatique couvre l’ensemble des tests avant la publication. Tester le rendu et les interactions du jeu web lorsqu’ils changent.

Pousser sa branche et ouvrir une pull request vers `main`, avec résumé, vérifications et limites connues. Si l’accès en écriture manque, utiliser un fork. Simon examine et décide de l’intégration. Une pull request ne publie pas le jeu principal ; après intégration, les tests de `main` doivent réussir avant le déploiement Pages.

## Hébergement GitHub Pages

Le workflow `.github/workflows/pages.yml` publie uniquement `dist/` après validation. Pour activer le site, choisir **Settings → Pages → Build and deployment → Source : GitHub Actions**. Relancer ensuite le workflow **Vérifier et publier le jeu** depuis Actions si nécessaire.

Adresse cible : https://jutrasimon.github.io/garage-vivant/ . L’activation du site se fait dans les paramètres GitHub ; ajouter un workflow seul ne suffit pas.

Les sauvegardes sont propres à chaque navigateur et à chaque origine web. Pour transférer un monde depuis l’ancien hébergement, exporter son JSON puis l’importer dans le nouveau site.

## Version et patch notes obligatoires avant chaque fusion vers main

Chaque PR destinée à `main`, sans exception (fonctionnalité, correctif, documentation ou maintenance), doit augmenter le numéro de version publié et inclure ses patch notes **avant la fusion**. Comparer à la dernière version de `main` ; si une autre PR a été intégrée entre-temps, actualiser le numéro avant de fusionner. Ne jamais réutiliser une version déjà publiée.

- Mettre à jour `RELEASE_VERSION` et `PATCH_NOTES` dans `dist/release.mjs`, le numéro initial dans `dist/index.html`, `package.json`, `package-lock.json`, le README et la version du pied de page documentaire.
- Ajouter en tête de `docs/versions.md` une entrée datée avec une ancre unique référencée par `PATCH_NOTES`, et résumer la livraison dans `docs/CHANGELOG.md`. Expliquer les changements visibles, les corrections, les limites et comment activer les fonctions optionnelles.
- Aligner les versions des imports JavaScript et des feuilles de style dans `dist/` sur la nouvelle version publiée pour éviter les mélanges de cache. Actualiser les assertions de version existantes et vérifier les tests pertinents ainsi que la construction documentaire.
- Le format des sauvegardes (`VERSION` dans `engine.mjs`) est distinct : ne le modifier que si une migration est nécessaire.
- La description de PR doit indiquer l’ancienne et la nouvelle version, les notes et les validations. Une PR sans ces éléments n’est pas prête à fusionner.
- Après fusion, distinguer « fusionnée » et « publiée » : vérifier le succès du workflow Pages et le numéro réellement servi avant d’annoncer la disponibilité en ligne.

Un oubli se corrige par une nouvelle PR et une nouvelle version, avec une note rétroactive qui identifie la PR concernée ; ne pas réécrire l’historique de `main`.

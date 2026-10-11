# DDD — Architecture documentaire et recherche

Version 0.7.2. Le dossier historique `docs/gdd/` contient les DDD par domaine. Garder ces chemins conserve les liens existants; leur titre DDD indique une description des règles livrées.

## Carte des domaines

| DDD | Responsabilité et points d’entrée |
|---|---|
| [Personnages](./personnages.md) | Identité, personnalité, quatre besoins, deux axes, pressions et courbes |
| [Actions](./actions.md) | Six actions, sac/défausse, acquisitions, retraits, durées et interruptions |
| [Sommeil](./sommeil.md) | Horaires personnels, récupération, engagements nocturnes et accélération |
| [Traits](./traits.md) | Catalogue complet, permanence, seuils, incompatibilités et modificateurs |
| [Interactions](./interactions.md) | Séances, admission, initiative, partenaires, chances et résultats directs et propositions d’activité |
| [Relations](./relations.md) | Directions, tension, grief, lien amoureux, couples et souvenirs |
| [Musique](./musique.md) | Instruments, plateaux, pratique, Jam et six moments techniques |
| [Groupes](./groupes.md) | Formation, attachement, couleur, réputation, adoption, appels, départs et dissolution |
| [Compositions](./compositions.md) | Projets, coauteurs, qualités, classement relatif, catalogue, maîtrise et noms |
| [Déchéance](./decheance.md) | Excès, chaînes, cartes/jetons liés, récupération et compatibilité de scène |
| [Shows](./shows.md) | Calendrier, candidatures, cartes, public, bilans et présentation conservés |
| [Temps](./temps.md) | Horloges, pause, sommeil accéléré et historique |
| [Technique](./technique.md) | Modules, schéma JSON, migrations, erreurs et validation |
| [Raccords V7](./raccords-v7.md) | Consommateurs adaptés, limites débranchées et chantiers reportés |
| [Documentation](./documentation.md) | Structure, sources communes, navigation, indexation et vérification |

Le guide est une entrée joueur. Les notes de versions racontent les changements historiques. PLAN_V7 garde les décisions et propositions de conception, avec un avertissement sur les arbitrages réalisés; PLAN_V6 reste un document historique, sans annoncer ses règles comme actuelles.

Le [plan V7.1](../PLAN_V7_1.md) conserve les décisions et propositions de conception ; sa section Réalisation 0.7.1 indique les arbitrages effectivement codés et les limites. Les DDD décrivent les règles actuelles. Une proposition historique n’est pas une mécanique active simplement parce qu’elle figure dans le plan.

Le [plan V7.2](../PLAN_V7_2.md) conserve les décisions et les hypothèses d’avant réalisation. Sa section Réalisation décrit les paramètres effectivement retenus et les écarts. L’[audit V7.1](../AUDIT_V7_1_RELATIONS.md) est la référence avant correction ; le [rapport d’équilibrage V7.2](../BALANCE_V7_2.md) consigne les résultats reproductibles. Les DDD décrivent la branche livrée ; la publication du site attend l’intégration de la PR.

## VitePress et index du jeu

`docs/.vitepress/config.mjs` expose les quinze DDD dans la navigation. La recherche VitePress est locale (`provider: local`), construite depuis les Markdown publiés. Le site est servi sous `/garage-vivant/docs/`.

`scripts/build-docs.mjs` construit VitePress et copie le résultat dans `dist/docs/`. Il parcourt le guide et tous les Markdown du dossier DDD pour générer `dist/doc-index.json`. La recherche du jeu, ouverte par Rechercher ou Ctrl+Espace, utilise ces mêmes contenus. Ses rubriques possèdent chacune un nom; les recherches comme plateaux, coauteurs, défausse, chaîne de déchéance, qualité relative, noms, Solitaire et débranché mènent aux règles correspondantes.

Les sous-sections sont indexées avec titres et ancres compatibles avec VitePress. Les tableaux restent cherchables sous forme de texte. Le nettoyage enlève liens et Markdown des extraits. Les notes historiques et plans sont accessibles par leurs pages, sans encombrer les rubriques courantes de recherche du jeu.

## Maintenir les sources

Tout changement mécanique doit actualiser le DDD propriétaire et ses liens de raccord. Un changement de schéma ou de migration actualise aussi Technique; un raccord inactif actualise le registre moteur et Raccords V7. Les identifiants des notes lues sont importés depuis `release.mjs` pour éviter une liste historique oubliée. Une version actualise `release.mjs`, `package.json`, le footer documentaire et les notes.

Le test documentaire vérifie les pages attendues, liens Markdown locaux, présence de tous les traits/limites, version, navigation et entrée de recherche pour les termes V7.2. Le test Chromium vérifie la recherche du jeu et celle de VitePress sur la page construite, l’ouverture des règles et les notes lues. Le build refuse les liens morts. La CI publie documentation et jeu ensemble après tests.

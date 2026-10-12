# BandLive · vérification de l’équilibrage

4 200 prestations : 100 graines pour chacune des 42 combinaisons de sept formations, trois scènes et deux choix de styles. Le joueur simulé choisit ses cartes et cibles par une heuristique gloutonne ; ce résultat ne mesure ni une stratégie optimale ni le taux de victoire de joueurs humains.

Les huit cartes spéciales, les Note, les cinq cartes pigées, les trois points d’énergie et les six tours sont inchangés. Les profils de scène sont ceux du module : garage 8 spectateurs, parc 10, grande scène 12.

## Victoires totales avec les styles de la scène

| Formation | Garage · 8 | Parc · 10 | Grande scène · 12 |
|---|---:|---:|---:|
| Duo guitare/basse | 97 % | 0 % | 0 % |
| Duo clavier/sax | 100 % | 100 % | 8 % |
| Trio guitare/basse/batterie | 92 % | 0 % | 0 % |
| Quatuor chant | 100 % | 82 % | 10 % |
| Quatuor sax | 96 % | 33 % | 2 % |
| Quatuor collectif | 100 % | 100 % | 72 % |
| Six instruments | 100 % | 96 % | 51 % |

## Accueil sur la grande scène

| Formation | Styles de la scène : accueil moyen | Hors styles : accueil moyen |
|---|---:|---:|
| Duo guitare/basse | 52.6 /100 | 43.9 /100 |
| Duo clavier/sax | 91.7 /100 | 83 /100 |
| Trio guitare/basse/batterie | 51 /100 | 41.6 /100 |
| Quatuor chant | 79.3 /100 | 70.1 /100 |
| Quatuor sax | 65.8 /100 | 54.9 /100 |
| Quatuor collectif | 96.6 /100 | 93.7 /100 |
| Six instruments | 91.8 /100 | 86.1 /100 |

## Ce que ces résultats indiquent

- Le garage est une entrée très accessible ; le parc et la grande scène séparent nettement les formations.
- Les effets collectifs gagnent en valeur avec la taille du public. Le duo clavier/sax et le quatuor collectif restent beaucoup plus efficaces face aux grandes foules que les formations centrées sur les cibles uniques.
- Une formation de six musiciens ne domine pas automatiquement : la pioche commune de cinq cartes peut diluer les synergies recherchées.
- L’accueil du calendrier et la victoire totale sont distincts. Un show peut toucher une grande partie du public, dépasser les attentes du lieu et recevoir un bilan positif sans avoir conquis chaque spectateur.
- La limite de six tours rend les grandes scènes très difficiles pour les formations à cibles uniques. C’est le principal point à discuter au prochain réglage ; les valeurs des cartes approuvées n’ont pas été modifiées pour masquer cet écart.

La prochaine comparaison utile serait une résistance qui tient aussi compte de la formation ou un ajustement du défi des grandes scènes, en gardant les cartes faciles à comprendre. Un essai humain reste nécessaire pour mesurer le plaisir de jeu et les erreurs de choix.

[Données complètes des 42 scénarios](BANDLIVE_BALANCE.json) · reproduction : `npm run audit:bandlive`.

# Design — Portails métier et Security

## Direction proposée

Interface de travail professionnelle inspirée d’un ERP :

- En-tête utilisateur/périmètre
- Navigation latérale
- Zone centrale de travail
- Fond clair
- Tables lisibles
- Statuts explicites

### Palette proposée

| Élément | Couleur |
|---|---|
| Fond | `#F6F8FB` |
| Texte | `#172B4D` |
| Bleu principal | `#2457A7` |
| Accent Security | `#6D4BA8` |

Ce n’est pas une charte SAP officielle.

## Composants

- **Material UI avec Emotion** comme système d’interface principal.
- **Data Grid Community** pour les listes.
- **Formulaires et Dialog** pour les confirmations.
- **Stepper** pour la progression.
- **Alert / Snackbar** pour le retour utilisateur.

Éviter un second système shadcn/Tailwind dans le même portail.

## Écrans métier

- **Accueil** : applications autorisées.
- **Listes** : filtrées et paginées.
- **Fiche de document** : résumé, lignes, montants, statut, actions et historique.
- **Modèles cohérents** pour les achats, ventes, factures et budgets.

## Écrans Security

- Tableau des demandes, tickets et risques.
- Utilisateur avec état et attributions datées.
- Rôle avec permissions et utilisateurs affectés.
- Diagnostic avec action, objet simulé, valeurs et motif.
- Demande avec besoin, durée, approbation et risque.
- Campagne de revue.
- Audit en lecture.

## Wireframes fonctionnels

### Liste

```text
Titre → Filtres → Table → Pagination
```

### Document

```text
Identification / Statut → Lignes → Totaux → Actions → Historique
```

### Ticket

```text
Contexte → Diagnostic → Impact → Approbation → Correction → Tests → Clôture
```

### Attribution

```text
Utilisateur → Rôle → Périmètre → Début / Fin → Analyse SoD → Validation
```

## Accessibilité et retours

- Labels visibles.
- Focus clavier.
- Contrastes suffisants.
- Icône + texte pour les statuts.
- États chargement, vide, erreur et succès.
- Erreurs serveur conservées et expliquées.
- Diagnostic détaillé réservé au Security habilité.
- Interface bureau prioritaire, avec consultation mobile.

## Mouvement

- CSS/MUI d’abord.
- Transitions proposées : **120–180 ms**.
- Motion uniquement pour une interaction utile non couverte.
- Respecter `prefers-reduced-motion`.
- Pas de particules, défilement forcé, 3D ou animations continues dans les écrans opérationnels.

## Vérification

- Tester le clavier, les formulaires et les parcours réels avec **Playwright**.
- Captures représentatives à produire :
  - Liste d’achats
  - Document
  - Diagnostic
  - Rôle
  - Demande
- Aucun effet visuel ne doit être nécessaire à l’exécution ni masquer un refus.

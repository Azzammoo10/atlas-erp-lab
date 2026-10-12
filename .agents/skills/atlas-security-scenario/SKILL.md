---
name: atlas-security-scenario
description: "Cadrer une mission Security Atlas ERP Lab : acteurs, accès, périmètres, règles métier/SoD, tests et audit. Utiliser pour créer ou modifier un exercice, une attribution ou ses critères ; pas pour un simple problème de build ni pour lancer une phase non autorisée."
---

# Scénario Security Atlas

Lire [AGENTS.md](../../../AGENTS.md), les sections pertinentes du [PRD](../../../docs/PRD-atlas-erp-lab.md) et les [règles détaillées](../../../docs/project-rules.md). Respecter la phase autorisée : ces instructions ne déclenchent pas T02 ou les modules métier.

## Workflow

1. Identifier l’acteur, le besoin, l’action et le document déjà stocké ; distinguer état du compte, session, attribution et statut métier.
2. Définir AD01/MAD, site ou centre de coûts réel, état initial et données fictives. Les noms de tables des exemples sont des propositions futures, pas le schéma T01.
3. Appliquer le [modèle d’autorisation](references/authorization-model.md) : compte/session, attribution [début, fin), action et périmètre dans une même permission, SoD/contexte, conditions métier. Le backend filtre aussi listes, détails et exports.
4. Classer le refus **avant** de proposer une correction. Droit/périmètre absent : correction minimale justifiée et approuvée, après analyse d’impact. Blocage métier : corriger le processus/document, **aucune correction de rôle**. SoD bloquante : ne pas la contourner par une approbation ou durée courte.
5. Décrire la gouvernance uniquement si elle s’applique ; ne pas créer automatiquement une demande d’accès pour chaque erreur. Les diagnostics étendus sont une fonction du lab, pas le SU53 SAP réel.
6. Produire un diagramme clair où les décisions côté backend, transactions et commits sont visibles. Ne pas enregistrer un audit SUCCESS indépendant avant commit métier.
7. Adapter la [matrice de tests](references/scenario-test-matrix.md) au scénario, avec preuve du résultat métier et de l’audit. Distinguer explicitement expiration d’attribution et désactivation/révocation du compte.
8. Si une remise à zéro est demandée : la limiter au profil lab ET à une autorisation explicite, garder historique/audit, utiliser une nouvelle exécution d’exercice. Aucune purge, suppression de volume ou endpoint de reset créé dans T01.

Remplir le [gabarit](templates/scenario-spec.template.md). Ne pas présenter un exemple documentaire comme une implémentation ou un test exécuté.

---
name: atlas-security-scenario
description: "Transformer une mission de sécurité Atlas ERP Lab en scénario implémentable et testable. À utiliser lors de la création ou modification d'un exercice, de règles d'accès, de données initiales ou de critères de validation."
---

# atlas-security-scenario

Ce skill guide la formalisation d'un scénario ou exercice de sécurité SAP simulé dans **Atlas ERP Lab** (ex. missions Karim, Adam, Nadia, revue d'accès).

## Quand utiliser ce skill

- Création ou mise à jour d'un exercice ou mission Security.
- Définition ou ajustement de rôles PFCG simulés, permissions et périmètres (`AD01`, `Casablanca`, `Rabat`, centres de coûts).
- Cadrage d'une règle de Séparation des Tâches (SoD) ou d'une règle contextuelle (ex. auto-approbation).
- Élaboration de la matrice de tests et des preuves d'audit pour valider un scénario.

## Documents à consulter selon la tâche

> Ne chargez pas toute la documentation du projet. Consultez uniquement :

- Pour les acteurs, sites et missions cibles : voir [PRD-atlas-erp-lab.md](../../../docs/PRD-atlas-erp-lab.md) (sections *Entreprise et acteurs* et *Six exercices*).
- Pour le modèle de contrôle d'accès : voir [references/authorization-model.md](references/authorization-model.md) et [AGENTS.md](../../../AGENTS.md) (section *Modèle d'autorisation*).
- Pour la matrice de tests et preuves d'audit : voir [references/scenario-test-matrix.md](references/scenario-test-matrix.md).
- Pour rédiger la spécification du scénario : utiliser le gabarit [templates/scenario-spec.template.md](templates/scenario-spec.template.md).

---

## Workflow d'élaboration

### 1. Identifier acteurs, besoin métier et opération
- **Acteur principal** (ex. Karim, Adam, Nadia) et son rôle métier initial.
- **Opération métier visée** (ex. réception de commande d'achat MM sur un site, validation de facture FI, remise SD).
- **Objectif de sécurité** (ex. correction minimale de périmètre, attribution temporaire avec expiration, blocage SoD strict, déprovisionnement complet).

### 2. Définir données, périmètres et état initial
- **Société** : `AD01`, devise `MAD`.
- **Périmètre géographique / organisationnel** : `Casablanca`, `Rabat`, ou centre de coûts concerné.
- **Documents métier préexistants** : commandes pré-créées, réceptions, factures (avec statut initial requis).
- **État du compte** : actif, verrouillé, ou non encore créé.

### 3. Séparer compte, rôle, permission et attribution datée
Appliquer strictement la séparation SAP simulée :
- **Compte utilisateur** (`SU01`) : identifiant, état (actif/inactif), dates de validité du compte.
- **Rôle PFCG simulé** : conteneur de permissions avec valeurs de périmètre.
- **Permission** : action (`READ`, `CREATE`, `APPROVE`, `RECEIVE`, etc.) associée à un périmètre permis. *Ne jamais combiner l'action d'une permission avec le périmètre d'une autre*.
- **Attribution (User Assignment)** : liaison compte-rôle avec `validFrom`, `validTo` (instants UTC) et justification.

### 4. Définir contrôles d'autorisation, règles SoD et conditions métier
Chaque opération protégée doit vérifier la séquence stricte :
1. Compte actif et session serveur valide.
2. Attribution de rôle en cours de validité (non expirée).
3. Action demandée autorisée par une permission attribuée.
4. Périmètre du document stocké conforme au périmètre autorisé (vérification côté backend).
5. Pas de conflit SoD bloquant (ex. enregistrement facture + paiement sur AD01) ni d'auto-approbation contextuelle.
6. Conditions métier satisfaites (ex. commande approuvée avant réception, facture validée avant paiement).

### 5. Décrire demande, approbation et correction si nécessaires
- Workflow de gouvernance : qui soumet la demande d'accès, qui approuve (Responsable Security).
- Distinction claire :
  - **Correction de périmètre** : ajustement ciblé au moindre privilège (ex. Casablanca sans Rabat).
  - **Accès temporaire** : attribution bornée dans le temps avec expiration automatique.
  - **Conflit SoD** : rejet systématique de la demande ou blocage au niveau de l'exécution, même si approuvé ou temporaire.
  - **Diagnostic SU53** : affichage pédagogique du refus avec explication et lien vers demande d'accès.

### 6. Produire un diagramme de séquence Mermaid lisible
Modéliser les interactions entre :
- Utilisateur / Navigateur
- Contrôleur REST (`/api/...`)
- Service de sécurité / Sélecteur de permissions
- Service métier & Base PostgreSQL
- Journal d'audit (survit au rollback métier)

### 7. Définir les cas de test et preuves attendues
Décliner la matrice systématique (voir [references/scenario-test-matrix.md](references/scenario-test-matrix.md)) :
- Cas nominal autorisé (bon acteur, bon site).
- Droit absent (action non attribuée).
- Périmètre erroné (action autorisée sur Casablanca, tentative sur Rabat).
- Statut métier non prêt (ex. réception avant approbation).
- Auto-approbation ou conflit SoD bloquant.
- Accès expiré (test avec horloge `Clock` simulée).
- Compte désactivé et session révoquée.
- Tentative par appel direct à l'API REST.
- Preuves d'audit persistées (avec `result = SUCCESS` ou `result = DENIED`, motif et périmètre).

### 8. Définir une remise à zéro contrôlée de l'exercice
- Procédure de reset idempotente (accessible uniquement sous le profil de test/lab).
- Restauration des attributions, statuts des comptes et documents à leur état initial.
- Purge sélective ou archivage des traces de l'exercice pour rejouabilité immédiate.

---

## Modèle de sortie

Pour formaliser le scénario, remplir le gabarit [templates/scenario-spec.template.md](templates/scenario-spec.template.md) qui structure :
1. **Identifiant et objectif** (ex. `SCN-01-KARIM-RECEIPT-CORRECTION`).
2. **Contexte métier bref** (acteurs, documents).
3. **État initial** (comptes, rôles, attributions, périmètres).
4. **Chaîne de contrôle et règles SoD**.
5. **Workflow de gouvernance** (demande, approbation, simulation SU53).
6. **Diagramme Mermaid**.
7. **Matrice des 8 cas de test et preuves d'audit**.
8. **Procédure de reset du scénario**.

---
name: atlas-spring-feature
description: "Concevoir et implémenter une fonctionnalité backend Spring Boot dans Atlas ERP Lab selon l'architecture modulaire, la chaîne de contrôle d'accès en 6 étapes, Flyway/PostgreSQL, l'audit résistant au rollback et les tests d'intégration."
---

# atlas-spring-feature

Ce skill guide la conception et l'implémentation de fonctionnalités backend Spring Boot (Java 21) pour **Atlas ERP Lab**, qu'il s'agisse de modules métier (**MM**, **FI**, **SD**, **CO**) ou de socles transverses (**identity**, **security**, **governance**, **audit**).

## Quand utiliser ce skill

- Création ou modification d'une entité persistée, d'une migration Flyway ou d'un repository.
- Implémentation ou évolution d'un service métier ou d'un contrôleur REST sous `/api/...`.
- Intégration de la chaîne de vérification d'autorisation (action, périmètre, SoD, auto-approbation).
- Mise en place de l'audit résistant au rollback pour les opérations sensibles ou refusées.
- Rédaction de tests d'intégration avec JUnit et PostgreSQL.

## Documents à consulter selon la tâche

> Ne chargez pas toute la documentation du projet. Consultez uniquement :

- Pour les règles d'architecture backend et conventions : voir [TECH_RULES-stack-codex.md](../../../docs/TECH_RULES-stack-codex.md) (sections *Backend*, *Architecture*, *Sessions et droits*, *Données et transactions*, *API*).
- Pour l'organisation modulaire et les processus métier : voir [AGENTS.md](../../../AGENTS.md) (sections *Architecture*, *Organisation métier*, *Processus métier simplifiés*).
- Pour le guide des 8 modules et contraintes de conception : voir [references/backend-architecture-rules.md](references/backend-architecture-rules.md).
- Pour l'implémentation du pipeline de sécurité et de l'audit : voir [references/security-pipeline.md](references/security-pipeline.md).
- Pour le gabarit de développement d'une fonctionnalité : utiliser [templates/spring-feature-checklist.template.md](templates/spring-feature-checklist.template.md).

---

## Workflow d'implémentation

### 1. Cadrage du module cible et dépendances
- Identifier le module fonctionnel d'appartenance (`identity`, `security`, `governance`, `audit`, `mm`, `fi`, `sd`, `co`).
- Respecter le principe du monolithe modulaire : contrôleurs fins, services explicites, pas de dépendances circulaires entre modules.
- Séparer strictement les DTOs exposés des entités JPA persistées.

### 2. Modélisation et migration Flyway
- Créer un script de migration versionné dans `db/migration/V...__nom.sql` (ne jamais modifier une migration déjà appliquée).
- Types obligatoires :
  - `NUMERIC(15, 2)` pour les montants financiers (en MAD).
  - Clés étrangères explicites (`FOREIGN KEY ... REFERENCES ... ON DELETE RESTRICT`).
  - Contraintes d'unicité (`UNIQUE`) et d'intégrité (`CHECK`).
  - Colonne `version BIGINT NOT NULL DEFAULT 0` pour le verrouillage optimiste.
  - Horodatages en UTC (`TIMESTAMP WITH TIME ZONE`).

### 3. DTOs et validation de surface
- DTOs d'entrée (`*Request`) et de sortie (`*Response`) immuables (Java `record`).
- Bean Validation obligatoire sur les entrées (`@NotNull`, `@NotBlank`, `@Size`, `@DecimalMin`, `@Valid`).
- Pas de fuite d'informations sensibles (mots de passe, tokens, secrets internes) dans les DTOs sortants.

### 4. Repository (Spring Data JPA)
- Interfaces étendant `JpaRepository`.
- Méthodes de lecture et recherche appliquant systématiquement le filtrage par périmètre (`site`, `companyCode`, `costCenter`).
- Requêtes explicites pour prévenir les problèmes de requêtes N+1 (`@EntityGraph` ou `JOIN FETCH`).

### 5. Service métier et pipeline de contrôle d'accès
Le service orchestre la logique métier et la sécurité :
1. **Contrôle d'accès en 6 étapes :** Déléguer au composant de sécurité la validation de :
   `Compte actif` → `Session valide` → `Attribution de rôle en cours` → `Action permise` → `Périmètre réel du document` → `Règle SoD / Auto-approbation`.
2. **Vérification du statut métier :** Valider les prérequis (ex. commande approuvée avant réception).
3. **Atomicité transactionnelle :** `@Transactional` pour garantir les mises à jour conjointes (ex. réception de commande et incrément de stock sur le site).
4. **Calculs financiers :** Utiliser exclusivement `BigDecimal` avec arrondi explicite (`RoundingMode.HALF_UP`).
5. **Gestion du temps :** Injecter une instance `Clock` pour la génération des dates/heures (permettant les tests d'expiration).
6. **Journalisation d'audit résistant au rollback :** Les refus d'accès et opérations sensibles doivent être consignés dans une transaction séparée (`Propagation.REQUIRES_NEW`) afin de survivre à l'annulation de la transaction métier.

### 6. Contrôleur REST fin
- Annoter avec `@RestController` sous `/api/v1/[module]/...`.
- Réponses d'erreur au format standardisé RFC 7807 `ProblemDetail` :
  - `401 Unauthorized` : session inexistante ou révoquée.
  - `403 Forbidden` : droit manquant, périmètre incorrect ou violation SoD.
  - `400 Bad Request` / `422 Unprocessable Content` : échec de validation ou incohérence de statut métier.
  - Pas de stack trace ni de données sensibles dans les messages d'erreur.
- Pagination obligatoire (`Pageable`) pour toutes les listes et recherches.

### 7. Tests d'intégration (JUnit & PostgreSQL)
Écrire des tests d'intégration représentatifs validant :
- Le scénario nominal (succès, statut mis à jour, stock/facture persistés, audit `SUCCESS`).
- Le refus pour droit manquant (`403`, audit `DENIED`).
- Le refus pour périmètre non autorisé (ex. rôle Casablanca tentant une action sur Rabat).
- Le blocage SoD ou tentative d'auto-approbation.
- L'expiration d'un accès temporaire en avançant la `Clock`.
- La persistance de l'événement d'audit même lors d'une transaction métier annulée.

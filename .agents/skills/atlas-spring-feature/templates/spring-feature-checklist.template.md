# Fiche de Développement : Fonctionnalité Backend Spring Boot

## 1. Cadrage de la Fonctionnalité

- **Nom de la fonctionnalité :** [Ex. Validation et paiement des factures FI]
- **Module cible :** [`identity` / `security` / `governance` / `audit` / `mm` / `fi` / `sd` / `co`]
- **Dépendances nécessaires :** [Ex. `fi` dépend de `mm` (pour référence PO), `security`, `audit`]
- **Endpoints REST à exposer :**
  - `[METHOD] /api/v1/[module]/...`

---

## 2. Checklist d'Implémentation

### Base de données & Flyway
- [ ] Script de migration créé : `db/migration/V[Timestamp/Seq]__[description].sql`
- [ ] Types monétaires en `NUMERIC(15, 2)` (MAD)
- [ ] Clés étrangères avec `ON DELETE RESTRICT` et contraintes `CHECK` appropriées
- [ ] Colonne `version BIGINT NOT NULL DEFAULT 0` pour verrouillage optimiste
- [ ] Index créés sur les colonnes de filtrage (`site`, `company_code`, `status`)

### Modèle & Repository
- [ ] Entité JPA avec `@Entity`, `@Table`, contraintes d'unicité et `@Version`
- [ ] Repository étendant `JpaRepository` avec filtrage par périmètre (`site`, etc.)
- [ ] Requêtes avec chargement explicite des relations (`@EntityGraph` ou `JOIN FETCH`) pour éviter le N+1

### DTOs & Validation
- [ ] Records immuables d'entrée (`*Request`) et de sortie (`*Response`)
- [ ] Bean Validation sur les champs (`@NotNull`, `@NotBlank`, `@DecimalMin`, `@Size`)
- [ ] Aucun secret ou champ interne exposé dans le DTO de réponse

### Service Métier & Sécurité
- [ ] Chaîne de contrôle en 6 étapes appliquée (Compte → Session → Attribution → Action → Périmètre → SoD/Contexte → Statut)
- [ ] Calculs monétaires en `BigDecimal` avec `RoundingMode.HALF_UP`
- [ ] Injection du bean `Clock` pour toute manipulation de date/heure
- [ ] `@Transactional` sur les opérations mutantes avec garantie d'atomicité
- [ ] Appel à `AuditService` avec `Propagation.REQUIRES_NEW` pour journaliser succès ET refus (résistance au rollback)

### Contrôleur REST & Erreurs
- [ ] `@RestController` fin sous `/api/v1/[module]/...`
- [ ] `@Valid` sur les paramètres de requête
- [ ] Pagination (`Pageable`) avec `Page<T>` ou collection bornée côté serveur
- [ ] Erreurs au format RFC 7807 `ProblemDetail` (401, 403, 409, 422) sans fuite de stack trace

### Tests d'Intégration (JUnit & PostgreSQL)
- [ ] Test nominal (succès, données persistées, événement d'audit `SUCCESS`)
- [ ] Test refus droit absent (`403`, audit `DENIED` avec `MISSING_PERMISSION`)
- [ ] Test refus mauvais périmètre (`403`, audit `DENIED` avec `SCOPE_MISMATCH`)
- [ ] Test blocage condition métier / statut invalide (`422`)
- [ ] Test conflit SoD ou auto-approbation (`403` / `409`)
- [ ] Test accès expiré via `Clock` simulée
- [ ] Test survie de l'audit lors de l'annulation de la transaction métier

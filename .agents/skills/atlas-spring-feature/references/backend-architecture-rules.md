# Règles d'Architecture Backend — Atlas ERP Lab

## 1. Organisation du Monolithe Modulaire

Le backend d'Atlas ERP Lab est structuré en **8 modules fonctionnels distincts** au sein du même artefact Spring Boot :

| Module | Périmètre et Responsabilité | Dépendances autorisées |
|---|---|---|
| `identity` | Comptes utilisateurs (`app_user`), authentification, sessions serveur, hachage des mots de passe. | Indépendant des modules métier. |
| `security` | Rôles (`security_role`), permissions (`role_permission`), attributions datées (`user_role_assignment`), simulation SU01/PFCG/SUIM. | `identity` |
| `governance` | Demandes d'accès, approbations, matrice de règles SoD, revues d'accès. | `identity`, `security` |
| `audit` | Journal des événements d'accès et opérations sensibles, diagnostics de refus (simulation SU53), preuves d'audit. | `identity` (pour l'acteur), transverse. |
| `mm` | Gestion des achats et stocks : Fournisseurs, commandes d'achat (PO), réceptions et stocks par site (`Casablanca`, `Rabat`). | `identity`, `security`, `audit` |
| `fi` | Factures fournisseurs et paiements simulés, consultation des factures clients. | `identity`, `security`, `audit`, `mm` (référence PO) |
| `sd` | Ventes : Clients, commandes de vente (SO), validation des remises (> 5%), livraisons par site. | `identity`, `security`, `audit` |
| `co` | Contrôle de gestion : Centres de coûts, suivi des budgets, imputation des dépenses réelles. | `identity`, `security`, `audit`, `mm`, `fi` |

> **Règle absolue :** Aucune dépendance circulaire. Les modules transverses (`identity`, `security`, `audit`) ne doivent jamais importer de classes des modules métier (`mm`, `fi`, `sd`, `co`).

---

## 2. Découpage en Couches par Module

Pour chaque module, appliquer la structure stricte :
```text
com.atlas.erp.[module]/
├── controller/     # Contrôleurs REST fins (@RestController sous /api/v1/[module])
├── dto/            # Records immuables (Request, Response) avec Bean Validation
├── service/        # Logique métier, contrôles d'accès, transactions (@Transactional)
├── model/          # Entités JPA (@Entity) avec contraintes et @Version
└── repository/     # Interfaces Spring Data JPA avec filtres de périmètre
```

### Conventions de conception :
- **Contrôleurs fins :** Ne contiennent aucune logique métier ni vérification d'autorisation ad-hoc ; ils délèguent immédiatement au service.
- **DTOs vs Entités :** Ne jamais retourner directement une entité JPA annotée `@Entity` au client REST. Toujours mapper vers un DTO `Record`.
- **Validation serveur :** Ne jamais se fier aux validations du frontend. Valider les DTOs d'entrée avec `@Valid` et annotations Bean Validation.

---

## 3. Données, Transactions et Concurrence

### Montants et Devises :
- Toute valeur financière (prix unitaire, total HT/TTC, budget) doit être typée en `BigDecimal` en Java et `NUMERIC(15, 2)` en base PostgreSQL.
- Arrondi explicite : `amount.setScale(2, RoundingMode.HALF_UP)`.
- Ne jamais utiliser `float` ou `double` pour manipuler de l'argent.

### Concurrence et Intégrité :
- Ajouter le champ `@Version private Long version;` sur toute entité mutable (commandes, stocks, budgets) pour le verrouillage optimiste.
- **Opérations atomiques :** La réception d'une commande d'achat et l'incrémentation du stock sur le site correspondant doivent se dérouler dans la même transaction `@Transactional`. En cas d'échec sur le stock, la réception est rollbackée.
- **Paiement unique :** Vérifier l'unicité du paiement via une contrainte d'unicité en base (`UNIQUE (invoice_id)`) pour empêcher tout double paiement même en cas de requêtes concurrentes.

---

## 4. Gestion du Temps et Expirations

- Stocker tous les horodatages en UTC (`TIMESTAMP WITH TIME ZONE` en SQL, `Instant` en Java).
- Ne jamais appeler directement `Instant.now()` ou `LocalDateTime.now()` dans les services métier.
- Toujours injecter un bean `java.time.Clock` :
  ```java
  @Service
  public class AssignmentService {
      private final Clock clock;
      // ...
      public boolean isAssignmentActive(UserRoleAssignment assignment) {
          Instant now = clock.instant();
          return !now.isBefore(assignment.getValidFrom()) && 
                 (assignment.getValidTo() == null || now.isBefore(assignment.getValidTo()));
      }
  }
  ```
  Cela permet d'avancer virtuellement le temps dans les tests d'intégration pour tester les expirations d'accès sans attente.

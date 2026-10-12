# Pipeline de Sécurité, Audit et Gestion des Erreurs — Atlas ERP Lab

## 1. Pipeline de Contrôle d'Accès en 6 Étapes

Dans les services métier Spring Boot, chaque opération protégée doit passer par le pipeline de vérification :

```java
public void checkPermission(UserSession session, String requiredAction, String targetScope, Document doc) {
    // 1. Compte & Session
    if (!session.isActive() || session.isLocked()) {
        throw new AccountInactiveException("Compte inactif ou verrouillé");
    }
    
    // 2. Attribution valide
    List<Assignment> activeAssignments = assignmentService.findActiveAssignments(session.getUserId(), clock.instant());
    if (activeAssignments.isEmpty()) {
        throw new AccessDeniedException("Aucune attribution active");
    }
    
    // 3. Action autorisée & 4. Périmètre réel du document
    boolean authorized = activeAssignments.stream()
        .anyMatch(a -> a.hasPermission(requiredAction) && a.coversScope(doc.getSite()));
    if (!authorized) {
        throw new ScopeMismatchException("Action ou périmètre non autorisé sur le document");
    }
    
    // 5. Règle SoD et Règle contextuelle
    if (sodService.hasConflict(session.getUserId(), requiredAction, doc.getCompanyCode())) {
        throw new SodViolationException("Conflit de Séparation des Tâches (SoD) bloquant");
    }
    if (doc.getAuthorId().equals(session.getUserId()) && isApprovalAction(requiredAction)) {
        throw new SelfApprovalException("L'auto-approbation d'un document est interdite");
    }
    
    // 6. Conditions de statut métier
    if (!doc.isReadyFor(requiredAction)) {
        throw new BusinessStatusException("Document non prêt pour cette action");
    }
}
```

---

## 2. Audit Résistant au Rollback

### Le Problème :
Lorsqu'une exception est levée (par exemple `ScopeMismatchException` ou `SodViolationException`), Spring annule la transaction courante via `@Transactional(rollbackFor = Exception.class)`. Si l'audit était écrit dans la même transaction, l'enregistrement du refus disparaîtrait !

### La Solution :
Le service d'audit (`AuditService`) doit utiliser une transaction indépendante avec `Propagation.REQUIRES_NEW` :

```java
@Service
public class AuditService {
    private final AuditEventRepository auditRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordEvent(AuditEvent event) {
        auditRepository.save(event);
    }
}
```

### Motif de refus standardisés :
- `MISSING_PERMISSION` : Droit manquant dans les rôles attribués.
- `SCOPE_MISMATCH` : Périmètre (site ou société) non autorisé.
- `ASSIGNMENT_EXPIRED` : Attribution temporaire arrivée à expiration.
- `SOD_VIOLATION` : Violation d'une règle SoD déclarée.
- `SELF_APPROVAL_BLOCKED` : Tentative d'auto-approbation.
- `ACCOUNT_LOCKED` : Compte utilisateur suspendu ou départ enregistré.

---

## 3. Format d'Erreur RFC 7807 (`ProblemDetail`)

Dans le `@RestControllerAdvice` centralisé, traduire systématiquement les exceptions en objets standardisés `ProblemDetail` :

| Exception | Statut HTTP | Type / Code d'erreur | Titre explicite |
|---|---|---|---|
| `UnauthenticatedException` | `401 Unauthorized` | `urn:atlas:error:unauthorized` | Session absente ou révoquée |
| `ScopeMismatchException` | `403 Forbidden` | `urn:atlas:error:scope-mismatch` | Périmètre géographique non autorisé |
| `SodViolationException` | `403 Forbidden` ou `409 Conflict` | `urn:atlas:error:sod-violation` | Conflit de séparation des tâches bloquant |
| `SelfApprovalException` | `403 Forbidden` | `urn:atlas:error:self-approval` | Auto-approbation interdite |
| `BusinessStatusException` | `422 Unprocessable Content` | `urn:atlas:error:invalid-status` | Statut du document incompatible |
| `OptimisticLockException` | `409 Conflict` | `urn:atlas:error:concurrent-modification` | Modification concurrente détectée |

> **Règle de sécurité :** Ne jamais inclure de trace de pile (`stackTrace`) ou de détails d'infrastructure dans le payload renvoyé au client.

---

## 4. Filtrage Côté Serveur (Listes, Recherches et Exports)

Ne jamais renvoyer toutes les données au frontend en comptant sur le client pour masquer les lignes hors périmètre :
- Les méthodes du Repository doivent accepter le périmètre utilisateur ou appliquer une clause `WHERE document.site IN (:userSites)`.
- La pagination doit être opérée par la base de données (`Pageable` avec limite maximale imposée par le backend, ex. 50 éléments max par page).
- Les exports CSV/Excel doivent appliquer strictement les mêmes filtres d'autorisation que les APIs de consultation.

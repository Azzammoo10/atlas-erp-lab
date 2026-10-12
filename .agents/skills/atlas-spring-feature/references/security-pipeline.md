# Pipeline, erreurs et limites de l’audit transactionnel

## Six contrôles

1. Compte/session utilisables (inclut révocation et validité du compte).
2. Attribution valide via Clock, bornes UTC [début, fin).
3. Action autorisée.
4. Périmètre réellement stocké couvert par la **même permission**.
5. SoD cumulée et contexte (auto-approbation).
6. Conditions métier (commande approuvée avant réception).

Pseudocode de permission liée, à adapter au futur modèle :

```java
boolean allowed = activeAssignments.stream().anyMatch(assignment ->
    assignment.permissions().stream().anyMatch(permission ->
        permission.action().equals(requiredAction)
        && permission.scope().covers(document.storedScope())));
```

Ne pas tester hasPermission(action) et coversScope(site) séparément sur toute l’attribution : cela mélangerait deux permissions. Une attribution Rabat expirée ne désactive pas Karim ni sa permission Casablanca. Adam désactivé/session révoquée est refusé même si une attribution reste datée valide.

Karim habilité Casablanca avec PO DRAFT : les cinq premiers contrôles passent, seul le métier bloque. Aucune correction de rôle/périmètre ni contournement d’approbation ; reprendre le processus métier.

## Audit : distinguer succès et refus

- **SUCCESS** : écrire dans la transaction métier ; son rollback annule aussi ce succès. Autre option : outbox écrite dans cette transaction, consommation après commit avec reprise/idempotence. Un simple listener afterCommit ne garantit pas la durabilité si le processus s’arrête.
- **Refus/échec** : doit survivre au rollback. Une orchestration hors transaction peut appeler le service métier proxifié puis écrire le refus après son rollback ; ou utiliser un bean d’audit séparé en REQUIRES_NEW. Le mécanisme sera choisi et testé dans la tâche concernée.
- Ne pas journaliser cookies, tokens, mots de passe ou secrets. Enregistrer un snapshot de valeurs minimales, résultat/motif et références committées, pas une entité gérée du contexte extérieur.

### REQUIRES_NEW : option, pas garantie automatique

```java
@Service
public class DenialAuditWriter {
    private final AuditEventRepository repository;

    public DenialAuditWriter(AuditEventRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordDenied(DenialSnapshot snapshot) {
        repository.save(AuditEvent.fromDeniedSnapshot(snapshot));
    }
}
```

Exemple futur, types non implémentés. Limites obligatoires à expliquer :

1. **Proxy Spring** : appeler une méthode proxifiable d’un bean injecté depuis un autre bean. `new DenialAuditWriter(...)` ou `this.recordDenied(...)` contourne l’interception ; les appels internes n’activent pas REQUIRES_NEW. Les méthodes privées/finales ne doivent pas servir de point transactionnel supposé intercepté.
2. **Transaction indépendante** : suspend la transaction extérieure, utilise une autre transaction physique/connexion. Ses écritures ne sont pas annulées par le rollback extérieur ; elle n’est toutefois pas infaillible (erreurs DB, contraintes, crash avant commit).
3. **Données non committées** : l’audit ne voit pas les insertions extérieures non committées selon l’isolation PostgreSQL. Une FK vers un document/acteur en cours de création peut attendre, échouer ou interbloquer avec la transaction extérieure suspendue. Ne pas importer son entité attachée. Utiliser IDs de données déjà committées ou références corrélées textuelles/snapshot validées sans FK prématurée ; documenter le choix de schema.
4. **Verrous et coût** : un appel nécessite connexion supplémentaire, acquisition, commit et I/O. Dimensionner pool et timeouts pour les transactions imbriquées et la concurrence ; un pool trop petit peut épuiser les connexions ou provoquer une attente bloquante. Mesurer, ne pas appliquer REQUIRES_NEW à chaque succès/lecture par défaut.
5. **Échec de l’audit** : définir la politique de réponse/alerte/reprise sans masquer l’échec ni le présenter comme preuve persistée. Un mécanisme asynchrone doit prouver sa durabilité, sinon il ne satisfait pas le contrat.

Tests futurs : refus persistant après rollback ; SUCCESS absent si rollback au flush/commit ; invocation réelle par proxy ; références vers données non committées prises en compte ; lectures indépendantes et concurrence/pool selon le mécanisme choisi. Aucune validation d’audit métier revendiquée sur les seuls tests T01.

## API

Réutiliser les composants ProblemDetail du bootstrap. 401 = authentification manquante/révoquée ; 403 = accès refusé ; statut/code distinct pour blocage métier ou conflit concurrent (ex. 422 BUSINESS_STATUS_INVALID / 409 CONCURRENT_MODIFICATION, propositions à contractualiser). Ne pas exposer de détails d’infrastructure. Les listes/recherches/détails/exports appliquent les mêmes restrictions côté serveur.

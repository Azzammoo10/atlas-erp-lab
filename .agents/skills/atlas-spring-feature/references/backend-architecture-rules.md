# Architecture Spring et réception atomique

## Frontières

Packages `ma.atlas.erp.{identity,security,governance,audit,mm,fi,sd,co}` ; `bootstrap` contient disponibilité/erreurs techniques. Voir [architecture T01](../../../../docs/architecture-t01.md) et [règles détaillées](../../../../docs/project-rules.md). Les futurs échanges passent par services explicites/identifiants/DTO, pas par accès croisés aux repositories ; pas de cycles. SU01 appartient à l’identité, PFCG aux rôles, pas de déplacement imposé par le skill.

Créer controller/dto/service/model/repository seulement quand nécessaires, sans classes/interfaces vides. API sous `/api`, DTO distincts des entités, validation serveur, filtrage réel des données. @Version/verrouillage et contraintes selon concurrence ; le paiement unique exige une unicité en base. BigDecimal/NUMERIC ; choisir précision/échelle et arrondi documentés selon les valeurs métier, plutôt qu’une règle globale inventée.

## Exemple documentaire : réception atomique MM

Futur service MM invoqué via son proxy Spring :

```java
@Transactional
public ReceiptResponse receive(ReceiveRequest request, Actor actor) {
    var order = orders.loadForUpdate(request.orderId());
    // Six contrôles sur l’identité, permissions liées et périmètre stocké.
    access.checkReceive(actor, order);
    order.requireApproved();
    var receipt = receipts.createUniqueFor(order);
    stocks.increment(order.site(), order.lines());
    order.markReceived();
    audit.recordSuccessInCurrentTransaction(actor, receipt);
    // Les erreurs d’intégrité doivent remonter ; ne pas les avaler.
    return receipt.toResponse();
}
```

Ce pseudocode ne définit ni types réels ni schema déjà disponible. La transaction couvre réception, stock, statut et audit SUCCESS. La FK/unicité ou verrou approprié bloque les répétitions concurrentes ; le contrôle préalable seul ne suffit pas. Documenter le traitement des exceptions checked : Spring rollbacke par défaut les RuntimeException/Error, pas toutes les exceptions checked. Pas d’appel interne `this.receive(...)` censé activer @Transactional.

### Tests PostgreSQL à prévoir dans la tâche métier

1. Nominal : après commit, réception unique, statut RECEIVED, quantités exactes par ligne/site et audit SUCCESS.
2. DRAFT pour Karim déjà habilité Casablanca : blocage métier, zéro mutation et droits inchangés ; après approbation distincte, succès avec les mêmes droits.
3. Erreur de stock **après écriture de la réception**, ou violation d’intégrité au flush/commit : réception, toutes les lignes de stock, statut et SUCCESS absents/ inchangés après rollback ; audit du refus/échec selon contrat séparé.
4. Deux appels concurrents avec barrières de synchronisation, pas de sleep arbitraire : au plus une réception/variation de stock, résultat du perdant contractuel, aucun double comptage.
5. Mauvais site/droit : refus et aucune mutation, audit durable.

Utiliser une vraie base PostgreSQL, transactions effectivement committées/rollbackées et lecture indépendante. Ne pas entourer tout le test d’une transaction qui annule automatiquement et masque les erreurs de commit. Ces tests ne sont **pas exécutés par T01**, qui ne contient aucune réception.

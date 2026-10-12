# Matrice des tests et preuves d'audit pour un scénario

Chaque scénario ou exercice Security d'Atlas ERP Lab doit valider obligatoirement cette matrice de tests.

---

## 1. Les 8 cas de test systématiques

| N° | Cas de test | Conditions d'exécution | Résultat attendu (HTTP / Métier) | Preuve d'audit attendue |
|---|---|---|---|---|
| **TC-01** | **Accès autorisé (Nominal)** | Bon compte, rôle valide, action permise, document sur le bon site, statut requis. | `200 OK` ou `201 Created`. Opération persistée. | Événement `SUCCESS` avec `actorId`, `action`, `resourceId`, `site`. |
| **TC-02** | **Droit / Action absent** | Compte actif, mais aucun rôle ne confère l'action demandée. | `403 Forbidden` (`ProblemDetail` : code `ACCESS_DENIED`). | Événement `DENIED` avec motif `MISSING_PERMISSION`. |
| **TC-03** | **Mauvais périmètre** | Rôle autorise l'action sur `Casablanca`, tentative d'opération sur un document de `Rabat`. | `403 Forbidden` (`ProblemDetail` : code `SCOPE_MISMATCH`). | Événement `DENIED` avec motif `UNAUTHORIZED_SITE`. |
| **TC-04** | **Statut non prêt** | Droits et périmètres conformes, mais le document est dans un statut invalide (ex. réceptionner une PO non approuvée). | `422 Unprocessable Content` (ou `400 Bad Request` métier). Transaction annulée. | Événement d'échec métier ou validation documentée. |
| **TC-05** | **Auto-approbation ou conflit SoD** | Tentative d'approuver sa propre commande, ou d'exécuter un paiement en détenant le rôle facturation sur AD01. | `403 Forbidden` ou `409 Conflict` (code `SOD_VIOLATION` ou `SELF_APPROVAL_BLOCKED`). | Événement `DENIED` avec référence de la règle SoD. |
| **TC-06** | **Accès expiré** | Attribution temporaire dont la date `validTo` est dépassée (simulé via `Clock`). | `403 Forbidden` (code `ASSIGNMENT_EXPIRED`). | Événement `DENIED` avec motif `EXPIRED_ACCESS`. |
| **TC-07** | **Compte désactivé / Session révoquée** | Compte marqué inactif ou départ de l'employé avec révocation immédiate des sessions actives. | `401 Unauthorized` (si session révoquée) ou `403 Forbidden` (compte inactif). | Événement de rejet d'authentification ou accès refusé. |
| **TC-08** | **Appel direct à l'API** | Requête HTTP REST directe sans passer par l'interface UI (masquage de bouton contourné). | Contrôles serveur strictement identiques (rejet identique). | Audit backend strictement préservé. |

---

## 2. Structure d'une preuve d'audit

Toute tentative (autorisée ou refusée) génère un enregistrement dans l'audit avec :

```json
{
  "timestamp": "2026-10-12T14:30:00Z",
  "actorId": "karim.mm",
  "action": "MM_PO_RECEIVE",
  "resourceType": "PURCHASE_ORDER",
  "resourceId": "PO-2026-0042",
  "scope": {
    "company": "AD01",
    "site": "RABAT"
  },
  "result": "DENIED",
  "reasonCode": "SCOPE_MISMATCH",
  "details": "User assigned to CASABLANCA only",
  "requestId": "REQ-7781"
}
```

### Règles d'or pour les tests d'intégration :
1. **Clock injectable :** Toujours injecter une instance `Clock` ou `InstantSource` pour tester les expirations d'accès sans attendre l'écoulement réel du temps.
2. **Survie au rollback :** Le test du cas `DENIED` doit vérifier que l'entité métier n'a pas été modifiée, **mais** que la table d'audit contient bien la ligne de refus.

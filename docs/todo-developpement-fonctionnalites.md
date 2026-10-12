# todo.md — Développement par fonctionnalités

Plan issu du PRD, Design et Tech Rules.

## Tâches

- [ ] **T01 — Bootstrap** : versions compatibles, dépôt, frontend/backend, PostgreSQL/Docker, migration, README et CI.  
  **Preuve** : build et lancement reproductibles.

- [ ] **T02 — Identités/sessions** : login/logout, comptes fictifs, verrouillage, CSRF et révocation.  
  **Preuve** : ancienne session refusée après départ.

- [ ] **T03 — Autorisations** : rôles, actions, périmètres, attributions datées et traces.  
  **Preuve** : bon site autorisé, autre site/API directe refusés.

- [ ] **T04 — Console comptes/rôles** : simulations SU01/PFCG/SUIM.  
  **Preuve** : impact utilisateurs visible et changements audités.

- [ ] **T05 — Gouvernance** : besoin, approbation distincte, SoD essentielle et attribution.  
  **Preuve** : approbation ne contourne pas un conflit bloquant.

- [ ] **T06 — MM** : commande, approbation, réception et stock.  
  **Preuve** : statut, périmètre et concurrence contrôlés.

- [ ] **T07 — Diagnostic et tickets** : simulation SU53 et mission Karim complète.  
  **Preuve** : correction approuvée et deux tests de périmètre.

- [ ] **T08 — FI** : facture liée, validation et paiement simulé.  
  **Preuve** : double paiement et paiement Nadia bloqués.

- [ ] **T09 — Cycle de vie** : arrivée Adam, remplacement Karim et départ Adam.  
  **Preuve** : expiration Rabat conserve Casablanca.

- [ ] **T10 — SD** : clients, commande, remise, livraison et facture.  
  **Preuve** : seuil et droits séparés.

- [ ] **T11 — CO** : centres, origine des dépenses et budget.  
  **Preuve** : pas de double comptage ni accès hors centre.

- [ ] **T12 — Revues/audit** : campagne, décision, retrait et auditeur.  
  **Preuve** : retrait effectif et lecture seule.

- [ ] **T13 — Validation globale** : six missions rejouables, tests API/navigateur, dépendances/licences et mesures de performance.

- [ ] **T14 — Extensions** : Fiori/services, IAM/SSO, privilèges de données et SU24/SU25.  
  **Règle** : cadrer critères et limites avant code.

## Contrat d’une tâche

```text
Scénario, données et critères attendus
→ Implémentation minimale cohérente
→ Tests succès / refus / blocage
→ Revue de l’interface
→ Compte rendu de preuves et limites
→ Commit
```

Ces cases décrivent du travail futur, pas du développement déjà réalisé.

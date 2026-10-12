# PRD — Atlas ERP Lab

## Objectif

Créer un ERP pédagogique manipulable pour pratiquer les missions SAP Security junior.

Les modules **MM**, **FI**, **SD** et **CO** exécutent des opérations persistées ; le portail **Security** est central.

Ne pas présenter le lab comme SAP réel ni comme une configuration IBM.

## Entreprise et acteurs

- Entreprise : **AD01**, **MAD**
- Sites : **Casablanca** et **Rabat**
- **Salma** : crée les achats
- **Youssef** : approuve les achats
- **Karim** : réceptionne/livre à Casablanca
- **Imane** : réceptionne/livre à Rabat
- **Lina** : vend
- **Amine** : approuve les remises exceptionnelles
- **Nadia** : enregistre les factures
- **Omar** : valide et autorise les paiements fictifs
- **Sara** : suit les coûts et budgets
- **Mohamed** : intervient sur les accès
- **Responsable Security** : approuve les changements sensibles
- **Hicham** : audite en lecture
- **Adam** : sert aux exercices d’arrivée/départ

## Parcours métier

### MM — Achats et stocks

- Fournisseurs et produits préchargés.
- Commandes avec lignes.
- Cycle de statut : brouillon, soumission, approbation, rejet.
- Réception complète.
- Mise à jour atomique du stock par site.

### FI — Finance

- Facture liée à une commande et une réception.
- Validation et paiement simulé unique.
- Consultation des factures clients.
- Pas de banque réelle ni de comptabilité fiscale exhaustive.

### SD — Ventes

- Clients et commandes.
- Remise supérieure à 5 % soumise à l’approbation d’Amine.
- Livraison complète.
- Facturation par Nadia après livraison.

### CO — Contrôle de gestion

- Centres de coûts.
- Dépenses dont l’origine est explicite.
- Budgets proposés par Sara et approuvés par Omar.
- Pas de double comptage ni assimilation d’une commande à une dépense comptabilisée.

### Règles documentaires

Chaque document doit contenir :

- Numéro
- Auteur
- Date
- Statut
- Périmètre
- Lignes
- Montants
- Historique

Les réceptions partielles et les corrections comptables complexes sont hors MVP.

## Portail Security

### Simulation des fonctions SAP

| Fonction | Simulation |
|---|---|
| SU01 | Comptes et validité |
| PFCG | Rôles, permissions, périmètres et attributions |
| SU53 | Diagnostic avec avertissement sur la différence entre notre journal et le dernier contrôle échoué réel |
| SUIM | Recherche et analyse d’impact |

### Gouvernance et audit

- Demandes d’accès
- Approbations
- Accès temporaires
- Séparation des tâches (SoD)
- Revues d’accès
- Preuves d’audit protégées en lecture

## Modèle d’accès

```text
Utilisateur → Attribution datée → Rôle → Autorisations et périmètres
```

- Un compte actif ne signifie pas accès total.
- Le rôle Security ne donne pas tous les droits métier.
- Les droits doivent être évalués par action et périmètre.
- Ne pas fusionner abusivement des grants distincts.

## Six exercices

1. **Karim — Correction de réception** : correction minimale d’une réception Casablanca approuvée ; test succès à Casablanca et refus à Rabat.
2. **Adam — Arrivée** : compte et accès magasinier Rabat validés, sans copie aveugle.
3. **Karim — Accès temporaire** : accès Rabat temporaire, expiration sans désactiver le compte ni l’accès Casablanca.
4. **Adam — Départ** : désactivation du compte, révocation des sessions, retrait des attributions et conservation de l’historique.
5. **Nadia — Conflit SoD** : demande de paiement AD01 bloquée par conflit SoD avec l’enregistrement, même temporaire.
6. **Revue d’accès** : maintien ou retrait validé par le responsable, retrait appliqué et preuves disponibles pour l’auditeur.

## Critères d’acceptation

- Succès avec le bon compte, droit, site et statut.
- Refus en cas de droit absent, mauvais périmètre ou compte désactivé.
- Blocage métier distinct.
- Accès API directs protégés.
- Toutes les listes, détails et exports filtrés.
- Audit des changements et opérations sensibles.
- Exercices réinitialisables uniquement dans le profil lab.

## Évolutions offre IBM

- **Fiori** : visibilité versus droits backend.
- **Services OData simulés** : clairement distincts du REST initial.
- **IAM/SSO** : à intégrer ensuite.
- **Privilèges HANA simulés** : implémentés sur PostgreSQL, sans équivalence de produits.
- **SU24/SU25** : propositions et comparaison de changements lors d’un upgrade simulé.

## Livraison

### MVP

- Identités
- Autorisations
- Gouvernance essentielle
- Cycle achat MM/FI
- Tickets, diagnostic et audit

### Phases suivantes

- SD et CO
- Revues d’accès
- Extensions

Les quatre modules font partie de la cible ; le découpage ne les supprime pas.

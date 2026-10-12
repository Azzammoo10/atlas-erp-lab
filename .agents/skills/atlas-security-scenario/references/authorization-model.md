# Modèle d'autorisation et de gouvernance — Atlas ERP Lab

## 1. Séparation des concepts

Atlas ERP Lab simule la logique d'autorisation SAP tout en restant un monolithe modulaire moderne :

| Concept Lab | Simulation SAP | Définition | Persistance / Représentation |
|---|---|---|---|
| **Compte** | `SU01` | Identité d'un employé, statut (actif/verrouillé), dates de validité générale. | Table `app_user` |
| **Rôle** | `PFCG` | Conteneur fonctionnel regroupant des autorisations avec périmètres. | Table `security_role` |
| **Permission** | Objet d'autorisation | Couple indissociable `(Action, Valeurs de périmètre)`. Ex. `(PO_RECEIVE, Site=Casablanca)`. | Table `role_permission` |
| **Attribution** | Attribution utilisateur | Association temporaire ou permanente d'un rôle à un compte, avec justification et validité. | Table `user_role_assignment` |
| **Périmètre** | Champs d'organisation | Filtre organisationnel obligatoire : Société (`AD01`), Site (`Casablanca`, `Rabat`), ou Centre de coûts. | Champs de documents métier |

> **Règle clé d'évaluation :**
> Si un utilisateur cumule deux rôles — Rôle A: `(PO_RECEIVE, Casablanca)` et Rôle B: `(PO_APPROVE, Rabat)` — le système ne doit **JAMAIS** combiner l'action de A avec le périmètre de B pour autoriser `PO_RECEIVE` à Rabat !

---

## 2. Ordre d'évaluation du contrôle d'accès (6 étapes)

Pour chaque requête mutante ou lecture sur une ressource protégée, le backend évalue dans l'ordre strict :

```text
1. Compte & Session   → Compte actif, non verrouillé, session serveur valide (HttpOnly cookie)
       ↓
2. Attribution        → Attribution du rôle valide à l'instant T (Clock UTC >= validFrom et < validTo)
       ↓
3. Action             → L'action demandée (ex. INVOICE_PAY) est couverte par le rôle
       ↓
4. Périmètre réel     → Le périmètre stocké du document correspond au périmètre permis (pas de valeur client)
       ↓
5. SoD & Contexte     → Pas de conflit SoD bloquant (ex. facture + paiement) et pas d'auto-approbation
       ↓
6. Règles métier      → Document dans le statut requis (ex. PO approuvée avant réception)
```

Un échec à l'une de ces étapes produit un rejet immédiat, consigné dans l'audit.

---

## 3. Séparation des Tâches (SoD) vs Règles contextuelles

Distinguer rigoureusement les deux types de restrictions :

1. **Conflit SoD structurel (Incompatibilité de privilèges) :**
   - Exemple clé : Cumul des droits d'enregistrement de facture fournisseur (`INVOICE_CREATE`) et de paiement simulé (`INVOICE_PAY`) sur la société `AD01` (scénario Nadia).
   - Règle dans le lab : **Un conflit SoD bloquant ne peut pas être contourné**, même par une approbation managériale ou une attribution à durée courte.
2. **Règle contextuelle (Conflit d'opération sur un même document) :**
   - Exemple : Un utilisateur ayant le droit `PO_APPROVE` ne peut pas approuver un document dont il est l'auteur (`authorId == currentUserId`).
   - Exemple : Une remise SD > 5% ne peut pas être approuvée par le commercial qui l'a saisie.

---

## 4. Simulation SU53 vs Journal d'audit

- **Simulation SU53 (Diagnostic) :**
  - Dans le vrai SAP, `SU53` affiche le dernier échec de vérification d'autorisation (`RC=12`).
  - Dans Atlas ERP Lab, l'écran SU53 pédagogique présente le diagnostic clair du dernier refus : action refusée, périmètre manquant ou manquement de statut, avec un avertissement rappelant qu'il s'agit d'une simulation pédagogique et non d'une capture exacte de production SAP.
- **Journal d'audit :**
  - Les événements d'accès (succès comme refus) sont persistés dans la table d'audit.
  - **Résistance au rollback :** Même si la transaction métier est annulée suite à un refus, l'événement d'audit `DENIED` doit rester écrit en base de données.

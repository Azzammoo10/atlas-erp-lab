# Modèle d’autorisation et gouvernance

## Concepts

- Compte : identité, état et validité générale ; session serveur utilisable.
- Rôle : ensemble de permissions, sans droit métier automatique pour Security.
- Permission : tuple indivisible action + valeurs autorisées (société/site/centre pertinent).
- Attribution : compte → rôle, justification, approbation et validité UTC [validFrom, validTo). validTo absent signifie absence de borne finale selon le contrat du scénario.
- Périmètre : celui du document stocké, jamais une valeur client réputée fiable.

Exemple : RECEIVE/Casablanca + APPROVE/Rabat **ne permet pas** RECEIVE/Rabat. Même une attribution contenant ces deux permissions ne permet pas de prendre l’action de l’une et le site de l’autre.

## Six contrôles

1. Compte et session utilisables.
2. Attribution valide à clock.instant() : instant >= début et instant < fin.
3. Action autorisée.
4. Périmètre couvert par **la même permission** que l’action.
5. SoD/contexte : analyser les permissions cumulées et périmètres, interdire auto-approbation.
6. Conditions métier : document prêt, règles de transition respectées.

Les contrôles 3/4 peuvent être évalués ensemble sans dissocier les permissions. Distinguer les codes de refus dans le contrat du scénario.

## Expiration et départ

Karim garde une attribution permanente RECEIVE/Casablanca. Une attribution temporaire RECEIVE/Rabat expire à T. À T : Rabat est refusé, Casablanca reste permis, compte actif et session utilisable. Tester T moins une unité et T exact avec Clock.

Adam quitte l’entreprise : désactiver son compte et révoquer ses sessions ; même une attribution datée encore valide ne donne plus accès. Retirer les attributions selon le workflow, préserver l’historique. Ces deux situations ne doivent pas être confondues.

## Blocage métier Karim : aucune correction de rôle

Karim actif, session valide, attribution RECEIVE/Casablanca valide ; commande Casablanca DRAFT. Les contrôles d’accès passent, mais la réception nécessite APPROVED. Résultat proposé : 422 + BUSINESS_STATUS_INVALID. Aucun ajout de rôle, périmètre ou droit d’approbation, aucune demande d’accès. Le responsable métier distinct fait approuver la commande selon le processus ; Karim peut ensuite réceptionner avec les mêmes droits. Tester absence de réception/variation de stock et accès inchangés avant approbation.

Si Karim tente une commande Rabat sans RECEIVE/Rabat, il s’agit au contraire d’un refus de périmètre. Toute correction exige un besoin validé ; ne pas l’élargir automatiquement.

## SoD et diagnostics

Nadia : CREATE_INVOICE + PAY_INVOICE sur AD01 = conflit bloquant pédagogique, même temporaire/approuvé. Auto-approbation = règle contextuelle sur le document, distincte du conflit d’accès.

SU01/PFCG/SU53/SUIM sont des simulations ; les codes d’action du lab ne sont pas des objets SAP standard. Ne pas affirmer une équivalence exacte SAP sans documentation officielle. Les diagnostics étendus et l’audit sont réservés aux habilités.

Audit du refus durable après rollback ; succès durable uniquement si le métier est committé. Voir [limites transactionnelles Spring](../../atlas-spring-feature/references/security-pipeline.md).

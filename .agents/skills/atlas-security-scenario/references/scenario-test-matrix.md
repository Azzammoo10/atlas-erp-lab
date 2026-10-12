# Matrice de scénario : tests et preuves futures

Adapter les cas au scénario, sans créer de tests qui recopient seulement les constantes. Aucun de ces parcours métier n’est implémenté dans T01.

| Cas | Vérification | Résultat/preuve à contractualiser |
|---|---|---|
| Autorisé | Bon acteur/action/périmètre/statut | Opération et audit SUCCESS committés ensemble. |
| Action absente | Compte actif, attribution valide sans action | 403, aucune mutation ; audit du refus durable. |
| Mauvais périmètre | RECEIVE/Casablanca sur Rabat | 403 ; ni mélange action/site entre permissions ni fuite des listes/détails. |
| Blocage métier Karim | RECEIVE/Casablanca, PO DRAFT | 422 BUSINESS_STATUS_INVALID ; aucun changement d’accès, réception ou stock. Après approbation distincte, mêmes droits suffisants. |
| SoD/auto-approbation | Cumul incompatible ou auteur approuvant son document | Rejet explicite ; aucune approbation qui contourne la règle. |
| Attribution expirée | Clock avant puis à validTo de Rabat | Rabat refusé à la borne ; Casablanca reste autorisé, compte/session actifs. |
| Compte désactivé | Ancienne session d’Adam après départ | Session révoquée, requête refusée malgré attribution encore datée valide ; historique conservé. |
| API directe | Requête sans UI | Mêmes contrôles et preuves ; un bouton masqué ne protège pas. |

Les statuts/codes métier sont des propositions de contrat pour une future tâche, à harmoniser avec ProblemDetail du socle ; 401 pour authentification manquante, 403 pour autorisation refusée. Ne pas présenter ces codes comme déjà disponibles.

Pour les tests d’audit : lire depuis une transaction/connexion indépendante après rollback ; pas de transaction de test englobante qui masquerait les commits. N’enregistrer aucun secret, cookie ou token ; documenter acteur, action, ressource, périmètre, instant, résultat, motif et référence de demande/exécution.

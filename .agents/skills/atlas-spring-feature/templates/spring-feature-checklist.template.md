# Fiche de fonctionnalité Spring [titre]

## Cadrage

- Tâche explicitement autorisée, module et scénario : [...]
- Services existants, frontières et endpoints sous /api : [...]
- Types/contrats métier proposés, sans les présenter comme existants : [...]

## Checklist adaptée au besoin

- [ ] Nouvelle migration Flyway, contraintes/FK/unicité ; anciennes migrations conservées.
- [ ] BigDecimal/NUMERIC, précision/échelle/arrondis justifiés ; concurrence protégée selon le cas.
- [ ] DTO immuables distincts des entités, Bean Validation, aucun secret exposé.
- [ ] Repositories filtrés, pagination bornée, N+1/index traités selon les lectures réelles.
- [ ] Compte/session → attribution → action → périmètre lié → SoD/contexte → métier.
- [ ] Clock UTC ; test à la borne de fin, accès permanents préservés ; compte désactivé distinct de l’accès expiré.
- [ ] Blocage métier Karim : aucune correction de rôle.
- [ ] Réception/stock/statut atomiques ; erreurs de flush/commit et concurrence prises en compte.
- [ ] Audit SUCCESS lié au commit métier ; refus durable après rollback.
- [ ] Si REQUIRES_NEW : appel via proxy, pas self-invocation ; pas de FK vers données non committées ; pool/coût/échec documentés et testés.
- [ ] Contrôleur fin, CSRF conservée, ProblemDetail/codes cohérents, aucun compte généré.
- [ ] Tests PostgreSQL nominaux/refus/statut/SoD/temps/révocation/atomicité/concurrence/audit selon le scénario.
- [ ] Tests réellement exécutés, limites signalées, diff et docs/todo revus.

## Preuves de livraison

Commandes exécutées, résultats, état persistant lu après commit/rollback, limites non vérifiées : [...]

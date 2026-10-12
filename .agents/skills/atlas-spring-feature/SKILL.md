---
name: atlas-spring-feature
description: "Concevoir ou implémenter une fonctionnalité backend Atlas en Java 21/Spring Boot : API, migrations, contrôles d’accès, transactions et tests PostgreSQL. Utiliser pour une évolution Spring autorisée ; pas pour une revue React ni pour démarrer une phase non demandée."
---

# Fonctionnalité Spring Atlas

Lire [AGENTS.md](../../../AGENTS.md), les sections utiles des [Tech Rules](../../../docs/TECH_RULES-stack-codex.md) et les [frontières du bootstrap](../../../docs/architecture-t01.md). La stack réelle est définie par backend/pom.xml : Java 21, Spring Boot 3.5.16, Maven Wrapper, Web/Security/Validation/JPA, PostgreSQL/Flyway. Les packages partent de `ma.atlas.erp`, les API de `/api` (pas de `/api/v1` imposé).

## Workflow

1. Cadrer module, scénario et phase autorisée ; inspecter les services existants avant création. Aucun modèle/composant métier ajouté sous prétexte de suivre un exemple.
2. Modéliser les données utiles seulement : migration Flyway nouvelle, contraintes/FK/unicité, BigDecimal/NUMERIC et arrondi justifié ; précision et versionnement selon les besoins. Ne pas réécrire V1 ni imposer NUMERIC(15,2), HALF_UP ou @Version à toute table sans décision métier.
3. Séparer DTO et entités ; Bean Validation serveur. Contrôleur fin, repository filtré et pagination bornée ; prévenir N+1 selon les lectures réelles, index selon les usages.
4. Appliquer les six contrôles du [pipeline](references/security-pipeline.md) au périmètre réellement stocké, avec action et portée dans une même permission. Clock injectable, validité UTC [début, fin), expiration d’accès distincte du compte désactivé.
5. Protéger transitions/concurrence et faire les mises à jour liées dans **une transaction** ; voir [réception atomique et tests](references/backend-architecture-rules.md). Ne jamais utiliser REQUIRES_NEW pour séparer réception et stock.
6. Audit : SUCCESS dans la transaction métier (ou outbox transactionnelle traitée après commit). Refus durable via un mécanisme indépendant réellement testé. REQUIRES_NEW est une option avec limites de proxy, isolation, références non committées et pool ; lire le pipeline avant choix. Ne pas journaliser un succès qui pourrait être rollbacké.
7. Réutiliser le format ProblemDetail et codes stables du socle ; distinguer 401/403/SoD/blocage métier/concurrence sans détails sensibles. Garder CSRF ; aucune permission globale ni compte de développement applicatif.
8. Exécuter JUnit/PostgreSQL Testcontainers si Docker fonctionne réellement. Ne pas ignorer les tests ou substituer H2 si indisponible ; documenter le blocage. Tester selon le scénario autorisation, périmètres, SoD, état métier, expiration/révocation, concurrence, atomicité et survie de l’audit.
9. Revoir diff, preuves et documentation ; compléter le [gabarit](templates/spring-feature-checklist.template.md). Ne pas revendiquer un test métier sur la seule réussite des tests T01.

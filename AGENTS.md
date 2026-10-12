# Atlas ERP Lab — Instructions du dépôt

## Objectif et phase actuelle

Laboratoire pédagogique inspiré de SAP pour Atlas Distribution Maroc (AD01, MAD, Casablanca/Rabat). Ne pas le présenter comme SAP réel ou une configuration IBM.

**T01 terminé. Phase actuelle : intégration et préparation des skills avant T02.**
Ne pas commencer T02, créer les comptes/sessions, transactions métier ou moteur d’autorisation sans nouvelle instruction. Les cinq pages restent « Module en préparation ».

## Travail et sources

- Répondre en français, expliquer les décisions utiles et aller jusqu’au résultat vérifiable.
- Préserver fichiers, modifications utilisateur et volumes ; ne jamais supprimer les données pour dépanner.
- Travailler sur une branche de tâche. Push/PR uniquement si autorisés ; aucune modification directe de main, fusion ou déploiement sans instruction explicite.
- Signaler les contradictions de périmètre/sécurité. Ne revendiquer que les validations exécutées.
- Lire selon la tâche : [PRD](docs/PRD-atlas-erp-lab.md), [Design](docs/DESIGN-portails-metier-security.md), [Tech Rules](docs/TECH_RULES-stack-codex.md), [Libraries](docs/bibliotheques-ui-analyse-selection.md), [todo](docs/todo-developpement-fonctionnalites.md).
- Les [règles détaillées](docs/project-rules.md) conservent les contraintes métier/SAP, gouvernance, données et audit ; les consulter pour le scénario concerné.

## Stack et architecture

- React 19, TypeScript strict, Vite, React Router, MUI Core/Emotion ; versions exactes dans frontend/package.json et le lockfile. Pas de bibliothèque 3D/animation supplémentaire ni de MUI Pro/Premium implicite.
- Java 21, Spring Boot 3.5.16, Maven Wrapper 3.9.11, Web/Security/Validation/JPA, PostgreSQL/Flyway. Pas de remplacement par H2.
- Monolithe modulaire `ma.atlas.erp` : identity, security, governance, audit, mm, fi, sd, co ; bootstrap pour la disponibilité technique. Voir [frontières T01](docs/architecture-t01.md).
- Contrôleurs fins, services métier explicites, DTO distincts des entités ; aucune dépendance circulaire ni abstraction prématurée.
- Ne pas modifier une migration déjà appliquée. BigDecimal/NUMERIC, arrondis documentés, contraintes et transactions atomiques adaptées ; index selon les usages.

## Sécurité et scénarios

- Refus par défaut côté backend ; jamais de permitAll global. GET /api/health seul endpoint public en T01. CSRF conservée, aucun compte Spring généré ni login fictif.
- Sessions serveur prévues en T02 : cookies HttpOnly, Secure sous HTTPS, SameSite approprié ; aucun secret de session en localStorage.
- Distinguer compte, rôle, permission (action ET périmètre liés) et attribution datée. Un rôle Security ne donne pas les droits métier.
- Contrôler : compte/session → attribution valide → action → périmètre réel stocké → SoD/contexte → conditions métier. Filtrer listes, détails, recherches et exports côté serveur.
- Attribution expirée : seul cet accès disparaît. Compte désactivé/départ : compte inutilisable et sessions révoquées ; conserver l’historique. Clock injectable, instants UTC, validité [début, fin).
- Refus d’autorisation, conflit SoD et blocage métier sont distincts. **Karim ne reçoit pas une correction de rôle si seule l’approbation de la commande manque.** Interdire l’auto-approbation ; aucune approbation ne contourne une SoD bloquante.
- Réception/stock atomiques, paiement simulé unique ; pas de banque réelle. Préserver l’audit des refus au rollback sans annoncer un succès avant commit ; voir le skill Spring pour les limites transactionnelles.
- Erreurs API ProblemDetail avec codes stables, sans trace ni secret. Interface française, accessible, états réels et reduced motion.

## Skills

Skills versionnés dans `.agents/skills/`. Lire [docs/skills.md](docs/skills.md) pour déclenchements, provenance, commandes et limites.

- `atlas-security-scenario` : cadrer une mission Security et sa matrice de tests.
- `atlas-spring-feature` : réaliser une fonctionnalité Spring autorisée, avec contrôles, atomicité et tests PostgreSQL.
- `playwright` : piloter un navigateur réel via CLI ; vérifier npx ET lancement navigateur avant usage. Les tests @playwright/test existants restent la régression du projet.
- `security-best-practices` : demande explicite de sécurité **React/TypeScript**, pas Java/Spring.
- `security-threat-model` : demande explicite de modèle de menaces ; valider le contexte avant rapport final.

Installer/prendre à jour un skill externe seulement après revue des instructions, scripts, références et licences ; examiner les différences avant remplacement. Ne pas traiter l’installation comme preuve de découverte automatique ou d’efficacité du skill.

## Vérifications et commandes

- `frontend/` : `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
- `backend/` : JDK 21 + Docker, `./mvnw -B verify` (`.\mvnw.cmd -B verify` sous PowerShell). Tests JUnit/PostgreSQL Testcontainers sans skip silencieux.
- Racine : `docker compose config --quiet`, `docker compose up --build -d --wait --wait-timeout 180`. Conserver les volumes.
- [README](README.md) : variables, prérequis réels, proxy/JDK Cloud et Windows. Tests significatifs : droits/périmètres, statuts/SoD, expiration/révocation, atomicité/concurrence et audit selon la fonctionnalité.
- Revoir le diff, mettre à jour uniquement la tâche concernée dans todo et documenter preuves/limites.

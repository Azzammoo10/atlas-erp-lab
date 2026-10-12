# Tech Rules — Stack et règles Codex

## Stack retenue

### Frontend

- React
- TypeScript strict
- Vite
- React Router
- Material UI / Emotion
- Data Grid Community
- TanStack Query recommandé pour l’état serveur
- React Hook Form / Zod si formulaire complexe
- Motion optionnel, non installé par défaut

### Backend

- Java 21
- Spring Boot stable compatible choisi au bootstrap
- Maven Wrapper
- Spring Security
- Bean Validation
- Spring Data JPA
- PostgreSQL
- Flyway

### Infrastructure et tests

- Docker Compose
- JUnit
- Testcontainers
- Playwright

### Gestion des versions

- Versions fixées et lockfiles.
- Ne pas passer automatiquement à `latest`.

## Architecture

Monolithe modulaire avec les modules suivants :

- `identity`
- `security`
- `governance`
- `audit`
- `mm`
- `fi`
- `sd`
- `co`

Organisation par fonctionnalité :

- Contrôleurs fins
- Services métier
- Repositories
- DTO séparés des entités

Éviter les dépendances circulaires et les couches génériques sans besoin.

## Sessions et droits

### Sessions

- Sessions serveur.
- Cookies `HttpOnly`.
- Cookies `Secure` sous HTTPS.
- `SameSite` approprié.
- CSRF maintenue.

### Contrôle d’accès

- Refus par défaut.
- Vérifier successivement :
  - Compte
  - Session
  - Validité de l’attribution
  - Action
  - Périmètre
  - SoD
  - Conditions métier
- Filtrer également la recherche, les listes, les détails et les exports.
- Utiliser le périmètre du document stocké, pas une valeur client non fiable.

### Temps et révocation

- Clock injectable.
- Stockage UTC.
- Bornes de validité explicites.
- Révocation vérifiée à la prochaine requête.
- Pas de cache de droits sans invalidation testée.

## Données et transactions

- `BigDecimal` / `NUMERIC` pour l’argent.
- Arrondi explicite.
- Contraintes `FK`, `UNIQUE` et `CHECK`.
- Verrouillage optimiste.
- Transitions concurrentes protégées.
- Réception et stock atomiques.
- Paiement unique.
- Opérations critiques résistantes aux répétitions.
- Ne pas effacer l’historique.

### Flyway

- Migrations versionnées.
- Migrations non réécrites après application.

### Audit

- Les refus doivent survivre à l’annulation de la transaction métier via un mécanisme testé.

## API

- REST sous `/api`.
- DTO validés côté serveur.
- Erreurs `ProblemDetail` avec codes stables.
- `401` pour non connecté.
- `403` pour refus.
- Blocages métier distincts.
- Pagination et tailles maximales côté serveur.
- OpenAPI comme référence.
- Client TypeScript généré à évaluer pour éviter les duplications.

## Performance

- Mesurer avant d’optimiser.
- Documenter le dataset, la machine et la concurrence.
- Mesurer le p95 hors démarrage.
- Fixer un budget chiffré après la première mesure.
- Pagination.
- Index selon les filtres réels.
- Inspection des problèmes N+1.
- Chargement par route si utile.
- Aucune promesse de performance liée au nombre de lignes ou de skills.

## Skills et documentation

- `AGENTS.md` court et spécifique.
- `PRD` décrit le produit.
- `Design` décrit les interactions.
- `Tech Rules` décrit les contraintes.
- `todo` décrit l’ordre d’exécution.
- Charger seulement les références pertinentes.
- Playwright pour le navigateur.
- `security-best-practices` pour React/TypeScript, pas Java.
- `threat-model` après le socle.
- Skills personnalisés `atlas-security-scenario` et `atlas-spring-feature` à créer et tester.
- Aucun skill installé par ce dossier.

## Workflow

Une tâche verticale suit ce parcours :

```text
Données / API / UI / Contrôles / Tests
→ Vérification navigateur
→ Revue diff
→ Commit
```

- Réutiliser les composants et fonctions communes.
- Éviter les abstractions prématurées.
- Tests significatifs pour :
  - Autorisations
  - Périmètres
  - SoD
  - Concurrence
  - Expiration
  - Révocation
- Les tests frontend ne remplacent pas les tests API.

## Références

- [Spring Security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html)
- [PostgreSQL transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [MUI Data Grid](https://mui.com/x/react-data-grid/)
- [Motion accessibility](https://motion.dev/docs/react-accessibility)
- [Codex skills](https://learn.chatgpt.com/docs/build-skills)
- [Instructions ciblées](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)

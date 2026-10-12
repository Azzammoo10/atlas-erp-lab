# Architecture du socle T01

Monolithe modulaire Java sous `ma.atlas.erp`, organisé par fonctionnalités.
Les `package-info.java` matérialisent les frontières sans interfaces ni services vides.

| Module | Responsabilité future | Frontière |
|---|---|---|
| identity | Comptes, authentification, sessions | Fournit l’identité utilisable ; configuration HTTP de sécurité initiale en T01. |
| security | Rôles, permissions, périmètres, attributions | Évalue les droits ; aucun droit métier implicite pour Security. |
| governance | Demandes, approbations, SoD, revues | Orchestre les décisions, sans modifier directement les tables métier. |
| audit | Événements et preuves | Conservation et lecture protégée ; diagnostics réservés aux habilités. |
| mm | Achats et stocks | Possède commandes, réceptions et stocks. |
| fi | Factures et paiements simulés | Possède factures et paiements ; référence les documents MM/SD. |
| sd | Ventes, livraisons, facturation | Possède le cycle de vente ; pas de dépendance circulaire avec FI. |
| co | Coûts et budgets | Possède centres/budgets et consomme les dépenses explicites. |
| bootstrap | Disponibilité et erreurs techniques | Aucun modèle métier ; seul contrôleur public initial. |

Les futurs échanges passent par des services explicites et des identifiants/DTO ; pas d’accès croisé aux repositories ni d’entités exposées par REST. Ces contrats seront créés quand un scénario les nécessite.

## Migration et disponibilité

`V1__bootstrap_metadata.sql` crée une table technique singleton avec l’instant UTC d’initialisation. Elle prouve le passage de Flyway sur PostgreSQL sans précharger utilisateurs, permissions ni modèle métier. Ne jamais réécrire cette migration après application.

`GET /api/health` exécute une lecture de ce marqueur et renvoie `{"status":"UP"}`. Le démarrage échoue si Flyway/la connexion échoue. Une indisponibilité de la base pendant le fonctionnement produit un ProblemDetail HTTP 503 générique. Aucun endpoint Actuator/administratif n’est installé.

## Sécurité provisoire

Seul GET `/api/health` est public. Les autres routes `/api/**` nécessitent une authentification ; les autres chemins sont refusés. `/api/mm` sert de sonde de protection dans les tests, sans endpoint métier artificiel. Aucune méthode de connexion n’est active et l’auto-configuration du compte Spring généré est exclue. Les utilisateurs injectés par les tests restent uniquement dans les tests. T02 réalisera les sessions et le login/logout.

CSRF reste active, y compris pour les requêtes mutantes authentifiées. Les cookies de session sont HttpOnly et SameSite=Lax ; `SESSION_COOKIE_SECURE=true` sera requis sous HTTPS. Pas de secret dans localStorage ni de connexion simulée.

Erreurs : `application/problem+json`, statut HTTP, titre, détail générique et `code` stable (`AUTHENTICATION_REQUIRED`, `ACCESS_DENIED`, `INVALID_REQUEST`, `NOT_FOUND`, `SERVICE_UNAVAILABLE`). Les erreurs Spring MVC utilisent aussi ProblemDetail. Aucune stack trace ou donnée sensible dans la réponse.

## Interface et dépendances

Thème MUI conforme à la palette Design ; navigation clavier, états réels de disponibilité, reduced motion. React Router couvre accueil/MM/FI/SD/CO/Security, avec la mention « Module en préparation ». Le client API centralisé valide la réponse et limite l’attente à huit secondes.

Data Grid, TanStack Query, React Hook Form et Zod restent prévus selon les futurs besoins ; T01 ne comporte ni table métier ni formulaire et ne les installe pas. Aucun moteur d’animation ajouté. Licence des composants installés : React, Router, MUI Core et Emotion MIT ; aucune fonctionnalité Pro/Premium.

## Versions fixées

Java 21 ; Spring Boot 3.5.16 (BOM pour Spring Security, JPA, Flyway et pilote PostgreSQL) ; Maven 3.9.11 / Wrapper 3.3.4 ; Testcontainers 1.21.3. React 19.1.1, TypeScript 5.9.2, Vite 7.3.7, Router 7.18.4, MUI 7.3.2, Emotion 11.14.0/11.14.1, Playwright 1.55.1. `package-lock.json` fixe l’arbre npm. Images à tags explicites : Node 24.9.0, Temurin 21.0.8_9, PostgreSQL 17.6, nginx 1.28.0. Les tags fixent les versions mais restent remplaçables côté registre ; un pin de digest peut renforcer cette reproductibilité.

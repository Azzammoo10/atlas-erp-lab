# Preuves de livraison T01

Vérifications exécutées le **12 octobre 2026** dans Codex Cloud, à la racine `/workspace/atlas-erp-lab`, sur la branche `task/t01-bootstrap`. Base du dépôt distant : `4a8aad4d40ec9133e10108953427c324561c24f5` (`main`). Aucun fichier utilisateur non committé n’était présent après récupération. Les documents PRD, Design, Tech Rules, Libraries et todo ainsi que AGENTS.md ont été lus ; aucune contradiction de périmètre T01 détectée. Le README initial était un titre encodé UTF-16 ; il a été remplacé par les instructions UTF-8.

## Environnement observé

- Git 2.52.0 ; Node 24.19.0 ; npm 11.9.0.
- Java système : JRE 21.0.12.1, sans javac. JDK Temurin **21.0.8+9** extrait de l’image versionnée dans `/tmp/atlas-jdk21` pour les commandes locales ; aucun JDK ajouté au dépôt.
- Maven **3.9.11**, lancé par le Wrapper **3.3.4** officiel, distribution zip avec SHA-256 fixé.
- Docker client/daemon **28.4.0**, Compose **2.40.3**. Le socket échouait dans le sandbox initial ; l’accès d’exécution autorisé a permis de confirmer que le daemon était réellement fonctionnel.
- PostgreSQL **17.6**, via Docker et via Testcontainers. Pas de serveur PostgreSQL initialement installé, aucune substitution H2.
- Chromium système utilisé par Playwright **1.55.1**. Vues bureau 1366×960 et mobile 390×844 inspectées ; aucun débordement horizontal sur mobile.

## Vérifications réussies

| Vérification exécutée | Résultat |
|---|---|
| Génération `package-lock.json`, puis `npm ci` | Installation reproductible ; versions directes exactes. |
| `npm run lint`, `npm run typecheck`, `npm run build` | Réussis sur le frontend final ; TypeScript strict. |
| `npm audit --audit-level=moderate` | **0 vulnérabilité signalée** au moment du contrôle. Les versions initiales de Router/Vite/typescript-eslint ont été corrigées avant livraison. Ce contrôle ne constitue pas un audit de sécurité complet. |
| Wrapper `-B verify` avec JDK 21 | **BUILD SUCCESS**, jar Spring Boot exécutable créé. |
| JUnit + Testcontainers PostgreSQL | **4 tests, 0 échec, 0 erreur, 0 ignoré**. |
| PostgreSQL/Flyway | Migration V1 appliquée, ligne technique présente ; lecture SQL directe via psql confirmée. |
| Mode A : PostgreSQL Docker + backend Wrapper local + Vite local | Démarrage réel, `GET /api/health` → **200**, `{"status":"UP"}`. |
| Refus anonyme réel | `GET /api/mm` → **401**, `application/problem+json`, code `AUTHENTICATION_REQUIRED`. |
| CSRF | Test d’un POST authentifié sans token → **403**, code `ACCESS_DENIED`. Aucun utilisateur de test dans le runtime. |
| Indisponibilité des données | Test sur la base PostgreSQL isolée : marqueur indisponible → **503**, code `SERVICE_UNAVAILABLE`, sans trace exposée. |
| `docker compose config --quiet` | Réussi sur le fichier final. |
| Dockerfiles | Images frontend et backend construites avec le secret temporaire du certificat proxy Cloud ; aucune désactivation TLS. |
| Mode B : `docker compose up -d --wait --wait-timeout 180` | PostgreSQL, backend et frontend tous **healthy**. |
| nginx /api | Health **200** et API protégée **401**, via http://localhost:8081. |
| Volume existant après démarrage complet et recréation des conteneurs | Marqueur conservé, une seule migration réussie ; Flyway « Schema public is up to date ». Aucune suppression de volume. |
| Playwright mode A | **2 tests réussis** : backend réel/navigation/rechargement des cinq routes ; chargement/erreur/réessai. |
| Playwright mode B (nginx) | Les mêmes **2 tests réussis**, sur le build de production et le routage réel. |
| Inspection visuelle bureau/mobile | Thème MUI, statuts textuels et navigation lisibles ; modules explicitement en préparation. |
| Revue Git | `git diff --check` réussi ; .env, node_modules, target, dist et résultats navigateur exclus de Git. |

Les healthchecks locaux utilisent explicitement localhost sans proxy sortant : BusyBox wget ignorait le bypass NO_PROXY de l’environnement, ce qui produisait un faux échec 403. `wget -Y off` est limité à la sonde sur `127.0.0.1` ; les téléchargements restent soumis au proxy et à TLS.

## Commandes Cloud utilisées

Configuration JDK/proxy/certificat : voir README (fichiers temporaires hors Git).

```bash
# Depuis la racine, JAVA_HOME/MAVEN_OPTS et DB_* exportés selon README :
./backend/mvnw -f backend/pom.xml -s /tmp/atlas-maven-settings.xml -B verify
./backend/mvnw -f backend/pom.xml -s /tmp/atlas-maven-settings.xml spring-boot:run
# Dans frontend/ :
npm ci
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
# À la racine, après arrêt du backend local :
docker compose -f compose.yaml -f /tmp/atlas-cloud-compose.yaml build
docker compose config --quiet
docker compose up -d --wait --wait-timeout 180
# Dans frontend/ :
E2E_BASE_URL=http://127.0.0.1:8081 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

## Limites et suite

**Aucune vérification d’intégration T01 bloquée** dans cet environnement après configuration des permissions/JDK/proxy. Le lancement Docker a effectivement été exécuté.

- La CI GitHub est préparée, mais n’a pas été exécutée sur GitHub : aucun push n’a été effectué, conformément à la demande.
- Les commandes PowerShell sont documentées ; Windows/PowerShell n’est pas disponible ici et leur exécution sur le PC reste à confirmer.
- Les versions d’images sont fixées par tags, pas par digests ; les registres peuvent remplacer le contenu d’un tag. Aucun audit complet des images n’est revendiqué.
- Les captures ont été examinées dans les fichiers temporaires `/tmp/atlas-t01-desktop.png` et `/tmp/atlas-t01-mobile.png` ; aucune donnée métier ou identité réelle.
- Aucun compte applicatif, login simulé, transaction métier ni moteur d’autorisation complet. Aucune exposition Actuator/administrative.
- **T02** : comptes fictifs, authentification serveur par sessions, login/logout, CSRF utilisable côté frontend, verrouillage et révocation.

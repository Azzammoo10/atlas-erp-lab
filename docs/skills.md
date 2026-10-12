# Skills Atlas — intégration avant T02

## Installation et découverte

Les cinq skills sont versionnés dans `.agents/skills/` à la racine réelle du dépôt. Aucun skill personnel/système n’a été remplacé ; aucun des cinq noms n’a été trouvé dans les emplacements personnels/administrateur examinés. Les deux skills Atlas viennent de `feature/agent-skills`, commit **efccdf6de813502896a032bf411f6f9d086dc028**, intégré au bootstrap **ae597ec0a17dd07bc130359262297220b28383f9**. Le conflit add/add de `.gitignore` conserve **toutes** les exclusions du bootstrap et celle du document externe ; les artefacts navigateur sont ignorés également.

Documentation officielle consultée le **12 octobre 2026** : [Build skills](https://learn.chatgpt.com/docs/build-skills) (l’ancienne URL `developers.openai.com/codex/skills/` y redirige). Codex découvre les dossiers `.agents/skills` entre le répertoire courant et la racine Git. Le frontmatter doit définir `name` et `description` ; le nom/description sont chargés avant le corps. Dans CLI/IDE, `$nom-du-skill` ou `/skills` permet une invocation explicite ; l’invocation implicite dépend de la description. L’interface ChatGPT actuelle propose aussi `@`. Une mise à jour peut nécessiter le redémarrage du client si elle n’apparaît pas.

**Installation sur disque validée, découverte effective dans ce chat non confirmée.** Le client CLI 0.159.2 a été testé pour `skills/list` via app-server : démarrage bloqué par le stockage d’état Codex en lecture seule. Une tentative avec l’option officielle `sqlite_home` dans `/tmp` échoue encore sur une autre écriture en lecture seule. Aucun état protégé ni variable HOME/CODEX_HOME n’a été remplacé. Après ouverture/rechargement du dépôt dans un client compatible, vérifier les cinq noms dans son sélecteur ; ne pas confondre copie des fichiers, découverte et activation réussie.

## Rôles, déclenchements et exemples

| Skill | Quand le déclencher | Exemple d’invocation CLI/IDE | Limite |
|---|---|---|---|
| [atlas-security-scenario](../.agents/skills/atlas-security-scenario/SKILL.md) | Cadrer/modifier mission Security, permissions/périmètres, attribution, règle SoD ou critères de preuve. | `$atlas-security-scenario Cadre le refus métier de Karim sur une commande DRAFT à Casablanca, sans implémenter la mission.` | Ne lance pas T02/MM ; distingue accès et conditions métier. |
| [atlas-spring-feature](../.agents/skills/atlas-spring-feature/SKILL.md) | Évolution Spring explicitement autorisée : migration, service, API, contrôle, transaction, test PostgreSQL. | `$atlas-spring-feature Prépare le plan de réception atomique et ses tests PostgreSQL, sans ajouter le code métier.` | Java/Spring ; respecte le périmètre de la tâche, pas de classes vides ni schema prématuré. |
| [playwright](../.agents/skills/playwright/SKILL.md) | Piloter un vrai navigateur en terminal : navigation, snapshot, capture, diagnostic UI. | `$playwright Vérifie l’accueil et la navigation MM sur le Compose local en mode headless.` | CLI-first ; npx **et** lancement réel requis. Ne remplace pas la suite @playwright/test existante. |
| [security-best-practices](../.agents/skills/security-best-practices/SKILL.md) | Demande explicite de revue sécurité, bonnes pratiques ou codage sécurisé dans les langages supportés. | `$security-best-practices Revois uniquement frontend/src en React/TypeScript, avec preuves et sans modifier le backend.` | **React/JavaScript/TypeScript couvert ; Java/Spring non couvert.** Ne déclenche pas une revue de sécurité sur une simple demande de lint/build. |
| [security-threat-model](../.agents/skills/security-threat-model/SKILL.md) | Demande explicite de modèle de menaces, frontières de confiance ou chemins d’abus. | `$security-threat-model Prépare le modèle de menaces du socle T01 ; distingue runtime et CI et valide le contexte avant le rapport.` | Méthode indépendante du langage, pas un audit spécifique Java. Demande de clarification des hypothèses avant rapport final. |

Ces exemples décrivent le déclenchement attendu après découverte. Aucun test automatique du choix implicite par le modèle n’a été exécuté. L’invocation des deux skills sécurité ci-dessus n’a pas produit un audit ni un modèle de menaces dans cette tâche d’installation.

## Revue des skills Atlas

Frontmatters YAML valides ; noms conformes aux dossiers, descriptions avec périmètre et exclusions. Les liens relatifs originaux vers les documents étaient corrects ; les nouveaux liens et gabarits ont aussi été résolus sur disque. Le code T01 utilise `ma.atlas.erp`, Java 21 et Spring Boot 3.5.16 ; les anciennes instructions `com.atlas.erp` et `/api/v1` imposé ont été corrigées. Les spécifications de montants/arrondis/index/verrouillage deviennent des décisions adaptées au besoin, pas des règles métier inventées.

Les règles détaillées de l’ancien AGENTS.md sont conservées dans [project-rules.md](project-rules.md). AGENTS.md reste une entrée courte, avec la phase « intégration/préparation avant T02 ». Les skills ne donnent aucune autorisation de lancer les prochaines phases.

### Karim : droit présent, commande non approuvée

Karim a RECEIVE/Casablanca avec compte, session et attribution valides. La commande Casablanca est DRAFT : seuls les prérequis métier échouent. Le scénario proposé retourne un blocage métier distinct (ex. 422 BUSINESS_STATUS_INVALID), sans réception/stock modifiés et **sans correction de rôle, attribution ou périmètre**. Le processus métier fait approuver la commande par un acteur distinct ; les mêmes droits de Karim suffisent ensuite. Une commande Rabat sans droit Rabat est, au contraire, un problème de périmètre. Voir [exemple](../.agents/skills/atlas-security-scenario/references/authorization-model.md).

### Expiration d’attribution et désactivation

À la borne de fin de l’attribution temporaire Rabat de Karim, Rabat est refusé mais Casablanca reste permis et son compte/session actifs. Lors du départ d’Adam, le compte devient inutilisable et les anciennes sessions sont révoquées, même si une attribution a encore une période valide. Tester avec Clock UTC avant et à la borne [début, fin), sans attente réelle. Conserver l’historique ; aucune purge d’audit pour rejouer une mission.

### Réception atomique et preuves attendues

Le [pseudocode Spring](../.agents/skills/atlas-spring-feature/references/backend-architecture-rules.md) met réception, variations de stock, statut et audit SUCCESS dans une même transaction. Les tests prévus couvrent nominal après commit, PO DRAFT sans correction de droits, échec stock après écriture de réception, échec au flush/commit, concurrence sans double réception et refus de périmètre. Les lectures de preuve sont indépendantes, sans transaction de test englobante masquant le commit. **Exemple revu, pas implémenté ni exécuté** : aucune réception métier n’existe dans T01.

### REQUIRES_NEW : limites explicites

Le [guide d’audit](../.agents/skills/atlas-spring-feature/references/security-pipeline.md) réserve une transaction indépendante à un refus/échec qui doit survivre au rollback. Les succès restent liés au commit métier, ou à une outbox transactionnelle durable. Limites :

- Interception par proxy Spring, bean injecté et méthode proxifiable ; un appel interne `this.method()` ou une instance créée avec `new` ne déclenche pas la propagation.
- Transaction/connexion supplémentaire ; suspension de l’extérieur, coût de commit/I/O et risque de saturation du pool/attente sous concurrence.
- L’audit ne voit pas les données extérieures non committées. Une FK vers un acteur/document créé dans cette transaction peut bloquer ou échouer ; préférer des références déjà committées ou un snapshot/corrélation adapté, sans transférer une entité attachée.
- REQUIRES_NEW n’est pas une garantie de persistance en cas d’erreur DB ou crash ; définir la politique d’échec/reprise, tester les commits/rollbacks réels. Un simple événement afterCommit sans stockage durable ne remplace pas une outbox.
- Ne pas séparer stock et réception en REQUIRES_NEW. Documenter les exceptions checked et le comportement de rollback choisi.

## Provenance et revue des skills externes

Source officielle demandée : [openai/skills](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431), commit **49f948faa9258a0c61caceaf225e179651397431**. Répertoires : `skills/.curated/playwright`, `skills/.curated/security-best-practices`, `skills/.curated/security-threat-model`.

**Le README de cette source annonce sa dépréciation** au profit de [openai/plugins](https://github.com/openai/plugins). L’intégration garde la provenance explicitement demandée ; aucune migration automatique vers une autre source. Les 27 fichiers des trois bundles ont été conservés, avec SKILL.md, métadonnées agents/openai.yaml, références, assets, script éventuel, licences et NOTICE. Ils correspondent aux fichiers source ; [skills-provenance.json](skills-provenance.json) donne les SHA-256, sans commit de dépendance cachée ni secret. L’attribut de fin de ligne préserve le LICENSE Playwright en CRLF au checkout. Six lignes de documentation upstream contiennent des espaces de fin ; elles sont conservées, les attributs Git limitent cette exception aux références externes, dont l’intégrité est contrôlée par SHA-256.

| Bundle | Revue/prérequis |
|---|---|
| Playwright | Apache-2.0, NOTICE conservé (matériel dérivé Microsoft playwright-cli). Un seul script Bash : vérifie npx, prépare une liste d’arguments et exécute `npx --yes --package @playwright/cli playwright-cli`; pas de commande de suppression ou de téléchargement exécuté avant revue. La CLI peut lancer le navigateur et écrire snapshots/captures/états de session : garder les artefacts hors Git et sans secrets. |
| Security best practices | Apache-2.0, aucune dépendance script/runtime à installer. Références React 19/TS 5 et frontend général compatibles avec la stack. Références Python/Go/autres frameworks conservées comme fichiers upstream mais à ne pas charger pour une tâche Atlas React. Aucun guide Java/Spring livré. Les références ne déclenchent pas une revue générique contre le périmètre explicite du frontmatter. |
| Security threat model | Apache-2.0, pas de script à exécuter. Gabarit de rapport et liste d’actifs/contrôles examinés ; repose sur l’inspection du dépôt (rg) et les hypothèses de contexte validées. Pas de service externe ou scan automatique requis, pas de rapport produit lors de l’installation. |

### Playwright : commande Cloud réellement vérifiée

Node **24.19.0**, npm **11.9.0**, npx/Bash disponibles. CLI résolue lors du contrôle : **@playwright/cli 0.1.22**, licence Apache-2.0, Node >=18 ; dépend de `playwright`/`playwright-core` **1.64.0-alpha-1790635538000**. Ce runtime CLI est séparé de **@playwright/test 1.55.1** fixé dans le frontend. Le wrapper officiel n’épingle pas sa version npm : **le commit du skill est fixé, son runtime CLI dynamique ne l’est pas**. Une future résolution exige une nouvelle revue ; cette tâche ne modifie pas le lockfile applicatif.

Chromium système **154.0.8037.57** lancé avec succès en headless via le wrapper, avec configuration explicite. À la racine (Compose déjà démarré) :

```bash
command -v npx
node --version
npm --version
chromium --version
export PWCLI="$(git rev-parse --show-toplevel)/.agents/skills/playwright/scripts/playwright_cli.sh"
mkdir -p output/playwright/skills-smoke
cd output/playwright/skills-smoke
cat > playwright-cli.json <<'JSON'
{
  "browser": {
    "browserName": "chromium",
    "launchOptions": { "headless": true, "executablePath": "/usr/bin/chromium" },
    "contextOptions": { "viewport": { "width": 1280, "height": 900 } }
  }
}
JSON
bash "$PWCLI" --help
bash "$PWCLI" --session atlas-skills-smoke open http://127.0.0.1:8081 --config playwright-cli.json
bash "$PWCLI" --session atlas-skills-smoke snapshot
# Utiliser uniquement une ref MM du snapshot frais, ex. e12 lors du contrôle :
bash "$PWCLI" --session atlas-skills-smoke click e12
bash "$PWCLI" --session atlas-skills-smoke snapshot
bash "$PWCLI" --session atlas-skills-smoke screenshot
bash "$PWCLI" --session atlas-skills-smoke close
```

Les refs changent entre sessions : relire le snapshot avant click. Dans Cloud, les commandes réseau/socket ont nécessité les permissions d’exécution du runtime ; TLS et le proxy restent actifs. `/usr/bin/chromium` est spécifique à cet environnement. Pas de validation headed/X11, Windows, navigateur téléchargé par la CLI ou serveur distant ; ne pas présenter ces modes comme vérifiés. La seule session créée pour ce contrôle a été fermée.

## Résultats après intégration (12 octobre 2026)

- Cinq frontmatters validés, références/gabarits Atlas résolus ; `agents/openai.yaml` externes parsés et assets présents.
- 27 fichiers externes comparés aux sources, licences conservées ; Bash `bash -n` réussi. Aucun script dans les deux bundles sécurité.
- Revue manuelle des déclenchements et des exemples ci-dessus réussie ; **pas d’évaluation automatique de sélection/réponse d’un modèle**.
- `npm ci`, lint, TypeScript strict et build frontend réussis ; les **2 tests navigateur existants** passent contre Compose réel.
- Maven Wrapper `verify` réussi : **4 tests PostgreSQL, zéro échec/erreur/skip**, jar construit.
- Compose validé ; services healthy, nginx `/api/health` **200 UP**, route `/api/mm` **401**. Volumes conservés.
- CLI Playwright : aide, lancement Chromium, accueil disponible, navigation MM, snapshots, screenshot et fermeture réussis.
- Code/config backend, frontend, Compose et lockfile identiques au bootstrap ; seules instructions/skills, documentation et exclusions d’artefacts changent. T02 n’a pas commencé et reste décoché dans todo.
- Découverte du catalogue par app-server **bloquée** par le filesystem en lecture seule ; sélection/activation dans le client courant non vérifiées.
- CI GitHub, après les pushes, à distinguer de ces validations locales ; son résultat n’est pas présumé réussi. Aucun merge vers main ou déploiement demandé/réalisé.

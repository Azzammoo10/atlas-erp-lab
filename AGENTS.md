# AGENTS.md — Atlas ERP Lab

## Objectif du projet

Atlas ERP Lab est un laboratoire pédagogique fullstack inspiré de SAP.
Il simule une entreprise utilisant MM, FI, SD et CO pour pratiquer les
missions d’un consultant SAP Security junior.

Le portail Security est le cœur du projet :
comptes, rôles, autorisations, périmètres, demandes d’accès, approbations,
diagnostic des refus, séparation des tâches (SoD), revues et audit.

Les opérations métier doivent être fonctionnelles et persistées.
Les fonctionnalités SAP sont des simulations clairement identifiées.
Ne pas présenter le projet comme un système SAP réel, une configuration
interne d’IBM ou une expérience SAP en production.

## Communication et autonomie

- Répondre en français, simplement et au niveau junior.
- Expliquer les décisions techniques importantes et leurs implications.
- Réaliser la tâche demandée jusqu’à un résultat vérifiable.
- Préserver les fichiers existants et les modifications de l’utilisateur.
- Signaler les contradictions qui affectent le périmètre ou la sécurité.
- Ne pas déclarer une vérification réussie si elle n’a pas été exécutée.
- Ne pas pousser, fusionner sur main ou déployer sans instruction explicite.
- Ne pas supprimer les données ou volumes pour résoudre un problème.

## Sources du projet

Rechercher les documents dans docs/ ; leurs noms peuvent varier.

- PRD.md : fonctionnalités, acteurs, scénarios et critères d’acceptation.
- DESIGN.md : écrans, navigation, interactions et accessibilité.
- TECH_RULES.md : architecture et conventions techniques.
- LIBRARIES.md : bibliothèques retenues et exclusions.
- todo.md : tâches et progression.

Lire les documents pertinents pour la tâche.
Ne pas charger systématiquement toute la documentation pour une petite
modification.

Si une décision change, mettre à jour le document concerné.
Ne pas inventer de règle SAP : consulter la documentation officielle
SAP et distinguer son fonctionnement des simplifications du laboratoire.

## Stack retenue

### Frontend

- React, TypeScript strict et Vite.
- React Router.
- Material UI avec Emotion.
- MUI X Data Grid Community si nécessaire.
- TanStack Query pour les données serveur si retenu dans le bootstrap.
- React Hook Form et Zod seulement si utiles aux formulaires.
- CSS et transitions MUI en priorité ; Motion optionnel.

Conserver un système visuel cohérent.
Ne pas ajouter shadcn/ui, une bibliothèque 3D, des particules ou un autre
moteur d’animation sans besoin explicite.

Vérifier les licences : ne pas dépendre implicitement de fonctionnalités
MUI Pro/Premium.

### Backend

- Java 21.
- Spring Boot dans une version stable compatible.
- Maven Wrapper.
- Spring Web, Spring Security et Bean Validation.
- Spring Data JPA.
- PostgreSQL et Flyway.

### Environnement et vérification

- Docker Compose pour le lancement local.
- JUnit et tests d’intégration PostgreSQL.
- Testcontainers lorsque Docker est disponible.
- Playwright pour les parcours navigateur critiques.
- Versions compatibles fixées et lockfiles conservés.

Ne pas changer les versions majeures dans une tâche sans justification.

## Architecture

Utiliser un monolithe modulaire, organisé par fonctionnalité :

- identity : comptes, authentification et sessions.
- security : rôles, autorisations, périmètres et attributions.
- governance : demandes, approbations, SoD et revues.
- audit : événements, diagnostics et preuves.
- mm : achats et stocks.
- fi : factures et paiements simulés.
- sd : ventes, livraisons et facturation.
- co : coûts et budgets.

Conserver des contrôleurs fins et des services métier explicites.
Séparer les DTO des entités persistées exposées.
Éviter les dépendances circulaires et les abstractions prématurées.
Réutiliser les composants existants avant d’en créer de nouveaux.

## Organisation métier

Entreprise : Atlas Distribution Maroc.
Société : AD01.
Devise : MAD.
Sites : Casablanca et Rabat.

Acteurs fictifs :

- Salma : création des commandes d’achat.
- Youssef : approbation des commandes d’achat.
- Karim : opérations de stock à Casablanca.
- Imane : opérations de stock à Rabat.
- Lina : commandes de vente.
- Amine : approbation des remises exceptionnelles.
- Nadia : enregistrement des factures fournisseurs et facturation client.
- Omar : validation des factures, autorisation des paiements simulés
  et approbation des budgets.
- Sara : suivi des coûts et propositions de budgets.
- Mohamed : interventions Security.
- Responsable Security : approbation des changements sensibles.
- Hicham : consultation des preuves et rapports d’audit.
- Adam : employé Rabat utilisé dans les exercices de cycle de vie.

Un rôle Security ne confère pas automatiquement les droits métier.

## Processus métier simplifiés

### MM / FI — Achat

Commande → approbation → réception → facture → validation → paiement simulé.

- Interdire l’auto-approbation.
- Réceptionner uniquement sur le site autorisé.
- Exiger une commande approuvée avant réception.
- Vérifier les liens et la cohérence de la facture.
- Exiger une facture validée avant paiement.
- Empêcher un deuxième paiement du même document.
- Ne réaliser aucun paiement bancaire réel.

### SD — Vente

Commande client → livraison → facturation.

- Une remise supérieure à 5 % nécessite une approbation distincte.
- Le seuil est une règle pédagogique du laboratoire.
- Interdire l’auto-approbation d’une remise.
- Limiter les opérations logistiques au site autorisé.
- Exiger une livraison confirmée avant facturation.

### CO — Budget

Proposition → approbation → suivi.

- Séparer proposition et approbation.
- Restreindre les données aux centres de coûts autorisés.
- Définir explicitement l’origine des dépenses.
- Éviter le double comptage.
- Ne pas traiter une commande seule comme une dépense comptabilisée.

Les traitements partiels et la comptabilité exhaustive sont hors du
premier périmètre.

## Modèle d’autorisation

Distinguer :

- Compte utilisateur : identité et état du compte.
- Rôle : ensemble d’autorisations.
- Autorisation : action et valeurs/périmètres permis.
- Attribution : lien utilisateur-rôle avec validité et justification.
- Périmètre : société, site ou centre de coûts pertinent.

Évaluer les droits cumulés sans combiner accidentellement l’action
d’une autorisation avec le périmètre d’une autre.

Appliquer le moindre privilège et le refus par défaut.

Chaque opération protégée doit vérifier :

1. Compte et session utilisables.
2. Attribution valide.
3. Action autorisée.
4. Périmètre du document.
5. Règles SoD ou interdictions contextuelles applicables.
6. Conditions métier de l’opération.

Le backend est responsable de ces contrôles.
Masquer un bouton n’est jamais une protection suffisante.

Appliquer les restrictions aux listes, recherches, détails et exports.
Utiliser le périmètre réel des données stockées, pas une valeur client
considérée comme fiable.

## Sessions et durée des accès

- Préférer les sessions serveur pour le socle.
- Cookies HttpOnly ; Secure sous HTTPS ; SameSite approprié.
- Maintenir les protections CSRF pour les opérations mutantes.
- Ne pas stocker de secret de session dans localStorage.
- Stocker les instants en UTC et définir les bornes de validité.
- Utiliser une horloge injectable pour tester les expirations.
- Vérifier les révocations et expirations à chaque requête pertinente.
- Ne pas mettre les droits en cache sans invalidation fiable.

L’expiration d’une attribution temporaire ne désactive pas le compte.
Le départ d’un employé nécessite de traiter le compte, les attributions
et les sessions existantes.

## Gouvernance et SoD

Toute attribution sensible doit être liée à un besoin et une approbation.

Analyser les permissions cumulées de tous les rôles et leurs périmètres.

Distinguer :
- conflit d’accès : cumul de fonctions incompatibles ;
- règle contextuelle : interdiction d’approuver son propre document.

Dans le MVP, une approbation métier ne contourne pas une règle SoD
bloquante. Une courte durée ne supprime pas le conflit.

Avant de modifier un rôle partagé, vérifier les utilisateurs affectés.
Ne pas copier aveuglément les droits d’un collègue.

## Simulations SAP

- SU01 : gestion des comptes.
- PFCG : préparation des rôles et autorisations.
- SU53 : diagnostic d’un refus.
- SUIM : recherche des accès et analyse d’impact.

Le vrai SU53 ne constitue pas un journal complet des tentatives.
Nos diagnostics étendus doivent être identifiés comme une fonction du lab.

Ne pas inventer un objet d’autorisation SAP standard pour justifier une
permission personnalisée.

Les simulations de profils générés, comparaison utilisateurs, Fiori/OData,
HANA et SU24/SU25 doivent être cadrées avant implémentation.

Un rôle PFCG n’est pas un rôle de base de données HANA.
Une API REST ordinaire n’est pas automatiquement un service OData.

## Données, transactions et audit

- Utiliser BigDecimal et NUMERIC pour les montants.
- Définir les règles d’arrondi.
- Utiliser contraintes, clés étrangères et unicité appropriées.
- Protéger les modifications concurrentes et transitions de statut.
- Rendre atomiques les mises à jour liées, notamment réception et stock.
- Protéger les opérations critiques contre les répétitions.
- Versionner les migrations Flyway.
- Ne pas réécrire une migration déjà appliquée.

Conserver les événements nécessaires :
acteur, action, document, périmètre, date, résultat, motif et référence
de demande ou ticket.

Les changements d’accès doivent conserver les valeurs avant/après
pertinentes et l’approbation.

L’audit d’un refus doit survivre au rollback métier.
Ne pas journaliser de mots de passe, cookies, tokens ou secrets.
Protéger les diagnostics et preuves contre l’accès non autorisé.
Ne pas supprimer l’historique lors d’un départ.

## API et interface

- API REST sous /api.
- Validation côté serveur obligatoire.
- Format d’erreur cohérent avec codes stables.
- Distinguer authentification, autorisation, SoD et blocage métier.
- Pas de stack trace ou de secret dans les réponses.
- Pagination et limites côté serveur.
- Interface en français, vocabulaire SAP standard si nécessaire.
- États chargement, vide, erreur et succès.
- Navigation clavier, focus visible, labels et contrastes.
- Couleurs accompagnées de texte.
- Animations discrètes et respect de reduced motion.
- Pas de fausse fonctionnalité présentée comme opérationnelle.

## Missions de référence

1. Refus Karim : correction minimale Casablanca approuvée ;
   succès Casablanca et refus Rabat.
2. Arrivée Adam : accès magasinier Rabat validés.
3. Remplacement Karim : accès Rabat temporaire ;
   expiration sans perte de Casablanca.
4. Départ Adam : compte inutilisable, sessions révoquées,
   accès retirés et historique conservé.
5. SoD Nadia : paiement AD01 incompatible avec enregistrement
   des factures selon la règle du lab.
6. Revue : maintien ou retrait approuvé, appliqué et vérifié.

## Performance et simplicité

Mesurer avant d’optimiser.

- Paginer les listes.
- Examiner les requêtes N+1.
- Ajouter les index selon les recherches réellement utilisées.
- Charger les données et routes nécessaires.
- Documenter les conditions des mesures.
- Éviter les dépendances redondantes.

Réduire la duplication sans sacrifier lisibilité, sécurité ou preuves.
Ne pas promettre une performance uniquement parce que le code est court.

## Workflow de développement

Pour chaque tâche :

1. Lire le scénario et ses critères.
2. Inspecter le code et les documents pertinents.
3. Implémenter une fonctionnalité cohérente de bout en bout.
4. Tester les règles concernées.
5. Vérifier le parcours utilisateur si l’interface change.
6. Examiner le diff et mettre à jour la documentation nécessaire.
7. Mettre à jour todo selon les résultats réels.
8. Résumer changements, preuves et limites.

Ne pas développer plusieurs phases sans instruction.
Les skills externes doivent être vérifiés avant installation et utilisés
seulement pour les tâches pertinentes.

## Vérification

Pour toute fonctionnalité Security, couvrir selon le cas :

- accès autorisé ;
- droit absent ;
- mauvais périmètre ;
- document non prêt ;
- auto-approbation ou conflit SoD ;
- accès expiré ;
- compte désactivé et session révoquée ;
- appel direct à l’API ;
- preuves d’audit.

Utiliser PostgreSQL pour les tests d’intégration.
Ne pas remplacer silencieusement PostgreSQL par H2.
Les tests navigateur complètent les tests backend.

Dans Codex Cloud, vérifier les capacités réelles avant de dépendre de
Docker/Testcontainers. Signaler les contrôles bloqués.

## Commandes du projet

Le bootstrap doit documenter et maintenir les commandes exactes :

- frontend : installation, lint, typecheck, tests et build ;
- backend : tests et package avec Maven Wrapper ;
- environnement : validation et lancement Docker Compose.

Vérifier les scripts réellement disponibles dans package.json,
pom.xml et README.md avant d’exécuter une commande.
Fournir les instructions Linux et Windows PowerShell dans le README.

## Phase actuelle

T01 : initialiser et vérifier le socle technique.

Créer les pages MM, FI, SD, CO et Security avec la mention
« Module en préparation ».

Préparer PostgreSQL, Flyway, l’endpoint de disponibilité, la protection
des autres routes, les fichiers Docker et la documentation.

Les fonctionnalités métier et le système complet d’accès commencent
dans les tâches suivantes.
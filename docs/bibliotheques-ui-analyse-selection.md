# Bibliothèques UI — Analyse et sélection

## Décision

Conserver **Material UI / Emotion** et **Data Grid Community**. **Motion** est optionnel, uniquement pour une interaction utile. Pas de moteur 3D, particules ou animation au scroll dans le MVP.

Ces décisions concernent les besoins du produit, pas la qualité intrinsèque des bibliothèques.

## Sélection des bibliothèques

| Bibliothèque | Usage | Décision |
|---|---|---|
| Three.js / R3F / Drei | Scènes 3D et helpers | Hors MVP : aucune opération ERP ne nécessite une scène 3D. |
| React Three Postprocessing | Effets visuels 3D | Hors MVP. |
| React Three Rapier | Physique 3D | Hors MVP. |
| React Three XR | VR/AR | Hors MVP. |
| Babylon.js / react-babylonjs | Moteur 3D et intégration React | Hors MVP. |
| Spline / @splinetool/react-spline | Création et intégration de scènes 3D | Hors MVP. |
| OGL | Bibliothèque WebGL | Hors MVP. |
| GSAP / ScrollTrigger | Animation et séquences au défilement | Hors MVP ; éventuelle page de présentation séparée. |
| Motion (Framer Motion) | Animation d’interface React | Optionnel ; CSS/MUI d’abord, reduced motion respectée. |
| Motion One | Écosystème animation Motion | Ne pas ajouter en parallèle sans vérifier package/API actuels. |
| React Spring / @react-spring/three | Animations par ressorts et 3D | Hors MVP : éviter redondance avec Motion. |
| Lenis | Défilement fluide | Hors MVP ; défilement natif retenu. |
| Theatre.js | Séquences d’animation éditables | Hors MVP. |
| Anime.js | Animation JavaScript | Hors MVP : aucun besoin distinct identifié. |
| React Bits | Composants animés et fonds | Inspiration ponctuelle, pas d’installation initiale. |
| Aceternity UI | Composants React/Tailwind animés | Inspiration pour présentation, hors portail opérationnel. |
| Magic UI | Composants animés | Hors MVP. |
| shadcn/ui | Composants source personnalisables | Alternative à MUI, pas un second système dans le portail. |
| Motion Primitives | Primitives animées | Hors MVP ; documentation à revérifier avant usage. |
| React Parallax Tilt / Vanilla Tilt / Atropos | Inclinaison et parallaxe | Hors MVP. |
| tsParticles | Particules | Hors MVP. |
| Vanta.js | Fonds animés 3D | Hors MVP. |
| Curtains.js | Effets WebGL | Hors MVP. |
| Material UI / Data Grid Community | Formulaires, tables et interactions ERP | Retenu ; vérifier si une fonction exige Pro/Premium. |

## Pour réduire le code

- Réutiliser les composants et services.
- Maintenir un système visuel unique.
- Utiliser les mêmes modèles de formulaires et de gestion des erreurs.
- Ne pas bâtir un générateur de CRUD avant d’avoir des besoins répétés concrets.
- Une bibliothèque peut réduire le code écrit mais augmente les dépendances ; mesurer la performance réelle.

## Règle Codex

Pas d’ajout de bibliothèque sans besoin lié à une tâche et vérification de licence/compatibilité.

Vérifier les composants réellement choisis ; cette analyse n’est pas un audit intégral des projets.

## Références éditeurs

- [MUI](https://mui.com/x/react-data-grid/)
- [Motion](https://motion.dev/docs/react-accessibility)
- [shadcn](https://ui.shadcn.com/docs)
- [R3F](https://r3f.docs.pmnd.rs/)
- [GSAP](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Lenis](https://lenis.dev/)
- [React Spring](https://www.react-spring.dev/)
- [Theatre](https://www.theatrejs.com/docs/latest)
- [Anime](https://animejs.com/documentation/)
- [Babylon](https://doc.babylonjs.com/)
- [Spline](https://docs.spline.design/)
- [OGL](https://github.com/oframe/ogl)
- [React Bits](https://reactbits.dev/)
- [Aceternity](https://ui.aceternity.com/)
- [Magic UI](https://magicui.design/)
- [React Parallax Tilt](https://github.com/mkosir/react-parallax-tilt)
- [Vanilla Tilt](https://micku7zu.github.io/vanilla-tilt.js/)
- [tsParticles](https://particles.js.org/)
- [Vanta](https://www.vantajs.com/)
- [Curtains](https://www.curtainsjs.com/)
- [Atropos](https://atroposjs.com/)

## État

Analyse et cadrage préparés. Dépendances/skills non installés.

Documents locaux à matérialiser :

- [PRD.md](PRD.md)
- [DESIGN.md](DESIGN.md)
- [TECH_RULES.md](TECH_RULES.md)
- [todo.md](todo.md)

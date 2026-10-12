import { useEffect, useState } from 'react';
import { Alert, AppBar, Box, Button, Card, CardContent, CircularProgress, Container, Stack, Toolbar, Typography } from '@mui/material';
import { Link, NavLink, Route, Routes } from 'react-router';
import { fetchHealth } from './api/client';

const modules = [
  { code: 'MM', path: '/mm', label: 'Achats et stocks' },
  { code: 'FI', path: '/fi', label: 'Finance' },
  { code: 'SD', path: '/sd', label: 'Ventes et distribution' },
  { code: 'CO', path: '/co', label: 'Contrôle de gestion' },
  { code: 'Security', path: '/security', label: 'Portail des accès' },
];

type BackendState = 'loading' | 'available' | 'error';

function Home() {
  const [status, setStatus] = useState<BackendState>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    setStatus('loading');
    void fetchHealth(controller.signal)
      .then(() => { if (active) setStatus('available'); })
      .catch(() => { if (active) setStatus('error'); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; window.clearTimeout(timeout); controller.abort(); };
  }, [attempt]);
  return <Stack spacing={3}>
    <Box><Typography variant="overline" color="primary">Socle technique · T01</Typography><Typography variant="h4" component="h1">Bienvenue dans Atlas ERP Lab</Typography></Box>
    <Typography>Un laboratoire pédagogique inspiré de SAP pour Atlas Distribution Maroc. Société AD01 · MAD · Casablanca et Rabat.</Typography>
    <Box aria-live="polite" role="status">
      {status === 'loading' && <Stack direction="row" spacing={2} alignItems="center"><CircularProgress size={22} aria-label="Vérification du backend"/><Typography>Vérification du backend…</Typography></Stack>}
      {status === 'available' && <Alert severity="success">Backend disponible · PostgreSQL et migration vérifiés.</Alert>}
      {status === 'error' && <Alert severity="error" action={<Button color="inherit" onClick={() => setAttempt(value => value + 1)}>Réessayer</Button>}>Backend indisponible. Vérifiez son lancement et la connexion PostgreSQL.</Alert>}
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
      {modules.map(module => <Card key={module.code} variant="outlined"><CardContent><Typography variant="h5" component="h2" color={module.code === 'Security' ? 'secondary' : 'primary'}>{module.code}</Typography><Typography sx={{ my: 1 }}>{module.label}</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Module en préparation</Typography><Button component={Link} to={module.path}>Ouvrir {module.code}</Button></CardContent></Card>)}
    </Box>
  </Stack>;
}

export default function App() {
  return <>
    <Box component="a" href="#main" sx={{ position: 'absolute', top: -100, zIndex: 2000, bgcolor: 'white', p: 2, '&:focus': { top: 0 } }}>Aller au contenu</Box>
    <AppBar position="static" elevation={0}><Toolbar><Typography variant="h6" component="div">Atlas ERP Lab</Typography><Typography sx={{ ml: 'auto' }}>Simulation pédagogique</Typography></Toolbar></AppBar>
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 'calc(100vh - 64px)' }}>
      <Box component="nav" aria-label="Navigation principale" sx={{ width: { md: 230 }, p: 2, bgcolor: 'background.paper', borderRight: '1px solid #dce2ec' }}>
        <Stack spacing={1}>{[{ code: 'Accueil', path: '/' }, ...modules].map(item => <Button key={item.path} component={NavLink} to={item.path} end={item.path === '/'} sx={{ justifyContent: 'flex-start', '&.active': { bgcolor: '#eaf0fa', fontWeight: 700 } }}>{item.code}</Button>)}</Stack>
      </Box>
      <Container component="main" id="main" maxWidth="lg" sx={{ py: 4 }}>
        <Routes><Route path="/" element={<Home/>}/>{modules.map(module => <Route key={module.path} path={module.path} element={<Stack spacing={2}><Typography variant="h4" component="h1">{module.code} — {module.label}</Typography><Alert severity="info">Module en préparation</Alert><Typography>Les fonctionnalités et les contrôles d’accès seront ajoutés dans les prochaines tâches.</Typography></Stack>}/>)}<Route path="*" element={<Stack spacing={2}><Typography variant="h4" component="h1">Page introuvable</Typography><Button component={Link} to="/">Retour à l’accueil</Button></Stack>}/></Routes>
      </Container>
    </Box>
  </>;
}

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: { primary: { main: '#2457A7' }, secondary: { main: '#6D4BA8' }, background: { default: '#F6F8FB' }, text: { primary: '#172B4D' } },
  typography: { fontFamily: '"Segoe UI", Arial, sans-serif', h4: { fontWeight: 700 }, h5: { fontWeight: 650 }, button: { textTransform: 'none' } },
  shape: { borderRadius: 10 },
  components: { MuiButtonBase: { styleOverrides: { root: { '&.Mui-focusVisible': { outline: '3px solid #6D4BA8', outlineOffset: 2 } } } } },
});

import { useState } from "react";
import "./App.css";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Electron + React + MUI
          </Typography>
          <Button
            color="inherit"
            href="https://mui.com"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h4">Hello from MUI v5</Typography>
            <Typography color="text.secondary">
              This Electron app is built with React + TypeScript and styled with
              Material UI.
            </Typography>
            <Button variant="contained" onClick={() => setCount((c) => c + 1)}>
              Count is {count}
            </Button>
            <Typography variant="body2" color="text.secondary">
              Edit <code>src/App.tsx</code> and save to test HMR
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default App;

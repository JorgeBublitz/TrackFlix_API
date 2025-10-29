// src/components/Login.tsx
import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  Link,
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { socket } from "../socket"; // ⚠ ajuste o caminho conforme sua pasta

const linkStyle = {
  color: "primary.main",
  fontWeight: 600,
  fontSize: "0.9rem",
  ml: 0.5,
  "&:hover": {
    color: "primary.dark",
    textDecoration: "underline",
  },
};

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const { accessToken, refreshToken } = data.data;

        // Salva tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        console.log("Login bem-sucedido!");

        // Conecta socket com token
        socket.auth = { token: accessToken };
        socket.connect();

        // Navega para chat após login
        navigate("/chat");
      } else {
        console.error(data.message);
        alert(data.message); // opcional, para feedback ao usuário
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao conectar-se ao servidor.");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ p: 2 }}
    >
      <Paper
        elevation={8}
        sx={{
          borderRadius: 4,
          p: 5,
          width: { xs: "90%", sm: 380 },
          backdropFilter: "blur(20px)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <Box textAlign="center" mb={3}>
          <LoginIcon sx={{ fontSize: 46, color: "primary.main" }} />
          <Typography variant="h5" fontWeight={700} mt={1}>
            Bem-vindo de volta!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Entre com sua conta para continuar
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          autoComplete="off"
        >
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ autoComplete: "off" }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Lembrar-me"
            />
            <Link href="#" underline="none" sx={linkStyle}>
              Esqueceu a senha?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              textTransform: "none",
              transition: "0.3s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            Entrar
          </Button>

          <Typography textAlign="center" mt={3} variant="body2" color="text.secondary">
            Não tem uma conta?
            <Link component={RouterLink} to="/signup" underline="none" sx={linkStyle}>
              Cadastre-se
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;

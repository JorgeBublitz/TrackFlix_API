import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Link,
  CircularProgress,
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/v2/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const { accessToken, refreshToken } = data.data;

        // Armazena os tokens para uso no chat e rotas protegidas
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        console.log("✅ Login bem-sucedido!");
        navigate("/chat");
      } else {
        alert(data.message || "Credenciais inválidas");
      }
    } catch (err) {
      console.error("Erro ao conectar-se:", err);
      alert("Erro ao conectar-se ao servidor.");
    } finally {
      setLoading(false);
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
            name="login_email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputProps={{ autoComplete: "off" }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />

          <TextField
            label="Senha"
            type="password"
            name="login_password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ autoComplete: "new-password" }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
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
            {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
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

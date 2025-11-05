// src/components/SignUp.tsx
import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Paper, Link } from "@mui/material";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const linkStyle = {
  color: "primary.main",
  fontWeight: 600,
  fontSize: "0.9rem",
  ml: 0.5,
  "&:hover": { color: "primary.dark", textDecoration: "underline" },
};

const SignUp: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");
  }, []);

  const handleSignUp = async () => {
    if (password !== confirm) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}api/auth/v2/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok) navigate("/");
      else alert(data.message || "Erro no cadastro");
    } catch (err) {
      console.error("Erro:", err);
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
          <PersonAddIcon sx={{ fontSize: 46, color: "primary.main" }} />
          <Typography variant="h5" fontWeight={700} mt={1}>
            Crie sua conta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            É rápido e fácil ✨
          </Typography>
        </Box>

        <Box
          component="form"
          autoComplete="off"
          display="flex"
          flexDirection="column"
          gap={2}
          onSubmit={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
        >
          <TextField
            label="Nome"
            name="signup_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ autoComplete: "off" }}
          />
          <TextField
            label="Email"
            type="email"
            name="signup_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputProps={{ autoComplete: "off" }}
          />
          <TextField
            label="Senha"
            type="password"
            name="signup_password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ autoComplete: "new-password" }}
          />
          <TextField
            label="Confirmar Senha"
            type="password"
            name="signup_confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            inputProps={{ autoComplete: "new-password" }}
          />

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
            Cadastrar
          </Button>

          <Typography textAlign="center" mt={3} variant="body2" color="text.secondary">
            Já tem uma conta?
            <Link component={RouterLink} to="/" underline="none" sx={linkStyle}>
              Entrar
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignUp;

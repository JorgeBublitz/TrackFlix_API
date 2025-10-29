import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Paper, Link } from "@mui/material";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

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
      const res = await fetch("http://localhost:3000/auth/register", {
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
      sx={{
        p: 2,
      }}
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
          autoComplete="off" // 🔒 Desativa preenchimento automático
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ autoComplete: "off" }} // 🔒
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputProps={{ autoComplete: "off" }} // 🔒
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ autoComplete: "off" }} // 🔒
          />
          <TextField
            label="Confirmar Senha"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            inputProps={{ autoComplete: "off" }} // 🔒
          />
        </Box>

        <Button
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
          onClick={handleSignUp}
        >
          Cadastrar
        </Button>

        <Typography textAlign="center" mt={3} variant="body2" color="text.secondary">
          Já tem uma conta?
          <Link component={RouterLink} to="/" underline="none" sx={linkStyle}>
            Entrar
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignUp;

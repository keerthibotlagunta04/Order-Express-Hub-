import { useState } from "react";
import { Button, TextField, Paper, Typography, Box, styled, InputAdornment } from "@mui/material";
import { Email, Lock, Login, PersonAdd } from "@mui/icons-material";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import { api } from "./axios";
import { useNavigate } from "react-router-dom";

const RootStyle = styled(Box)(() => ({
  minHeight: "100vh",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const PaperStyled = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(3),
  backgroundColor: "rgba(255, 255, 255, 0.8)",
}));

const InputStyled = styled(TextField)({
  width: "100%",
});

const ButtonStyled = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurent, setRestaurent] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await api.post("/login", { email, password, org_name: restaurent });
      if (response.status === 200) {
        const { token, role, user_id } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("user_id", user_id);
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <RootStyle>
      <PaperStyled elevation={10}>
        <Typography variant="h4" gutterBottom>
          Welcome Back!
        </Typography>
        <InputStyled
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
        <InputStyled
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
          }}
        />
        <InputStyled
          label="Restaurent Name"
          type="text"
          variant="outlined"
          value={restaurent}
          onChange={(e) => setRestaurent(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CorporateFareIcon />
              </InputAdornment>
            ),
          }}
        />
        <ButtonStyled color="primary" variant="contained" startIcon={<Login />} onClick={handleLogin}>
          Log In
        </ButtonStyled>
        <ButtonStyled color="secondary" variant="outlined" startIcon={<PersonAdd />} onClick={() => navigate("/signup")}>
          Sign Up
        </ButtonStyled>
      </PaperStyled>
    </RootStyle>
  );
}

export default LoginPage;

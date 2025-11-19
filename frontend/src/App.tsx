import { Routes, Route } from "react-router-dom";
import Login from "./components/login";
import SignUp from "./components/signUp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}

export default App;

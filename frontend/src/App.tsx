import { Routes, Route } from "react-router-dom";
import Login from "./components/login";
import SignUp from "./components/signUp";
import Chat from "./components/Chat";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/chatRoom" element={<Chat />} />
    </Routes>
  );
}

export default App;

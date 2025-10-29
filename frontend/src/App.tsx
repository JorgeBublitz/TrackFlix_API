import { Routes, Route } from 'react-router-dom';
import Login from './components/login';
import SignUp from './components/signUp';
import Chat from './components/chat';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/chat" element={<Chat />} /> {/* rota do chat */}
    </Routes>
  );
}

export default App;

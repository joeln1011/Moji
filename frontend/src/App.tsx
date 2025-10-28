import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'sonner';
import LogInPages from './pages/LogInPages';
import RegisterPage from './pages/RegisterPage';
import ChatAppPage from './pages/ChatAppPage';
function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path="/login" element={<LogInPages />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* protected routes */}
          <Route path="/" element={<ChatAppPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

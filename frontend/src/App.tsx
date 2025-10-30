import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'sonner';
import ChatAppPage from './pages/ChatAppPage';
import SignInPage from './pages/SignInPages';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* protected routes */}
          <Route path="/" element={<ChatAppPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Splash          from './pages/Splash';
import Register        from './pages/register';
import SelectCharacter from './pages/selectcharacter';
import Chat            from './pages/chat';
import Dashboard       from './pages/dashboard';
import ParentControls  from './pages/parentcontrols';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<Splash />}          />
        <Route path="/auth"             element={<Register />}        />
        <Route path="/select-character" element={<SelectCharacter />} />
        <Route path="/chat"             element={<Chat />}            />
        <Route path="/dashboard"        element={<Dashboard />}       />
        <Route path="/parent"           element={<ParentControls />}  />
        <Route path="*"                 element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
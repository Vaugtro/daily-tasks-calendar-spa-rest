import "@/styles/app.css";

import { Route, Routes } from 'react-router-dom';

import TaskPage from "@/pages/TaskPage";
import AuthPage from "@/pages/AuthPage";

import {AuthProvider} from "@/context/auth";

function App() {

  return (
      <AuthProvider>
        <Routes>
          <Route path="/task" element={<TaskPage />} />
          <Route path="/" element={<AuthPage />} />
        </Routes>
      </AuthProvider>
  );
}

export default App;

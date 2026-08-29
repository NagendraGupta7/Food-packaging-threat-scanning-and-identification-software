import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout';
import RequireAuth from './components/RequireAuth';
import Dashboard from './pages/Dashboard';
import NewInspection from './pages/NewInspection';
import InspectionDetails from './pages/InspectionDetails';
import InspectionsList from './pages/InspectionsList';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/inspections" element={<RequireAuth><InspectionsList /></RequireAuth>} />
            <Route path="/inspections/new" element={<RequireAuth><NewInspection /></RequireAuth>} />
            <Route path="/inspections/:id" element={<RequireAuth><InspectionDetails /></RequireAuth>} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

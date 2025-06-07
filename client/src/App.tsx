import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobDescriptions from './pages/JobDescriptions';
import Candidates from './pages/Candidates';
import Analysis from './pages/Analysis';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="jobs" element={<JobDescriptions />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="analysis/:candidateId/:jobId" element={<Analysis />} />
      </Route>
    </Routes>
  );
}

export default App; 
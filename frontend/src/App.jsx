import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CaseList from './pages/CaseList';
import CaseEntry from './pages/CaseEntry';
import CaseResult from './pages/CaseResult';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/cases" replace />} />
          <Route path="/cases" element={<CaseList />} />
          <Route path="/add-case" element={<CaseEntry />} />
          <Route path="/cases/:id" element={<CaseResult />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

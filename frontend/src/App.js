import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ApiSpecInput from './pages/ApiSpecInput';
import TestSuiteDetail from './pages/TestSuiteDetail';
import TestRunResults from './pages/TestRunResults';
import ReportDetail from './pages/ReportDetail';
import ReportList from './pages/ReportList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/api-spec" element={<ApiSpecInput />} />
            <Route path="/test-suites/:id" element={<TestSuiteDetail />} />
            <Route path="/test-runs/:id" element={<TestRunResults />} />
            <Route path="/reports" element={<ReportList />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
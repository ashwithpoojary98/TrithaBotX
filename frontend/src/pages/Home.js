import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { reportApi } from '../api/apiClient';

const Home = () => {
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRecentReports = async () => {
      try {
        const response = await reportApi.getReportList(0, 5);
        setRecentReports(response.data.content);
      } catch (error) {
        console.error('Failed to fetch recent reports:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentReports();
  }, []);
  
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">TrithaBotX</h1>
        <p className="text-xl text-gray-600">
          Generate, Automate, and report on API tests using LLM technology
        </p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link 
            to="/api-spec" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Create New Test Suite
          </Link>
          <Link 
            to="/reports" 
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            View Reports
          </Link>
        </div>
      </div>
      
      {/* Recent Reports Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Test Runs</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-600">Loading recent reports...</p>
          </div>
        ) : recentReports.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">No test runs found. Create your first test suite to get started.</p>
            <Link 
              to="/api-spec" 
              className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Create Test Suite
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentReports.map((report) => (
              <div key={report.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className={`px-4 py-2 text-white ${report.status === 'passed' ? 'bg-green-600' : report.status === 'failed' ? 'bg-red-600' : 'bg-yellow-500'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{report.testSuiteName}</h3>
                    <span className="text-sm">{report.status.toUpperCase()}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Environment: {report.environment}</span>
                  </div>
                  <div className="text-sm mb-3">
                    <div>Total: {report.summary.total} tests</div>
                    <div>Passed: {report.summary.passed}</div>
                    <div>Failed: {report.summary.failed}</div>
                    <div>Pass Rate: {report.summary.passRate.toFixed(1)}%</div>
                  </div>
                  <Link 
                    to={`/reports/${report.id}`} 
                    className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded font-medium text-sm transition-colors"
                  >
                    View Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Features Section */}
      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">LLM-Powered Test Generation</h3>
          <p className="text-gray-600">Automatically generate comprehensive test cases from your API specification using Ollama LLM models.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Test Automation</h3>
          <p className="text-gray-600">Run your test suites against any environment with configurable settings and concurrency options.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Reporting</h3>
          <p className="text-gray-600">Get detailed reports with AI-generated insights to improve your API testing and ensure high-quality services.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
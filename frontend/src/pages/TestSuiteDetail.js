import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { testCaseApi, testRunnerApi } from '../api/apiClient';
import TestCaseList from '../components/TestCaseList';
import TestRunModal from '../components/TestRunModal';

const TestSuiteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testSuite, setTestSuite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRunModal, setShowRunModal] = useState(false);
  const [runningTest, setRunningTest] = useState(false);
  
  useEffect(() => {
    fetchTestSuite();
  }, [id]);
  
  const fetchTestSuite = async () => {
    try {
      setLoading(true);
      const response = await testCaseApi.getTestSuite(id);
      setTestSuite(response.data);
    } catch (error) {
      console.error('Error fetching test suite:', error);
      toast.error('Failed to load test suite');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRunTest = async (config) => {
    try {
      setRunningTest(true);
      setShowRunModal(false);
      
      const response = await testRunnerApi.runTestSuite(id, config);
      
      toast.success('Test run started successfully');
      navigate(`/test-runs/${response.data.id}`);
    } catch (error) {
      console.error('Error starting test run:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to start test run');
      }
      
      setRunningTest(false);
    }
  };
  
  const handleDeleteTestCase = async (testCaseId) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) {
      return;
    }
    
    try {
      await testCaseApi.deleteTestCase(testCaseId);
      
      // Update the UI
      setTestSuite(prev => ({
        ...prev,
        testCases: prev.testCases.filter(tc => tc.id !== testCaseId),
        testCasesCount: prev.testCasesCount - 1
      }));
      
      toast.success('Test case deleted successfully');
    } catch (error) {
      console.error('Error deleting test case:', error);
      toast.error('Failed to delete test case');
    }
  };
  
  const handleUpdateTestCase = async (testCaseId, updates) => {
    try {
      const response = await testCaseApi.updateTestCase(testCaseId, updates);
      
      // Update the UI
      setTestSuite(prev => ({
        ...prev,
        testCases: prev.testCases.map(tc => 
          tc.id === testCaseId ? response.data : tc
        )
      }));
      
      toast.success('Test case updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating test case:', error);
      toast.error('Failed to update test case');
      return false;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <p className="ml-2">Loading test suite...</p>
      </div>
    );
  }
  
  if (!testSuite) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Suite Not Found</h2>
        <p className="text-gray-600 mb-6">The requested test suite could not be found.</p>
        <button 
          onClick={() => navigate('/api-spec')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Create New Test Suite
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Test Suite: {testSuite.name}</h1>
        <button
          className={`px-6 py-2 rounded-lg font-medium ${
            runningTest 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
          onClick={() => setShowRunModal(true)}
          disabled={runningTest}
        >
          {runningTest ? 'Starting Test Run...' : 'Run Tests'}
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Test Cases ({testSuite.testCasesCount})</h2>
          <div className="text-sm text-gray-500">
            Created: {new Date(testSuite.createdAt).toLocaleString()}
          </div>
        </div>
        
        <TestCaseList 
          testCases={testSuite.testCases} 
          onDelete={handleDeleteTestCase}
          onUpdate={handleUpdateTestCase}
        />
      </div>
      
      {showRunModal && (
        <TestRunModal 
          onClose={() => setShowRunModal(false)} 
          onSubmit={handleRunTest}
        />
      )}
    </div>
  );
};

export default TestSuiteDetail;
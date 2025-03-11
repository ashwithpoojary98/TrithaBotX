import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { testRunnerApi, reportApi } from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import TestResultsList from '../components/TestResultsList';

const TestRunResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testRun, setTestRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  useEffect(() => {
    fetchTestRun();
    
    // Start polling if the test is still running
    const interval = setInterval(fetchTestRun, 3000);
    setPollingInterval(interval);
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [id]);
  
  const fetchTestRun = async () => {
    try {
      const response = await testRunnerApi.getTestRun(id);
      setTestRun(response.data);
      
      // Stop polling if the test is no longer running
      if (response.data.status !== 'running') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (error) {
      console.error('Error fetching test run:', error);
      
      if (loading) {
        toast.error('Failed to load test run results');
      }
      
      // Stop polling on error
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await reportApi.generateReport(id);
      navigate(`/reports/${response.data.id}`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      setGeneratingReport(false);
    }
  };
  
  const renderProgressBar = () => {
    if (!testRun || !testRun.summary) return null;
    
    const { total, passed, failed } = testRun.summary;
    const passedPercentage = (passed / total) * 100;
    const failedPercentage = (failed / total) * 100;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div className="flex h-full rounded-full overflow-hidden">
          <div 
            className="bg-green-500 h-full" 
            style={{ width: `${passedPercentage}%` }}
          ></div>
          <div 
            className="bg-red-500 h-full" 
            style={{ width: `${failedPercentage}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <p className="ml-2">Loading test results...</p>
      </div>
    );
  }
  
  if (!testRun) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Run Not Found</h2>
        <p className="text-gray-600 mb-6">The requested test run could not be found.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Go to Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Test Run Results</h1>
        <button
          className={`px-6 py-2 rounded-lg font-medium ${
            testRun.status === 'running' || generatingReport
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          onClick={handleGenerateReport}
          disabled={testRun.status === 'running' || generatingReport}
        >
          {generatingReport ? 'Generating...' : 'Generate Full Report'}
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center space-x-3 mb-2 md:mb-0">
            <h2 className="text-xl font-semibold text-gray-800">Status:</h2>
            <StatusBadge status={testRun.status} />
          </div>
          
          <div className="text-gray-600">
            <div>Environment: <span className="font-medium">{testRun.environment}</span></div>
            <div>Base URL: <span className="font-medium">{testRun.baseUrl}</span></div>
          </div>
        </div>
        
        {testRun.status === 'running' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-yellow-700">
              Test run is in progress. Results will update automatically...
            </p>
          </div>
        )}
        
        {testRun.summary && (
          <>
            {renderProgressBar()}
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">{testRun.summary.total}</div>
                <div className="text-gray-500">Total Tests</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-700">{testRun.summary.passed}</div>
                <div className="text-green-600">Passed</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-700">{testRun.summary.failed}</div>
                <div className="text-red-600">Failed</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-700">
                  {testRun.summary.passRate.toFixed(1)}%
                </div>
                <div className="text-blue-600">Pass Rate</div>
              </div>
            </div>
          </>
        )}
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Test Results</h3>
          <TestResultsList results={testRun.results} />
        </div>
        
        <div className="text-sm text-gray-500 mt-4">
          <div>Started: {testRun.startTime ? new Date(testRun.startTime).toLocaleString() : '-'}</div>
          <div>Completed: {testRun.endTime ? new Date(testRun.endTime).toLocaleString() : '-'}</div>
        </div>
      </div>
    </div>
  );
};

export default TestRunResults;
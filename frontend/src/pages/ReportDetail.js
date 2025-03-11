// src/pages/ReportDetail.js
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reportApi } from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  
  const COLORS = ['#4ade80', '#f87171', '#fbbf24'];
  
  useEffect(() => {
    fetchReport();
  }, [id]);
  
  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportApi.generateReport(id);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };
  
  const prepareStatusData = () => {
    if (!report || !report.summary) return [];
    
    return [
      { name: 'Passed', value: report.summary.passed },
      { name: 'Failed', value: report.summary.failed },
      { name: 'Skipped', value: report.summary.skipped }
    ].filter(item => item.value > 0);
  };
  
  const prepareCategoryData = () => {
    if (!report || !report.statistics || !report.statistics.categoryStats) return [];
    
    return Object.entries(report.statistics.categoryStats).map(([key, value]) => ({
      name: key,
      passed: value.passed,
      failed: value.failed,
      passRate: value.passRate
    }));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-gray-600">Loading report...</p>
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h2>
        <p className="text-gray-600 mb-6">The requested report could not be found.</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Go Back
          </button>
          <Link 
            to="/reports"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            View All Reports
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{report.reportName || "Test Report"}</h1>
          <p className="text-gray-600">Test Suite: {report.testSuiteName}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
          >
            Back
          </button>
          <Link 
            to={`/test-suites/${report.testSuiteId}`}
            className="text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded border border-indigo-300 hover:bg-indigo-50"
          >
            View Test Suite
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="flex flex-wrap border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'summary' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'insights' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'results' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('results')}
          >
            Test Results
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'summary' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Run Overview</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-3">
                      <span className="text-gray-500">Status:</span>
                      <StatusBadge status={report.status || "completed"} className="ml-2" />
                    </div>
                    <div className="mb-3">
                      <span className="text-gray-500">Environment:</span>
                      <span className="font-medium ml-2">{report.environment}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-gray-500">Base URL:</span>
                      <span className="font-medium ml-2">{report.baseUrl}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-gray-500">Execution Time:</span>
                      <span className="font-medium ml-2">
                        {report.duration && report.duration.totalMs 
                          ? `${(report.duration.totalMs / 1000).toFixed(1)} seconds` 
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Generated At:</span>
                      <span className="font-medium ml-2">
                        {new Date(report.generatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
                  <div className="flex items-center justify-center h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareStatusData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {prepareStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} tests`, null]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Results by Category</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareCategoryData()} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="passed" name="Passed Tests" fill="#4ade80" />
                      <Bar dataKey="failed" name="Failed Tests" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {report.statistics && report.statistics.mostCommonErrors && report.statistics.mostCommonErrors.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Most Common Errors</h2>
                  <div className="bg-red-50 rounded-lg p-4">
                    <ul className="list-disc pl-5 space-y-2">
                      {report.statistics.mostCommonErrors.map((error, index) => (
                        <li key={index} className="text-red-700">
                          <span className="font-medium">{error.error}</span>
                          <span className="text-red-600 ml-2">
                            ({error.count} {error.count === 1 ? 'occurrence' : 'occurrences'})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'insights' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">AI-Generated Insights</h2>
              
              {report.insights && report.insights.summary ? (
                <div>
                  <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-indigo-800 mb-2">Summary</h3>
                    <p className="text-indigo-700">{report.insights.summary}</p>
                  </div>
                  
                  {report.insights.details && (
                    <div className="prose max-w-none">
                      <ReactMarkdown>{report.insights.details}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-gray-600">No insights available for this report.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'results' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Test Results</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Case
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.testResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{result.testCaseName}</div>
                          <div className="text-xs text-gray-500">{result.requestMethod} {result.requestUrl}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {result.category || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={result.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm ${
                            result.responseStatus >= 200 && result.responseStatus < 300
                              ? 'text-green-700'
                              : result.responseStatus >= 400
                                ? 'text-red-700'
                                : 'text-gray-700'
                          }`}>
                            {result.responseStatus || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.duration !== null ? `${result.duration} ms` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {report.testResults && report.testResults.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No test results available for this report.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
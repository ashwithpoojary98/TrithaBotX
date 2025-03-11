import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reportApi } from '../api/apiClient';
import StatusBadge from '../components/StatusBadge';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  useEffect(() => {
    fetchReports();
  }, [page, size]);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportApi.getReportList(page, size);
      setReports(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load test reports');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };
  
  const handleSizeChange = (event) => {
    setSize(parseInt(event.target.value));
    setPage(0); // Reset to first page when changing size
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Test Reports</h1>
        <Link 
          to="/api-spec"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Create New Test
        </Link>
      </div>
      
      {loading && reports.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="ml-3 text-gray-600">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Reports Found</h2>
          <p className="text-gray-600 mb-6">There are no test reports available yet. Generate a test suite and run tests to create reports.</p>
          <Link 
            to="/api-spec"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Create Test Suite
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Environment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pass Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.reportName || report.testSuiteName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{report.environment}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.summary ? (
                          <div className="text-sm text-gray-900">
                            {report.summary.passed}/{report.summary.total}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">N/A</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.summary ? (
                          <div className="flex items-center">
                            <div 
                              className={`h-2 w-16 rounded-full ${
                                report.summary.passRate >= 90 ? 'bg-green-500' :
                                report.summary.passRate >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                            >
                              <div 
                                className="h-2 bg-green-600 rounded-full" 
                                style={{ width: `${report.summary.passRate}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {report.summary.passRate.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">N/A</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.startTime || report.generatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link 
                          to={`/reports/${report.id}`}
                          className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                        >
                          View Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {loading && (
              <div className="flex justify-center items-center p-4 border-t border-gray-200">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <p className="ml-2 text-gray-600 text-sm">Loading...</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-md">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing <span className="font-medium">{reports.length}</span> of{' '}
                <span className="font-medium">{totalElements}</span> reports
              </span>
              
              <select
                className="ml-4 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={size}
                onChange={handleSizeChange}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  page === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show current page and nearby pages
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = i;
                } else if (page < 3) {
                  pageToShow = i;
                } else if (page > totalPages - 3) {
                  pageToShow = totalPages - 5 + i;
                } else {
                  pageToShow = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageToShow}
                    onClick={() => handlePageChange(pageToShow)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      page === pageToShow
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {pageToShow + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  page >= totalPages - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportList;
import { useState } from 'react';
import StatusBadge from './StatusBadge';

const TestResultsList = ({ results }) => {
  const [expandedResults, setExpandedResults] = useState({});
  
  const toggleExpand = (id) => {
    setExpandedResults(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  if (!results || results.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">No test results available.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {results.map((result) => (
        <div key={result.id} className="border rounded-lg overflow-hidden">
          <div 
            className={`px-4 py-3 cursor-pointer flex justify-between items-center ${
              result.status === 'passed' 
                ? 'bg-green-50 hover:bg-green-100' 
                : result.status === 'failed'
                  ? 'bg-red-50 hover:bg-red-100' 
                  : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => toggleExpand(result.id)}
          >
            <div className="flex items-center">
              <StatusBadge status={result.status} className="mr-3" />
              <span className="font-medium">{result.testCaseId}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${
                result.responseStatus >= 200 && result.responseStatus < 300
                  ? 'text-green-700'
                  : result.responseStatus >= 400
                    ? 'text-red-700'
                    : 'text-gray-700'
              }`}>
                {result.responseStatus || '-'}
              </span>
              <span className="text-sm text-gray-600">
                {result.duration ? `${result.duration} ms` : '-'}
              </span>
              <svg 
                className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedResults[result.id] ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          
          {expandedResults[result.id] && (
            <div className="p-4 bg-white border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Request</h4>
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    <div><span className="font-medium">URL:</span> {result.requestUrl}</div>
                    <div><span className="font-medium">Method:</span> {result.requestMethod}</div>
                    {result.requestHeaders && Object.keys(result.requestHeaders).length > 0 && (
                      <div>
                        <span className="font-medium">Headers:</span>
                        <pre className="text-xs mt-1 overflow-x-auto">
                          {JSON.stringify(result.requestHeaders, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.requestBody && (
                      <div>
                        <span className="font-medium">Body:</span>
                        <pre className="text-xs mt-1 overflow-x-auto">
                          {typeof result.requestBody === 'object' 
                            ? JSON.stringify(result.requestBody, null, 2)
                            : result.requestBody}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Response</h4>
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    <div><span className="font-medium">Status:</span> {result.responseStatus}</div>
                    {result.responseHeaders && Object.keys(result.responseHeaders).length > 0 && (
                      <div>
                        <span className="font-medium">Headers:</span>
                        <pre className="text-xs mt-1 overflow-x-auto">
                          {JSON.stringify(result.responseHeaders, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.responseBody && (
                      <div>
                        <span className="font-medium">Body:</span>
                        <pre className="text-xs mt-1 overflow-x-auto">
                          {typeof result.responseBody === 'object' 
                            ? JSON.stringify(result.responseBody, null, 2)
                            : result.responseBody}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {result.validationErrors && result.validationErrors.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-red-700 mb-1">Validation Errors</h4>
                  <ul className="bg-red-50 p-2 rounded text-sm text-red-700">
                    {result.validationErrors.map((error, index) => (
                      <li key={index} className="mb-1">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.error && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-red-700 mb-1">Error</h4>
                  <div className="bg-red-50 p-2 rounded text-sm text-red-700">
                    {result.error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TestResultsList;
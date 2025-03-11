import { useState } from 'react';
import Editor from '@monaco-editor/react';

const TestCaseEditModal = ({ testCase, onClose, onSave }) => {
  const [name, setName] = useState(testCase.name);
  const [method, setMethod] = useState(testCase.method);
  const [endpoint, setEndpoint] = useState(testCase.endpoint);
  const [expectedStatus, setExpectedStatus] = useState(testCase.expectedStatus);
  const [headersJson, setHeadersJson] = useState(JSON.stringify(testCase.headers || {}, null, 2));
  const [bodyJson, setBodyJson] = useState(
    testCase.body ? JSON.stringify(testCase.body, null, 2) : ''
  );
  const [category, setCategory] = useState(testCase.category);
  const [validationJson, setValidationJson] = useState(
    JSON.stringify(testCase.validation || [], null, 2)
  );
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!method.trim()) {
      newErrors.method = 'Method is required';
    }
    
    if (!endpoint.trim()) {
      newErrors.endpoint = 'Endpoint is required';
    }
    
    if (!expectedStatus) {
      newErrors.expectedStatus = 'Expected status is required';
    } else if (isNaN(expectedStatus) || expectedStatus < 100 || expectedStatus > 599) {
      newErrors.expectedStatus = 'Expected status must be a valid HTTP status code';
    }
    
    // Validate JSON fields
    try {
      JSON.parse(headersJson);
    } catch (e) {
      newErrors.headers = 'Invalid JSON for headers';
    }
    
    if (bodyJson.trim()) {
      try {
        JSON.parse(bodyJson);
      } catch (e) {
        newErrors.body = 'Invalid JSON for body';
      }
    }
    
    try {
      JSON.parse(validationJson);
    } catch (e) {
      newErrors.validation = 'Invalid JSON for validation';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const updates = {
      name,
      method,
      endpoint,
      expectedStatus: parseInt(expectedStatus),
      category,
      headers: JSON.parse(headersJson),
      validation: JSON.parse(validationJson)
    };
    
    if (bodyJson.trim()) {
      updates.body = JSON.parse(bodyJson);
    }
    
    onSave(testCase.id, updates);
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Test Case</h3>
                
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="edge">Edge Case</option>
                        <option value="security">Security</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Method
                      </label>
                      <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.method ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                        <option value="HEAD">HEAD</option>
                        <option value="OPTIONS">OPTIONS</option>
                      </select>
                      {errors.method && <p className="mt-1 text-sm text-red-600">{errors.method}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Endpoint
                      </label>
                      <input
                        type="text"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.endpoint ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      />
                      {errors.endpoint && <p className="mt-1 text-sm text-red-600">{errors.endpoint}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Expected Status
                      </label>
                      <input
                        type="number"
                        value={expectedStatus}
                        onChange={(e) => setExpectedStatus(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors.expectedStatus ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        min="100"
                        max="599"
                      />
                      {errors.expectedStatus && <p className="mt-1 text-sm text-red-600">{errors.expectedStatus}</p>}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Headers (JSON)
                    </label>
                    <div className="mt-1 border border-gray-300 rounded-md overflow-hidden">
                      <Editor
                        height="150px"
                        language="json"
                        value={headersJson}
                        onChange={setHeadersJson}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                        theme="vs-light"
                      />
                    </div>
                    {errors.headers && <p className="mt-1 text-sm text-red-600">{errors.headers}</p>}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Body (JSON, optional)
                    </label>
                    <div className="mt-1 border border-gray-300 rounded-md overflow-hidden">
                      <Editor
                        height="150px"
                        language="json"
                        value={bodyJson}
                        onChange={setBodyJson}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                        theme="vs-light"
                      />
                    </div>
                    {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Validation Rules (JSON array)
                    </label>
                    <div className="mt-1 border border-gray-300 rounded-md overflow-hidden">
                      <Editor
                        height="150px"
                        language="json"
                        value={validationJson}
                        onChange={setValidationJson}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                        theme="vs-light"
                      />
                    </div>
                    {errors.validation && <p className="mt-1 text-sm text-red-600">{errors.validation}</p>}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCaseEditModal;
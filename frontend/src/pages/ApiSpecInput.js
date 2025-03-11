import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { toast } from 'react-toastify';
import { testCaseApi } from '../api/apiClient';

const ApiSpecInput = () => {
  const [apiSpec, setApiSpec] = useState('{\n  "openapi": "3.0.0",\n  "info": {\n    "title": "Sample API",\n    "version": "1.0.0"\n  },\n  "paths": {\n    "/users": {\n      "get": {\n        "summary": "Get all users",\n        "responses": {\n          "200": {\n            "description": "Success"\n          }\n        }\n      }\n    }\n  }\n}');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleEditorChange = (value) => {
    setApiSpec(value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiSpec || apiSpec.trim() === '') {
      toast.error('Please enter an API specification');
      return;
    }
    
    try {
      setLoading(true);
      
      // Validate the JSON before sending
      try {
        JSON.parse(apiSpec);
      } catch (err) {
        toast.error('Invalid JSON format in API specification');
        setLoading(false);
        return;
      }
      
      const response = await testCaseApi.generateTestCases(apiSpec);
      const testSuiteId = response.data.id;
      toast.success('Test cases generated successfully!');
      navigate(`/test-suites/${testSuiteId}`);
    } catch (error) {
      console.error('Error generating test cases:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to generate test cases. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">API Specification Input</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Enter your API specification in JSON format. The test generator will analyze
            your API and create comprehensive test cases.
          </p>
          
          <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
            <Editor
              height="500px"
              defaultLanguage="json"
              defaultValue={apiSpec}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
              theme="vs-light"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className={`px-6 py-2 rounded-lg font-medium ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Test Cases'}
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Tips for good test generation:</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-600">
            <li>Include complete request and response schemas in your API spec</li>
            <li>Define validation rules and constraints for your parameters</li>
            <li>Include authentication and security requirements</li>
            <li>Ensure all endpoints and methods are properly documented</li>
            <li>Include examples of valid request/response pairs when possible</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiSpecInput;
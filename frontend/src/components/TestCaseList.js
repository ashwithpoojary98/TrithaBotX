import { useState } from 'react';
import StatusBadge from './StatusBadge';
import TestCaseEditModal from './TestCaseEditModal';

const TestCaseList = ({ testCases, onDelete, onUpdate }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  
  const handleEdit = (testCase) => {
    setSelectedTestCase(testCase);
    setShowEditModal(true);
  };
  
  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedTestCase(null);
  };
  
  const handleSaveEdit = async (testCaseId, updates) => {
    const success = await onUpdate(testCaseId, updates);
    if (success) {
      handleCloseModal();
    }
  };
  
  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method / Endpoint
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testCases.map((testCase) => (
              <tr key={testCase.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{testCase.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      testCase.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                      testCase.method === 'POST' ? 'bg-green-100 text-green-800' :
                      testCase.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      testCase.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {testCase.method}
                    </span>
                    <span className="ml-2">{testCase.endpoint}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {testCase.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{testCase.expectedStatus}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(testCase)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(testCase.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showEditModal && selectedTestCase && (
        <TestCaseEditModal
          testCase={selectedTestCase}
          onClose={handleCloseModal}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default TestCaseList;
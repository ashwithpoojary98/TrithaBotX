import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const testCaseApi = {
  generateTestCases: (apiSpec) => 
    apiClient.post('/test-cases/generate', { content: apiSpec, format: 'json' }),
  
  getTestSuite: (testSuiteId) => 
    apiClient.get(`/test-suites/${testSuiteId}`),
  
  updateTestCase: (testCaseId, updates) => 
    apiClient.put(`/test-cases/${testCaseId}`, updates),
  
  deleteTestCase: (testCaseId) => 
    apiClient.delete(`/test-cases/${testCaseId}`),
};

export const testRunnerApi = {
  runTestSuite: (testSuiteId, config) => 
    apiClient.post(`/test-suites/${testSuiteId}/run`, config),
  
  getTestRun: (testRunId) => 
    apiClient.get(`/test-runs/${testRunId}`),
};

export const reportApi = {
  generateReport: (testRunId) => 
    apiClient.get(`/reports/${testRunId}`),
  
  getReportList: (page = 0, size = 10) => 
    apiClient.get(`/reports?page=${page}&size=${size}`),
};

export default apiClient;
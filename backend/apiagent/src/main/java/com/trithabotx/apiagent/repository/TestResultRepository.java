package com.trithabotx.apiagent.repository;

import com.trithabotx.apiagent.model.TestResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestResultRepository  extends MongoRepository<TestResult, String> {
    List<TestResult> findByTestRunId(String testRunId);
    List<TestResult> findByTestCaseId(String testCaseId);
}

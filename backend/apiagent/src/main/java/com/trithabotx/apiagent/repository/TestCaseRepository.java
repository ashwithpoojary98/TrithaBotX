package com.trithabotx.apiagent.repository;

import com.trithabotx.apiagent.model.TestCase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends MongoRepository<TestCase, String> {
    List<TestCase> findByTestSuiteId(String testSuiteId);

}

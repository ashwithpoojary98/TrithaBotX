package com.trithabotx.apiagent.repository;

import com.trithabotx.apiagent.model.TestRun;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestRunRepository extends MongoRepository<TestRun, String> {
    List<TestRun> findByTestSuiteId(String testSuiteId);

}

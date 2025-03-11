package com.trithabotx.apiagent.repository;

import com.trithabotx.apiagent.model.TestSuite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestSuiteRepository extends MongoRepository<TestSuite, String> {
}

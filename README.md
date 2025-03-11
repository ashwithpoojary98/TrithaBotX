# TrithaBotX
TrithaBotX is an advanced, open-source platform designed for API test case generation and automation, enabling users to test APIs without writing a single line of code



[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ashwithpoojary98/TrithaBotX)
[![GitHub stars](https://img.shields.io/github/stars/ashwithpoojary98/TrithaBotX.svg?style=flat)](https://github.com/ashwithpoojary98/TrithaBotX/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat )](https://github.com/ashwithpoojary98/TrithaBotX/pulls)
[![GitHub forks](https://img.shields.io/github/forks/ashwithpoojary98/TrithaBotX.svg?style=social&label=Fork)](https://github.com/ashwithpoojary98/TrithaBotX/network)

# API Testing Suite with LLM-Powered Test Generation

This API Testing Suite leverages powerful LLM models to automatically generate comprehensive test cases from your API specifications. The suite enables test automation, configuration flexibility, and smart reporting to ensure high-quality services and smooth API operations.

## Features

### LLM-Powered Test Generation
- **Automatic Test Case Creation**: Generate detailed and relevant test cases based on your API specifications. 
- **Comprehensive Coverage**: Ensures that all aspects of your API are tested, including edge cases, error handling, and typical user scenarios.

### Test Automation
- **Run Against Any Environment**: Execute your test suite in various environments with ease.
- **Configurable Settings**: Adjust test parameters to fit the requirements of different API environments.
- **Concurrency Options**: Run tests concurrently to speed up the testing process and simulate real-world usage scenarios.

### Smart Reporting
- **AI-Generated Insights**: Receive detailed reports with AI-powered insights to highlight areas of improvement in your API.
- **Actionable Results**: The reports suggest potential optimizations and offer recommendations for bug fixes, performance improvements, and other critical areas.
- **Detailed Metrics**: Understand your API’s performance through comprehensive metrics such as response times, error rates, and test pass/fail ratios.

## Getting Started

### Prerequisites
- Python 3.x (or above)
- Required dependencies are listed in `requirements.txt`.
- Node.js
- Ollama
- Docker

### Installation

1. Install ollama
   ```bash
   https://ollama.com/download
2. Open command promt and install any model(deepseek prefered)
   ```bash
   ollama run deepseek-r1:1.5b   
3. Clone this repository:
   ```bash
   git clone https://github.com/your-repo-name/api-testing-suite.git
4. Run docker file to start the mongo db(backend\apiagent\docker-mongo.yml)   
5. Run Spring boot code
6. Navigate to frontend
    ```bash
    cd frontend
    npm start


***

### Contributing

We welcome contributions from the community! Here’s how you can help:

### How to Contribute

1. **Fork the Repository:**
    - Click the "Fork" button on the top right of the repository page to create a copy of the project under your GitHub account.

2. **Clone Your Fork:**
    - Clone your forked repository to your local machine:
      ```bash
      git clone https://github.com/ashwithpoojary98/TrithaBotX.git
      ```

3. **Create a Branch:**
    - Create a new branch for your feature or bug fix:
      ```bash
      git checkout -b your-branch-name
      ```

4. **Make Changes:**
    - Make your changes in your branch. Be sure to follow the coding style and guidelines of the project.

5. **Commit Your Changes:**
    - Stage your changes:
      ```bash
      git add .
      ```
    - Commit with a clear and descriptive message:
      ```bash
      git commit -m "Add a feature or fix a bug"
      ```

6. **Push to Your Fork:**
    - Push your changes back to your fork:
      ```bash
      git push origin your-branch-name
      ```

7. **Create a Pull Request:**
    - Go to the original repository where you want to contribute. You should see a prompt to create a pull request for your branch.
    - Click "Compare & pull request."
    - Provide a clear title and description for your pull request, explaining the changes you made and why they are necessary.

### Guidelines

- **Code Style:** Follow the coding conventions used in the project. If you’re unsure, check existing code for guidance.
- **Testing:** If applicable, add tests for your new features or bug fixes. Ensure all tests pass before submitting your pull request.
- **Documentation:** Update documentation if your changes introduce new features or alter existing ones.

### Issues

If you encounter any problems or have suggestions for improvements, please open an issue in the repository.

### Thank You!

Thank you for considering contributing to this project! Your help is greatly appreciated, and we look forward to your contributions.

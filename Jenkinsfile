pipeline {
    agent any 

    environment {
        DOCKER_HUB_REPO = 'mohamed079/my-node-app'
        DOCKER_HUB_CREDENTIALS = credentials('DOCKER_HUB_CREDENTIALS')
        
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        SONAR_HOST_URL = 'https://sonarcloud.io'
        
        APP_VERSION = "${BUILD_NUMBER}"
        STAGING_PORT = '3001'
        PRODUCTION_PORT = '3000'
    }

    tools {
        nodejs 'NodeJS-18'
    }

    stages {
        stage('Checkout') {
            steps {
                  echo 'Checking out source code from GitHub...'
                checkout scm
                
                script {
                    def gitCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    def gitBranch = sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD').trim()
                    echo "Building commit: ${gitCommit} on branch: ${gitBranch}"
                    env.GIT_COMMIT_SHORT = gitCommit
                    env.GIT_BRANCH = gitBranch
                }
            }
            }

             stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                sh '''
                    echo "Node.js version: $(node --version)"
                    echo "npm version: $(npm --version)"
                    
                    # Clean install for reproducible builds
                    npm ci
                    
                    # List installed packages for debugging
                    npm list --depth=0
                '''
            }
        }

         stage('Run Tests') {
            steps {
                echo 'Running unit tests with coverage...'
                sh '''
                    # Run tests with coverage for SonarCloud
                    npm run test:coverage
                    
                    # Display test results summary
                    echo "Test execution completed"
                '''
            }
            post {
                always {
                    // Archive test results
                    publishTestResults testResultsPattern: 'coverage/lcov.info'
                    
                    // Archive coverage reports
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        }

       
    }

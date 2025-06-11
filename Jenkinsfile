pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO = 'mohamed079/my-node-app'
        DOCKER_HUB_CREDENTIALS = 'dockerhub-credentials'

        SONAR_TOKEN = credentials('sonarcloud-token')
        SONAR_HOST_URL = 'https://sonarcloud.io'

        APP_VERSION = "${BUILD_NUMBER}"
        STAGING_PORT = '3001'
        PRODUCTION_PORT = '3000'
    }

    tools {
        git 'Default Git' 
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
                sh '''
                    echo "Node.js version: $(node --version)"
                    echo "npm version: $(npm --version)"

                    npm ci

                    npm list --depth=0
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running unit tests with coverage...'
                sh '''
                    npm run test:coverage

                    echo "Test execution completed"
                '''
            }
            post {
                always {
                     junit testResults: '**/test-results.xml'

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

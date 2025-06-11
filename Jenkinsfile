
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
   }
   }
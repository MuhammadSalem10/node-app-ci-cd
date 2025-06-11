pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO = 'mohamed079/my-node-app'
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_HUB_USER = "mohamed079"
        SONAR_TOKEN = credentials('sonarcloud-token')
        SONAR_HOST_URL = 'https://sonarcloud.io'

        APP_VERSION = "${BUILD_NUMBER}"
        STAGING_PORT = '3001'
        PRODUCTION_PORT = '3000'
    }

    tools {
        git 'Git' 
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
                    junit 'test-results/junit.xml'
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

        // stage('Static Code Analysis') {
        //     steps {
        //         echo 'Running SonarCloud analysis...'
        //         script {
        //             def scannerHome = tool 'SonarQube-Scanner'
        //             withSonarQubeEnv('SonarCloud') {
        //                 sh """
        //                     ${scannerHome}/bin/sonar-scanner \
        //                         -Dsonar.projectKey=MuhammadSalem10_node-app-ci-cd \
        //                         -Dsonar.organization=muhammadsalem10-1 \
        //                         -Dsonar.sources=. \
        //                         -Dsonar.exclusions=node_modules/**,tests/**,coverage/** \
        //                         -Dsonar.test.inclusions=tests/** \
        //                         -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
        //                         -Dsonar.projectVersion=${APP_VERSION}
        //                 """
        //             }
        //         }
        //     }
        // }

        // stage('Quality Gate') {
        //     steps {
        //         echo 'Waiting for SonarCloud Quality Gate...'
        //         timeout(time: 5, unit: 'MINUTES') {
        //             waitForQualityGate abortPipeline: true
        //         }
        //     }
        // }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    try {
                        def image = docker.build("${DOCKER_HUB_REPO}:${APP_VERSION}")
                        sh "docker tag ${DOCKER_HUB_REPO}:${APP_VERSION} ${DOCKER_HUB_REPO}:latest"
                        env.DOCKER_IMAGE = "${DOCKER_HUB_REPO}:${APP_VERSION}"
                        echo "Built Docker image: ${env.DOCKER_IMAGE}"
                    } catch (Exception e) {
                        echo "Error during Docker build: ${e.message}"
                        error "Failed to build Docker image"
                        }
                    }
                }
        }

          stage('Push the Image to Docker Hub') {
            steps {
              withCredentials([usernamePassword(
                credentialsId: 'dockerhub-credentials',
                usernameVariable: 'DOCKERHUB_USERNAME',
                passwordVariable: 'DOCKERHUB_PASSWORD'
              )]) {
                sh '''
                  echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin
                  docker push mohamed079/my-node-app:${APP_VERSION}
                  docker push mohamed079/my-node-app:latest
                  docker logout
                '''
              }
            }
          }

           stage('Deploy to Staging') {
            steps {
                echo 'Deploying to staging environment...'
                script {
                    sh '''
                        docker stop my-app-staging || true
                        docker rm my-app-staging || true
                    '''
                    
                    sh """
                        docker run -d \
                            --name my-app-staging \
                            -p ${STAGING_PORT}:3000 \
                            -e NODE_ENV=staging \
                            -e APP_VERSION=${APP_VERSION} \
                            ${DOCKER_IMAGE}
                    """
                    
                    sh """
                        echo "Waiting for staging deployment to be ready..."
                        timeout 60 bash -c 'until curl -f http://localhost:${STAGING_PORT}/health; do sleep 5; done'
                    """
                    
                    echo "Staging deployment successful! Available at: http://localhost:${STAGING_PORT}"
                }
            }
            post {
                success {
                    echo 'Staging deployment completed successfully!'
                }
                failure {
                    echo 'Staging deployment failed!'
                    sh 'docker logs my-app-staging || true'
                }
            }
        }

    }
}

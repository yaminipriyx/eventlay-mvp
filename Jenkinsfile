pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "eventlay-mvp-backend:build-${BUILD_NUMBER}"
        FRONTEND_IMAGE = "eventlay-mvp-frontend:build-${BUILD_NUMBER}"
    }

    options {
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out EventLay source code from GitHub...'

                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Installing dependencies and validating the application...'

                dir('backend') {
                    bat 'npm ci --omit=dev'
                }

                dir('frontend') {
                    bat 'npm ci'
                    bat 'npm run build'
                }
            }
        }

        stage('Test / Validate') {
            steps {
                echo 'Running application validation...'

                dir('frontend') {
                    bat 'npm run build'
                }

                echo 'Frontend build validation completed successfully.'
                echo 'Backend dependency installation completed successfully.'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building EventLay Docker images...'

                bat 'docker build -t %BACKEND_IMAGE% ./backend'

                bat 'docker build --build-arg VITE_API_BASE_URL=http://localhost:5000/api -t %FRONTEND_IMAGE% ./frontend'

                echo 'Docker images built successfully.'
            }
        }

        stage('Docker Verification') {
            steps {
                echo 'Verifying generated Docker images...'

                bat 'docker images eventlay-mvp-backend'
                bat 'docker images eventlay-mvp-frontend'
            }
        }
    }

    post {
        success {
            echo '========================================'
            echo 'EVENTLAY CI PIPELINE: SUCCESS'
            echo 'Docker images built successfully.'
            echo '========================================'
        }

        failure {
            echo '========================================'
            echo 'EVENTLAY CI PIPELINE: FAILED'
            echo 'Check the console output for the error.'
            echo '========================================'
        }

        always {
            echo "Pipeline completed with status: ${currentBuild.currentResult}"
        }
    }
}
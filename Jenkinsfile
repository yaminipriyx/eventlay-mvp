pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "eventlay-mvp-backend:build-${BUILD_NUMBER}"
        FRONTEND_IMAGE = "eventlay-mvp-frontend:build-${BUILD_NUMBER}"
        BACKEND_HUB    = "adithya3001/eventlay-mvp-backend"
        FRONTEND_HUB   = "adithya3001/eventlay-mvp-frontend"
    }

    options {
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out EventLay source code...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Installing dependencies and building EventLay...'

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
                echo 'Validating frontend production build...'

                dir('frontend') {
                    bat 'npm run build'
                }

                echo 'Frontend build validation completed.'
                echo 'Backend dependency installation completed.'
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

        stage('Tag Images for Docker Hub') {
            steps {
                echo 'Tagging images for Docker Hub...'

                bat 'docker tag %BACKEND_IMAGE% %BACKEND_HUB%:build-%BUILD_NUMBER%'
                bat 'docker tag %FRONTEND_IMAGE% %FRONTEND_HUB%:build-%BUILD_NUMBER%'

                bat 'docker tag %BACKEND_IMAGE% %BACKEND_HUB%:latest'
                bat 'docker tag %FRONTEND_IMAGE% %FRONTEND_HUB%:latest'

                echo 'Docker images tagged successfully.'
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-eventlay',
                        usernameVariable: 'DH_USER',
                        passwordVariable: 'DH_TOKEN'
                    )
                ]) {
                    bat '''
                        @echo off
                        setlocal DisableDelayedExpansion
                        <nul set /p "=%DH_TOKEN%" | docker login --username "%DH_USER%" --password-stdin
                        if errorlevel 1 exit /b 1
                    '''

                    bat 'docker push %BACKEND_HUB%:build-%BUILD_NUMBER%'
                    bat 'docker push %FRONTEND_HUB%:build-%BUILD_NUMBER%'

                    bat 'docker push %BACKEND_HUB%:latest'
                    bat 'docker push %FRONTEND_HUB%:latest'

                    bat 'docker logout'

                    echo 'Both Docker images pushed to Docker Hub.'
                }
            }
        }
    }

    post {
        success {
            echo '========================================'
            echo 'EVENTLAY SPRINT 9 PIPELINE: SUCCESS'
            echo 'Docker images pushed to Docker Hub.'
            echo '========================================'
        }

        failure {
            echo '========================================'
            echo 'EVENTLAY SPRINT 9 PIPELINE: FAILED'
            echo 'Check Console Output for the error.'
            echo '========================================'
        }

        always {
            echo "Pipeline completed with status: ${currentBuild.currentResult}"
        }
    }
}
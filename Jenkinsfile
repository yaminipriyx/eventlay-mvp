pipeline {
    agent any

    environment {
        // Docker Desktop Linux engine endpoint
        DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'

        // Docker Hub repositories
        BACKEND_HUB  = 'adithya3001/eventlay-mvp-backend'
        FRONTEND_HUB = 'adithya3001/eventlay-mvp-frontend'

        // Image tag unique to each Jenkins build
        IMAGE_TAG = "build-${BUILD_NUMBER}"

        BACKEND_IMAGE  = "eventlay-mvp-backend:build-${BUILD_NUMBER}"
        FRONTEND_IMAGE = "eventlay-mvp-frontend:build-${BUILD_NUMBER}"

        // Frontend API endpoint
        VITE_API_BASE_URL = 'http://localhost:5000/api'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out EventLay source code...'
                checkout scm
                bat 'git log -1 --format="Commit: %%H%nMessage: %%s"'
            }
        }

        stage('Build') {
            steps {
                echo 'Installing backend dependencies...'
                dir('backend') {
                    bat 'npm ci --omit=dev'
                }

                echo 'Installing frontend dependencies and building...'
                dir('frontend') {
                    bat 'npm ci'
                    bat 'npm run build'
                }
            }
        }

        stage('Test / Validate') {
            steps {
                echo 'Running automated backend tests...'
                dir('backend') {
                    bat 'npm test'
                }

                echo 'Validating frontend production build...'
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building Docker images for ${IMAGE_TAG}..."

                bat '''
                    docker build -t "%BACKEND_IMAGE%" -f backend/Dockerfile backend
                    if errorlevel 1 exit /b 1

                    docker build --build-arg VITE_API_BASE_URL="%VITE_API_BASE_URL%" -t "%FRONTEND_IMAGE%" -f frontend/Dockerfile frontend
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Docker Verification') {
            steps {
                echo 'Verifying the built Docker images...'

                bat '''
                    docker image inspect "%BACKEND_IMAGE%" >nul
                    if errorlevel 1 exit /b 1

                    docker image inspect "%FRONTEND_IMAGE%" >nul
                    if errorlevel 1 exit /b 1

                    docker images "%BACKEND_IMAGE%"
                    docker images "%FRONTEND_IMAGE%"
                '''
            }
        }

        stage('Tag Images for Docker Hub') {
            steps {
                echo 'Tagging images for Docker Hub...'

                bat '''
                    docker tag "%BACKEND_IMAGE%" "%BACKEND_HUB%:%IMAGE_TAG%"
                    if errorlevel 1 exit /b 1

                    docker tag "%FRONTEND_IMAGE%" "%FRONTEND_HUB%:%IMAGE_TAG%"
                    if errorlevel 1 exit /b 1

                    docker tag "%BACKEND_IMAGE%" "%BACKEND_HUB%:latest"
                    if errorlevel 1 exit /b 1

                    docker tag "%FRONTEND_IMAGE%" "%FRONTEND_HUB%:latest"
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                echo 'Pushing images to Docker Hub...'

                withCredentials([
                    string(
                        credentialsId: 'dockerhub-eventlay-token',
                        variable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    script {
                        writeFile(
                            file: 'dockerhub-token.txt',
                            text: env.DOCKERHUB_TOKEN
                        )

                        try {
                            bat '''
                                @echo off

                                docker login -u "adithya3001" --password-stdin < dockerhub-token.txt
                                if errorlevel 1 exit /b 1

                                docker push "%BACKEND_HUB%:%IMAGE_TAG%"
                                if errorlevel 1 goto :push_failed

                                docker push "%FRONTEND_HUB%:%IMAGE_TAG%"
                                if errorlevel 1 goto :push_failed

                                docker push "%BACKEND_HUB%:latest"
                                if errorlevel 1 goto :push_failed

                                docker push "%FRONTEND_HUB%:latest"
                                if errorlevel 1 goto :push_failed

                                docker logout
                                exit /b 0

                                :push_failed
                                docker logout
                                exit /b 1
                            '''
                        } finally {
                            bat '''
                                @echo off
                                if exist dockerhub-token.txt del /f /q dockerhub-token.txt
                            '''
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "Preparing deployment of ${IMAGE_TAG}..."

                withCredentials([
                    file(
                        credentialsId: 'eventlay-backend-env',
                        variable: 'BACKEND_ENV_FILE'
                    )
                ]) {
                    bat '''
                        @echo off
                        setlocal
                        set "TARGET_ENV=%WORKSPACE%\\backend\\.env"

                        if not exist "%BACKEND_ENV_FILE%" (
                            echo ERROR: Backend environment credential file is missing.
                            exit /b 1
                        )

                        if not exist "%WORKSPACE%\\backend" (
                            echo ERROR: Backend directory is missing.
                            exit /b 1
                        )

                        copy /Y "%BACKEND_ENV_FILE%" "%TARGET_ENV%" >nul
                        if errorlevel 1 (
                            echo ERROR: Could not prepare backend environment file.
                            exit /b 1
                        )

                        docker compose -f docker-compose.deploy.yml config --quiet
                        if errorlevel 1 goto :deploy_failed

                        docker pull "%BACKEND_HUB%:%IMAGE_TAG%"
                        if errorlevel 1 goto :deploy_failed

                        docker pull "%FRONTEND_HUB%:%IMAGE_TAG%"
                        if errorlevel 1 goto :deploy_failed

                        docker compose -f docker-compose.deploy.yml up -d --force-recreate
                        if errorlevel 1 goto :deploy_failed

                        echo Deployment command completed successfully.
                        goto :deploy_cleanup

                        :deploy_failed
                        echo ERROR: Deployment failed.
                        set "DEPLOY_EXIT=1"
                        goto :deploy_cleanup

                        :deploy_cleanup
                        if exist "%TARGET_ENV%" del /F /Q "%TARGET_ENV%"
                        if exist "%TARGET_ENV%" (
                            echo WARNING: Temporary environment file could not be removed.
                            exit /b 1
                        )

                        if defined DEPLOY_EXIT exit /b %DEPLOY_EXIT%
                        exit /b 0
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Waiting for the application to start...'

                bat '''
                    @echo off
                    set "HEALTH_OK="

                    for /L %%i in (1,1,12) do (
                        curl.exe -fsS http://127.0.0.1:5000/api/health >nul
                        if not errorlevel 1 (
                            set "HEALTH_OK=1"
                            goto :health_done
                        )
                        timeout /t 5 /nobreak >nul
                    )

                    :health_done
                    if not defined HEALTH_OK (
                        echo ERROR: Backend health check failed.
                        exit /b 1
                    )

                    echo Backend health check passed.

                    curl.exe -fsS http://127.0.0.1:8080/ -o nul
                    if errorlevel 1 (
                        echo ERROR: Frontend accessibility check failed.
                        exit /b 1
                    )

                    echo Frontend accessibility check passed.
                    docker compose -f docker-compose.deploy.yml ps
                '''

                echo "Deployment verified for image tag ${IMAGE_TAG}"
            }
        }
    }

    post {
        success {
            echo "SUCCESS: EventLay CI/CD pipeline completed. Image tag: ${IMAGE_TAG}"
            echo 'Backend: http://localhost:5000/api/health'
            echo 'Frontend: http://localhost:8080'
        }

        failure {
            echo "FAILURE: EventLay pipeline failed. Build: ${BUILD_NUMBER}"
            echo 'Check the first failed stage in Console Output.'
        }

        always {
            echo "Pipeline finished. Build number: ${BUILD_NUMBER}"
        }
    }
}
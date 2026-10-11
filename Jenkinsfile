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
                echo 'Verifying deployed EventLay application...'

                bat '''
                    @echo off
                    node -e "const http=require('http'); const urls=[{name:'Backend',url:'http://127.0.0.1:5000/api/health'},{name:'Frontend',url:'http://127.0.0.1:8080/'}]; let i=0; function check(){if(i>=urls.length){console.log('SUCCESS: Backend and frontend are accessible.');process.exit(0);}const item=urls[i++];const req=http.get(item.url,{timeout:5000},res=>{res.resume();console.log(item.name+' HTTP status: '+res.statusCode);if(res.statusCode>=200&&res.statusCode<400){check();}else{console.error(item.name+' verification failed');process.exitCode=1;}});req.on('timeout',()=>req.destroy(new Error('Request timed out')));req.on('error',err=>{console.error(item.name+' check failed: '+err.message);process.exitCode=1;});req.on('close',()=>{if(process.exitCode===1)process.exit(1);});}check();"
                    if errorlevel 1 exit /b 1
                '''

                echo "Deployment verified for image tag: ${IMAGE_TAG}"
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
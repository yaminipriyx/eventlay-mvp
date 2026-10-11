pipeline {
    agent any

    environment {
        DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'

        DOCKERHUB_USER = 'adithya3001'

        BACKEND_IMAGE = 'eventlay-mvp-backend'
        FRONTEND_IMAGE = 'eventlay-mvp-frontend'

        IMAGE_TAG = "build-${BUILD_NUMBER}"

        BACKEND_PORT = '5000'
        FRONTEND_PORT = '8080'
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

                bat '''
                    git log -1 --format="Commit: %%H %%s"
                '''
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
                    docker build ^
                      -t "%BACKEND_IMAGE%:%IMAGE_TAG%" ^
                      -f backend/Dockerfile backend

                    if errorlevel 1 exit /b 1

                    docker build ^
                      --build-arg VITE_API_BASE_URL=http://localhost:5000/api ^
                      -t "%FRONTEND_IMAGE%:%IMAGE_TAG%" ^
                      -f frontend/Dockerfile frontend

                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Docker Verification') {
            steps {
                echo 'Verifying the built Docker images...'

                bat '''
                    docker image inspect "%BACKEND_IMAGE%:%IMAGE_TAG%" >nul
                    if errorlevel 1 exit /b 1

                    docker image inspect "%FRONTEND_IMAGE%:%IMAGE_TAG%" >nul
                    if errorlevel 1 exit /b 1

                    docker images "%BACKEND_IMAGE%:%IMAGE_TAG%"
                    docker images "%FRONTEND_IMAGE%:%IMAGE_TAG%"
                '''
            }
        }

        stage('Tag Images for Docker Hub') {
            steps {
                echo 'Tagging images for Docker Hub...'

                bat '''
                    docker tag "%BACKEND_IMAGE%:%IMAGE_TAG%" "%DOCKERHUB_USER%/%BACKEND_IMAGE%:%IMAGE_TAG%"
                    if errorlevel 1 exit /b 1

                    docker tag "%FRONTEND_IMAGE%:%IMAGE_TAG%" "%DOCKERHUB_USER%/%FRONTEND_IMAGE%:%IMAGE_TAG%"
                    if errorlevel 1 exit /b 1

                    docker tag "%BACKEND_IMAGE%:%IMAGE_TAG%" "%DOCKERHUB_USER%/%BACKEND_IMAGE%:latest"
                    if errorlevel 1 exit /b 1

                    docker tag "%FRONTEND_IMAGE%:%IMAGE_TAG%" "%DOCKERHUB_USER%/%FRONTEND_IMAGE%:latest"
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                echo 'Pushing versioned images to Docker Hub...'

                withCredentials([
                    string(
                        credentialsId: 'dockerhub-eventlay-token',
                        variable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    script {
                        try {
                            writeFile(
                                file: 'dockerhub-token.txt',
                                text: env.DOCKERHUB_TOKEN
                            )

                            bat '''
                                @echo off
                                type dockerhub-token.txt | docker login --username "%DOCKERHUB_USER%" --password-stdin
                                if errorlevel 1 exit /b 1

                                docker push "%DOCKERHUB_USER%/%BACKEND_IMAGE%:%IMAGE_TAG%"
                                if errorlevel 1 goto push_failed

                                docker push "%DOCKERHUB_USER%/%FRONTEND_IMAGE%:%IMAGE_TAG%"
                                if errorlevel 1 goto push_failed

                                docker push "%DOCKERHUB_USER%/%BACKEND_IMAGE%:latest"
                                if errorlevel 1 goto push_failed

                                docker push "%DOCKERHUB_USER%/%FRONTEND_IMAGE%:latest"
                                if errorlevel 1 goto push_failed

                                docker logout
                                exit /b 0

                                :push_failed
                                docker logout
                                exit /b 1
                            '''
                        } finally {
                            if (fileExists('dockerhub-token.txt')) {
                                bat 'del /f /q dockerhub-token.txt'
                            }
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
                    script {
                        try {
                            bat '''
                                @echo off
                                copy /Y "%BACKEND_ENV_FILE%" "backend\\.env" >nul
                                if errorlevel 1 exit /b 1

                                docker compose -f docker-compose.deploy.yml config --quiet
                                if errorlevel 1 exit /b 1

                                docker compose -f docker-compose.deploy.yml pull
                                if errorlevel 1 exit /b 1

                                docker compose -f docker-compose.deploy.yml up -d --force-recreate
                                if errorlevel 1 exit /b 1

                                echo Deployment command completed successfully.
                            '''
                        } finally {
                            bat '''
                                @if exist "backend\\.env" del /f /q "backend\\.env"
                            '''
                        }
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployed EventLay application...'

                bat '''
                    @echo off
                    node -e "const http=require('http');const targets=[['Backend','http://127.0.0.1:5000/api/health'],['Frontend','http://127.0.0.1:8080/']];const wait=ms=>new Promise(r=>setTimeout(r,ms));const check=url=>new Promise((resolve,reject)=>{const q=http.get(url,{timeout:4000},res=>{res.resume();if(res.statusCode>=200&&res.statusCode<400)resolve(res.statusCode);else reject(new Error('HTTP '+res.statusCode));});q.on('timeout',()=>q.destroy(new Error('timeout')));q.on('error',reject);});(async()=>{for(const [name,url] of targets){let lastError=null;for(let attempt=1;attempt<=15;attempt++){try{console.log(name+' check attempt '+attempt);const status=await check(url);console.log(name+' HTTP '+status);lastError=null;break;}catch(e){lastError=e;console.log(name+' not ready: '+e.message);if(attempt<15)await wait(2000);}}if(lastError){console.error(name+' verification failed after retries: '+lastError.message);process.exitCode=1;return;}}console.log('SUCCESS: Backend and frontend are accessible.');})()"

                    if errorlevel 1 exit /b 1
                '''

                echo "Deployment verified for image tag: ${IMAGE_TAG}"

                bat '''
                    @echo off
                    echo Deployed backend image:
                    docker inspect --format="{{.Config.Image}}" eventlay-backend

                    echo Deployed frontend image:
                    docker inspect --format="{{.Config.Image}}" eventlay-frontend
                '''
            }
        }
    }

    post {
        success {
            echo "SUCCESS: EventLay CI/CD pipeline completed."
            echo "Build number: ${BUILD_NUMBER}"
            echo "Image tag: ${IMAGE_TAG}"
            echo 'Frontend URL: http://localhost:8080/'
            echo 'Backend health URL: http://localhost:5000/api/health'
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
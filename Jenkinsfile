pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "eventlay-mvp-backend:build-${BUILD_NUMBER}"
        FRONTEND_IMAGE = "eventlay-mvp-frontend:build-${BUILD_NUMBER}"
        BACKEND_HUB    = "adithya3001/eventlay-mvp-backend"
        FRONTEND_HUB   = "adithya3001/eventlay-mvp-frontend"
        IMAGE_TAG      = "build-${BUILD_NUMBER}"
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
                bat 'docker build -t %BACKEND_IMAGE% ./backend'

                bat 'docker build --build-arg VITE_API_BASE_URL=http://localhost:5000/api -t %FRONTEND_IMAGE% ./frontend'
            }
        }

        stage('Docker Verification') {
            steps {
                bat 'docker image inspect %BACKEND_IMAGE%'
                bat 'docker image inspect %FRONTEND_IMAGE%'
            }
        }

        stage('Tag Images for Docker Hub') {
            steps {
                bat 'docker tag %BACKEND_IMAGE% %BACKEND_HUB%:%IMAGE_TAG%'
                bat 'docker tag %FRONTEND_IMAGE% %FRONTEND_HUB%:%IMAGE_TAG%'

                bat 'docker tag %BACKEND_IMAGE% %BACKEND_HUB%:latest'
                bat 'docker tag %FRONTEND_IMAGE% %FRONTEND_HUB%:latest'
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

                    bat 'docker push %BACKEND_HUB%:%IMAGE_TAG%'
                    bat 'docker push %FRONTEND_HUB%:%IMAGE_TAG%'

                    bat 'docker push %BACKEND_HUB%:latest'
                    bat 'docker push %FRONTEND_HUB%:latest'

                    bat 'docker logout'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying image version ${IMAGE_TAG}..."

                // Pull both new images before replacing running containers.
                bat 'docker pull %BACKEND_HUB%:%IMAGE_TAG%'
                bat 'docker pull %FRONTEND_HUB%:%IMAGE_TAG%'

                // Replace the previous Compose-managed containers.
                // This is reached only after tests and image pushes succeed.
                bat 'docker rm -f eventlay-backend eventlay-frontend || exit /b 0'

                bat 'docker compose -f docker-compose.deploy.yml up -d'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Checking backend health endpoint...'

                powershell '''
                    $ErrorActionPreference = "Stop"
                    $healthy = $false

                    for ($i = 1; $i -le 12; $i++) {
                        try {
                            $response = Invoke-RestMethod `
                                -Uri "http://localhost:5000/api/health" `
                                -TimeoutSec 5

                            if ($response.status -eq "ok") {
                                Write-Host "Backend health check passed."
                                $response | ConvertTo-Json
                                $healthy = $true
                                break
                            }
                        } catch {
                            Write-Host "Backend not ready yet. Attempt $i of 12."
                        }

                        Start-Sleep -Seconds 5
                    }

                    if (-not $healthy) {
                        throw "Backend health verification failed."
                    }
                '''

                echo 'Checking frontend accessibility...'

                powershell '''
                    $ErrorActionPreference = "Stop"
                    $response = Invoke-WebRequest `
                        -Uri "http://localhost:8080" `
                        -TimeoutSec 10

                    if ($response.StatusCode -ne 200) {
                        throw "Frontend verification failed."
                    }

                    Write-Host "Frontend is accessible at http://localhost:8080"
                    Write-Host "HTTP status: $($response.StatusCode)"
                '''

                echo "Successfully deployed version ${IMAGE_TAG}"
                echo 'Application URL: http://localhost:8080'
            }
        }
    }

    post {
        success {
            echo 'EVENTLAY SPRINT 9 CI/CD: SUCCESS'
            echo "Deployed image version: ${IMAGE_TAG}"
            echo 'Application: http://localhost:8080'
        }

        failure {
            echo 'EVENTLAY SPRINT 9 CI/CD: FAILED'
            echo 'Check Console Output for the failed stage.'
        }

        always {
            echo "Pipeline result: ${currentBuild.currentResult}"
        }
    }
}

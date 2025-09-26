def DOCKER_IMAGE_NAME = "codelabs-ai-app"
def DOCKER_CONTAINER_NAME = "codelabs-ai-container"
def DOCKER_NETWORK_NAME = "codelabs-ai-network"

pipeline {
    agent any

    environment {
        PORT = '3010'
        HOST = 'localhost'

        // API Configuration
        NEXT_PUBLIC_API_URL = 'http://localhost:3001/api'
        NEXT_PUBLIC_SITE_URL = 'http://localhost:3010'

        // JWT Configuration
        JWT_SECRET = 'your-jwt-secret-key-here'
        NEXTAUTH_URL = 'http://localhost:3010'
        NEXTAUTH_SECRET = 'your-nextauth-secret-here'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from Git...'
                checkout scm
            }
        }

        stage('Debug - Check Files') {
            steps {
                script {
                    echo "Current directory contents:"
                    sh 'ls -la'
                    echo "Looking for Dockerfile:"
                    sh 'find . -name "Dockerfile" -type f'
                    echo "Looking for package.json:"
                    sh 'find . -name "package.json" -type f'
                }
            }
        }

        stage('Docker System Cleanup') {
            steps {
                script {
                    echo "Cleaning up Docker system..."
                    sh 'docker system prune -f'
                    sh 'docker builder prune -f'
                    sh 'docker image prune -a -f'
                    sh 'docker volume prune -f'
                }
            }
        }

        stage('Setup Network') {
            steps {
                script {
                    echo "Setting up Docker network: ${DOCKER_NETWORK_NAME}"
                    sh "docker network create ${DOCKER_NETWORK_NAME} || echo 'Network already exists'"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image..."
                    echo "Current working directory: \$(pwd)"

                    // Build with no cache to avoid corrupted layers
                    sh """
                        docker build --no-cache --pull \\
                        --build-arg NEXT_PUBLIC_API_URL=${env.NEXT_PUBLIC_API_URL} \\
                        --build-arg NEXT_PUBLIC_SITE_URL=${env.NEXT_PUBLIC_SITE_URL} \\
                        --build-arg JWT_SECRET=${env.JWT_SECRET} \\
                        --build-arg NEXTAUTH_URL=${env.NEXTAUTH_URL} \\
                        --build-arg NEXTAUTH_SECRET=${env.NEXTAUTH_SECRET} \\
                        -t ${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER} \\
                        .
                    """
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    echo "Deploying container: ${DOCKER_CONTAINER_NAME}"

                    sh "docker stop ${DOCKER_CONTAINER_NAME} || true"
                    sh "docker rm ${DOCKER_CONTAINER_NAME} || true"

                    sh """
                        docker run -d \\
                        --name ${DOCKER_CONTAINER_NAME} \\
                        -p ${env.PORT}:3000 \\
                        --restart always \\
                        -e NEXT_PUBLIC_API_URL=${env.NEXT_PUBLIC_API_URL} \\
                        -e NEXT_PUBLIC_SITE_URL=${env.NEXT_PUBLIC_SITE_URL} \\
                        -e JWT_SECRET=${env.JWT_SECRET} \\
                        -e NEXTAUTH_URL=${env.NEXTAUTH_URL} \\
                        -e NEXTAUTH_SECRET=${env.NEXTAUTH_SECRET} \\
                        --network ${DOCKER_NETWORK_NAME} \\
                        ${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Cleanup Old Images') {
            steps {
                script {
                    sh "docker image prune -f"
                    // Keep only last 3 builds
                    sh """
                        docker images ${DOCKER_IMAGE_NAME} --format 'table {{.Tag}}' | tail -n +2 | sort -nr | tail -n +4 | xargs -r docker rmi ${DOCKER_IMAGE_NAME}: || true
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Codelabs AI deployment completed successfully!'
        }

        failure {
            echo 'Codelabs AI deployment failed!'
            // Additional cleanup on failure
            sh 'docker system prune -f || true'
        }
    }
}
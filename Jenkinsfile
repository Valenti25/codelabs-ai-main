def DOCKER_IMAGE_NAME = "codelabs-ai-app"
def DOCKER_CONTAINER_NAME = "codelabs-ai-container"
def DOCKER_NETWORK_NAME = "codelabs-ai-network"

pipeline {
    agent any

    environment {
        PORT = '3010'
        HOST = 'localhost'
        NEXT_PUBLIC_SITE_URL = 'http://localhost:3010'
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from Git...'
                checkout scm
            }
        }

        stage('Verify Docker') {
            steps {
                script {
                    echo "Verifying Docker installation..."
                    sh '''
                        docker --version
                        docker info
                        echo "Docker is ready!"
                    '''
                }
            }
        }

        stage('Create Environment File') {
            steps {
                script {
                    echo "Creating environment configuration..."
                    sh '''
                        # สร้าง .env file
                        cat > .env << EOF
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
EOF
                        
                        echo "Environment file created:"
                        cat .env
                        
                        echo "Project structure:"
                        ls -la
                    '''
                }
            }
        }

        stage('Docker Cleanup') {
            steps {
                script {
                    echo "Cleaning up Docker system..."
                    sh '''
                        # ทำความสะอาดระบบ
                        docker system prune -f || true
                        
                        # หยุดและลบ container เก่า
                        docker stop ${DOCKER_CONTAINER_NAME} || true
                        docker rm ${DOCKER_CONTAINER_NAME} || true
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    
                    sh """
                        # Build image
                        docker build --no-cache \\
                        --build-arg NODE_ENV=production \\
                        --build-arg NEXT_PUBLIC_SITE_URL=${env.NEXT_PUBLIC_SITE_URL} \\
                        -t ${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER} \\
                        -t ${DOCKER_IMAGE_NAME}:latest \\
                        .
                        
                        echo "=== Build completed! ==="
                        docker images | grep ${DOCKER_IMAGE_NAME}
                    """
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    echo "Deploying application on port ${env.PORT}..."
                    
                    sh """
                        # สร้าง network
                        docker network create ${DOCKER_NETWORK_NAME} || echo 'Network already exists'
                        
                        # รัน container
                        docker run -d \\
                            --name ${DOCKER_CONTAINER_NAME} \\
                            -p ${env.PORT}:3000 \\
                            --restart unless-stopped \\
                            -e NODE_ENV=production \\
                            -e NEXT_PUBLIC_SITE_URL=${env.NEXT_PUBLIC_SITE_URL} \\
                            --network ${DOCKER_NETWORK_NAME} \\
                            ${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}
                        
                        echo "=== Container started! ==="
                        docker ps | grep ${DOCKER_CONTAINER_NAME}
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Performing health check..."
                    sh """
                        echo "Waiting for application to start..."
                        sleep 20
                        
                        echo "=== Container Status ==="
                        docker ps | grep ${DOCKER_CONTAINER_NAME}
                        
                        echo "=== Container Logs ==="
                        docker logs ${DOCKER_CONTAINER_NAME} --tail 30
                        
                        echo "=== Port Check ==="
                        netstat -tlnp | grep ${env.PORT} || echo "Port not ready yet"
                        
                        echo "=== HTTP Test ==="
                        timeout 30 bash -c 'until nc -z localhost ${PORT}; do echo "Waiting for port..."; sleep 2; done'
                        curl -I http://localhost:${env.PORT} || echo "HTTP check failed"
                        
                        echo "=== Health Check Complete ==="
                    """
                }
            }
        }

        stage('Cleanup Old Images') {
            steps {
                script {
                    echo "Cleaning up old images..."
                    sh """
                        # ลบ dangling images
                        docker image prune -f || true
                        
                        # เก็บแค่ 3 versions ล่าสุด
                        docker images ${DOCKER_IMAGE_NAME} --format "table {{.Tag}}" | tail -n +2 | sort -nr | tail -n +4 | xargs -r -I {} docker rmi ${DOCKER_IMAGE_NAME}:{} || true
                        
                        echo "=== Current Images ==="
                        docker images | grep ${DOCKER_IMAGE_NAME} || echo "No images found"
                    """
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Deployment completed successfully!'
            script {
                sh """
                    echo "================================"
                    echo "🚀 Codelabs AI is running!"
                    echo "📍 URL: http://localhost:${env.PORT}"
                    echo "🐳 Container: ${DOCKER_CONTAINER_NAME}"
                    echo "🏷️  Image: ${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    echo "================================"
                    
                    echo "=== Final Status ==="
                    docker ps | grep ${DOCKER_CONTAINER_NAME}
                """
            }
        }

        failure {
            echo '❌ Deployment failed!'
            script {
                sh '''
                    echo "=== Debug Information ==="
                    
                    echo "Docker version:"
                    docker --version || echo "Docker not available"
                    
                    echo "Container logs:"
                    docker logs ${DOCKER_CONTAINER_NAME} --tail 50 || echo "No container logs"
                    
                    echo "Running containers:"
                    docker ps -a
                    
                    echo "Available images:"
                    docker images
                    
                    echo "Network info:"
                    docker network ls
                    
                    # Cleanup on failure
                    docker system prune -f || true
                '''
            }
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
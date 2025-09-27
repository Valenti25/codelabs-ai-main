def DOCKER_IMAGE_NAME = "codelabs-ai-app"
def DOCKER_CONTAINER_NAME = "codelabs-ai-container"
def DOCKER_NETWORK_NAME = "codelabs-ai-network"

pipeline {
    agent any

    environment {
        PORT = '3010'
        NEXT_PUBLIC_SITE_URL = 'http://localhost:3010'
        NODE_ENV = 'production'
    }

    stages {
        stage('Preparation') {
            parallel {
                stage('Checkout') {
                    steps {
                        checkout scm
                    }
                }
                stage('Install Tools') {
                    steps {
                        sh 'apt-get update -qq && apt-get install -y netcat-openbsd curl'
                    }
                }
            }
        }

        stage('Environment Setup') {
            steps {
                sh '''
                    cat > .env << EOF
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
EOF
                    echo "Environment ready"
                '''
            }
        }

        stage('Docker Operations') {
            steps {
                sh """
                    # Cleanup
                    docker stop ${DOCKER_CONTAINER_NAME} || true
                    docker rm ${DOCKER_CONTAINER_NAME} || true
                    docker system prune -f || true
                    
                    # Build
                    docker build --no-cache \\
                        --build-arg NODE_ENV=production \\
                        --build-arg NEXT_PUBLIC_SITE_URL=${env.NEXT_PUBLIC_SITE_URL} \\
                        -t ${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER} \\
                        -t ${DOCKER_IMAGE_NAME}:latest .
                    
                    # Deploy
                    docker network create ${DOCKER_NETWORK_NAME} || true
                    docker run -d \\
                        --name ${DOCKER_CONTAINER_NAME} \\
                        -p ${env.PORT}:3000 \\
                        --restart unless-stopped \\
                        -e NODE_ENV=production \\
                        -e NEXT_PUBLIC_SITE_URL=${env.NEXT_PUBLIC_SITE_URL} \\
                        --network ${DOCKER_NETWORK_NAME} \\
                        ${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}
                """
            }
        }

        stage('Health Check') {
            steps {
                sh """
                    echo "Waiting for application..."
                    sleep 15
                    
                    # Check container status
                    docker ps | grep ${DOCKER_CONTAINER_NAME}
                    
                    # Test connection
                    for i in {1..10}; do
                        if nc -z localhost ${env.PORT}; then
                            echo "Application is ready!"
                            break
                        fi
                        sleep 2
                    done
                    
                    # HTTP test
                    HTTP_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${env.PORT} || echo "000")
                    echo "HTTP Status: \$HTTP_STATUS"
                    
                    if [ "\$HTTP_STATUS" = "200" ]; then
                        echo "Health check passed!"
                    else
                        echo "Warning: HTTP returned \$HTTP_STATUS"
                    fi
                """
            }
        }

        stage('Cleanup') {
            steps {
                sh """
                    # Remove old images (keep last 3)
                    docker image prune -f || true
                    docker images ${DOCKER_IMAGE_NAME} --format "table {{.Tag}}" | \\
                        tail -n +2 | sort -nr | tail -n +4 | \\
                        xargs -r -I {} docker rmi ${DOCKER_IMAGE_NAME}:{} || true
                """
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully!'
            sh """
                echo "App running at: http://localhost:${env.PORT}"
                docker ps | grep ${DOCKER_CONTAINER_NAME}
            """
        }
        
        failure {
            echo 'Deployment failed!'
            sh """
                echo "Debug info:"
                docker logs ${DOCKER_CONTAINER_NAME} --tail 20 || true
                docker ps -a
            """
        }
        
        always {
            sh 'echo "Build ${BUILD_NUMBER} completed at $(date)"'
        }
    }
}
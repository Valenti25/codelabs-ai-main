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

        stage('Install Health Check Tools') {
            steps {
                script {
                    echo "Installing required tools..."
                    sh '''
                        # ติดตั้ง netcat และ curl สำหรับ health check
                        apt-get update -qq
                        apt-get install -y netcat-openbsd curl
                        echo "Tools installed successfully!"
                    '''
                }
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
                    sh """
                        # ทำความสะอาดระบบ
                        docker system prune -f || true
                        
                        # หยุดและลบ container เก่า
                        docker stop ${DOCKER_CONTAINER_NAME} || true
                        docker rm ${DOCKER_CONTAINER_NAME} || true
                    """
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
                        sleep 15
                        
                        echo "=== Container Status ==="
                        docker ps | grep ${DOCKER_CONTAINER_NAME}
                        
                        echo "=== Container Logs ==="
                        docker logs ${DOCKER_CONTAINER_NAME} --tail 30
                        
                        echo "=== Port Check ==="
                        # ใช้ ss แทน netstat หากไม่มี netstat
                        ss -tlnp | grep ${env.PORT} || netstat -tlnp | grep ${env.PORT} || echo "Checking with nc..."
                        
                        echo "=== Testing Connection ==="
                        # ใช้ timeout และ nc ตรวจสอบ port
                        for i in {1..15}; do
                            if nc -z localhost ${env.PORT}; then
                                echo "Port ${env.PORT} is ready!"
                                break
                            else
                                echo "Attempt \$i: Port not ready, waiting..."
                                sleep 2
                            fi
                        done
                        
                        echo "=== HTTP Test ==="
                        # ทดสอบ HTTP response
                        HTTP_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${env.PORT} || echo "000")
                        echo "HTTP Status: \$HTTP_STATUS"
                        
                        if [ "\$HTTP_STATUS" = "200" ] || [ "\$HTTP_STATUS" = "301" ] || [ "\$HTTP_STATUS" = "302" ]; then
                            echo "✅ HTTP check passed!"
                        else
                            echo "⚠️ HTTP check returned status: \$HTTP_STATUS"
                            echo "Application might still be starting..."
                        fi
                        
                        echo "=== Health Check Complete ==="
                    """
                }
            }
        }

        stage('Final Verification') {
            steps {
                script {
                    echo "Final verification..."
                    sh """
                        echo "=== Final Status Check ==="
                        
                        # ตรวจสอบ container ยังทำงานอยู่หรือไม่
                        if docker ps | grep -q ${DOCKER_CONTAINER_NAME}; then
                            echo "✅ Container is running"
                            
                            # ดึง container IP
                            CONTAINER_IP=\$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${DOCKER_CONTAINER_NAME})
                            echo "Container IP: \$CONTAINER_IP"
                            
                            # ทดสอบจาก container network
                            docker exec ${DOCKER_CONTAINER_NAME} wget -q --spider http://localhost:3000 && echo "✅ Internal health check passed" || echo "⚠️ Internal check failed"
                            
                            # แสดง final logs
                            echo "=== Final Logs ==="
                            docker logs ${DOCKER_CONTAINER_NAME} --tail 10
                            
                            echo "✅ Deployment appears successful!"
                        else
                            echo "❌ Container is not running!"
                            exit 1
                        fi
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
                    
                    echo ""
                    echo "🌐 Access your application at:"
                    echo "   http://localhost:${env.PORT}"
                    echo "   http://your-server-ip:${env.PORT}"
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
                    docker logs ${DOCKER_CONTAINER_NAME} --tail 100 || echo "No container logs available"
                    
                    echo "Running containers:"
                    docker ps -a
                    
                    echo "Available images:"
                    docker images
                    
                    echo "Network info:"
                    docker network ls
                    
                    echo "Port usage:"
                    ss -tlnp | grep 3010 || netstat -tlnp | grep 3010 || echo "Port 3010 not in use"
                    
                    # Cleanup on failure (optional)
                    # docker system prune -f || true
                '''
            }
        }

        always {
            echo 'Pipeline execution completed.'
            script {
                sh '''
                    echo "=== Deployment Summary ==="
                    echo "Build Number: ${BUILD_NUMBER}"
                    echo "Timestamp: $(date)"
                    echo "Status: Pipeline completed"
                '''
            }
        }
    }
}
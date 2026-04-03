pipeline {
    agent any

    tools {
        nodejs 'Node18'           // Jenkins NodeJS tool
        jdk 'JDK25'               // Only if needed for SonarQube
    }

    environment {
        DOCKER_IMAGE = "akramsyed8046/devops-html-app:latest"
        DOCKER_CREDENTIALS = "docker-hub"
        SONARQUBE_ENV = "sonarqube"
        NEXUS_TOKEN = credentials('nexus-token')
        NEXUS_REPO = "http://3.110.170.36:8081/repository/raw-repo/"
        PATH = "${tool 'Node18'}/bin:${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/akramsyed8046/Devops-html-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                if [ -f package.json ]; then
                    npm install
                else
                    echo "No package.json found, skipping install"
                fi
                '''
            }
        }

        stage('Build Project') {
            steps {
                sh '''
                if npm run | grep -q "build"; then
                    npm run build
                else
                    echo "No build script found, skipping"
                fi
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    sh "${tool 'SonarQube-Scanner'}/bin/sonar-scanner \
                       -Dsonar.projectKey=devops-html-app \
                       -Dsonar.sources=src"
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Publish to Nexus (Raw)') {
            steps {
                script {
                    // Upload build folder contents to Nexus raw repo
                    sh """
                    for file in dist/*; do
                        curl -u admin:${NEXUS_TOKEN} --upload-file \$file ${NEXUS_REPO}\$(basename \$file)
                    done
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                withDockerRegistry([credentialsId: "${DOCKER_CREDENTIALS}", url: 'https://index.docker.io/v1/']) {
                    sh "docker push ${DOCKER_IMAGE}"
                }
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                docker rm -f devops-html-app || true
                docker run -d --name devops-html-app -p 8087:80 ${DOCKER_IMAGE}
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully ✅"
        }
        failure {
            echo "Pipeline failed ❌"
        }
    }
}

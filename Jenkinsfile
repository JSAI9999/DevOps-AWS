pipeline {
    agent any
    tools {
        nodejs 'Node18'
        jdk 'JDK21'
    }
    environment {
        DOCKER_IMAGE = "shivadocker2997/devops-html-app:latest"
        DOCKER_CREDENTIALS = "Docker_cred"
        SONARQUBE_ENV = "sonarqube_cred"
        NEXUS_REPO = "http://18.215.153.18:8081/repository/raw-repo/"
        PATH = "${tool 'Node18'}/bin:${env.PATH}"
        KUBECONFIG_PATH = "/var/lib/jenkins/.kube/config"
        AWS_REGION          = "us-east-1"        // ← add your region
        EKS_CLUSTER         = "mycluster" // ← add your cluster name
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/shivaprabha2997/DevOps-AWS.git'
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
                    sh "${tool 'sonar-scanner'}/bin/sonar-scanner \
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
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-credentials',
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh '''
                    VERSION=$(node -p "require('./package.json').version")
                    ARTIFACT="devops-html-app-${VERSION}.zip"

                    mv devops-html-app.zip $ARTIFACT

                    curl -u "$NEXUS_USER:$NEXUS_PASS" \
                         --upload-file "$ARTIFACT" \
                         "${NEXUS_REPO}${ARTIFACT}"

                    echo "Artifact $ARTIFACT uploaded to Nexus successfully"
                    '''
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
        withCredentials([usernamePassword(
            credentialsId: "${DOCKER_CREDENTIALS}",
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
        )]) {
            sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push shivadocker2997/devops-html-app:latest
            docker logout
            '''
           }
            }
        }
        stage('Run Docker Container') {
            steps {
                sh '''
              docker stop devopscont25 || true
              docker rm devopscont25 || true

                # Run new container
                docker run -itd  --name devopscont25 -p 8025:80 shivadocker2997/devops-html-app:latest
                echo "Container is running at http://<your-server-ip>:8025"
                '''
            }}
        
        stage('Configure AWS EKS') {
            steps {
                sh """
                aws eks --region ${AWS_REGION} update-kubeconfig --name ${EKS_CLUSTER}
                export KUBECONFIG=${KUBECONFIG_PATH}
                kubectl get nodes
                """
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                sh """
                export KUBECONFIG=${KUBECONFIG_PATH}
                kubectl apply -f deployment.yaml
                kubectl rollout status deployment deployment.yaml
                """
            }
        }
    }
}

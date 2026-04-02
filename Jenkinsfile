pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "akramsyed8046/devops-html-app:latest"
        DOCKER_CREDENTIALS = "docker-hub" // Jenkins credentials ID for Docker Hub
    }

    stages {

        // 1️⃣ Clone the repository
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/akramsyed8046/Devops-html-app.git'
            }
        }

        // 2️⃣ Install dependencies (optional for static HTML)
        stage('Install Dependencies') {
            steps {
                sh 'npm install || echo "No package.json found, skipping install"'
            }
        }

        // 3️⃣ Build project
        stage('Build Project') {
            steps {
                sh 'npm run build || echo "No build script found, skipping"'
            }
        }

        // 4️⃣ Prepare artifact
        stage('Prepare Artifact') {
            steps {
                sh 'mkdir -p artifact'
                sh 'zip -r artifact/devops-html-app.zip src/'
            }
        }

        // 5️⃣ Archive artifact in Jenkins
        stage('Archive Artifact') {
            steps {
                archiveArtifacts artifacts: 'artifact/devops-html-app.zip', fingerprint: true
            }
        }

        // 6️⃣ Docker build
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        // 7️⃣ Docker push
        stage('Push Docker Image') {
            steps {
                withDockerRegistry([credentialsId: "${DOCKER_CREDENTIALS}", url: 'https://index.docker.io/v1/']) {
                    sh "docker push ${DOCKER_IMAGE}"
                }
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
        // Optionally clean workspace if you want
        // always {
        //     cleanWs()
        // }
    }
}

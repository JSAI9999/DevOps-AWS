pipeline {
    agent any

    tools {
        maven 'maven3'       // Required for Maven deploy & SonarQube
        jdk 'JDK25'          // Jenkins JDK
        nodejs 'Node18'      // Jenkins NodeJS tool
    }

    environment {
        DOCKER_IMAGE = "akramsyed8046/devops-html-app:latest"
        DOCKER_CREDENTIALS = "docker-hub"       
        SONARQUBE_ENV = "sonarqube"             
        NEXUS_TOKEN = credentials('nexus-token') 
        NEXUS_REPO = "http://3.110.170.36:8081/repository/maven-releases/"
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
                npm install || echo "No package.json found, skipping install"
                '''
            }
        }

        stage('Build Project') {
            steps {
                sh 'npm run build || echo "No build script found, skipping"'
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

        stage('Prepare Artifact') {
            steps {
                sh 'mkdir -p artifact'
                sh 'zip -r artifact/devops-html-app.zip src/'
            }
        }

        stage('Archive Artifact') {
            steps {
                archiveArtifacts artifacts: 'artifact/devops-html-app.zip', fingerprint: true
            }
        }

        stage('Publish to Nexus') {
            steps {
                script {
                    // Read version from package.json
                    def version = sh(script: "node -p \"require('./package.json').version\"", returnStdout: true).trim()

                    // Deploy using Maven
                    sh """
                    mvn deploy:deploy-file \
                      -Dfile=artifact/devops-html-app.zip \
                      -DgroupId=com.akram \
                      -DartifactId=devops-html-app \
                      -Dversion=${version} \
                      -Dpackaging=zip \
                      -DrepositoryId=nexus-releases \
                      -Durl=${NEXUS_REPO} \
                      -DgeneratePom=true
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

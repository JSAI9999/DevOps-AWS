pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
               git branch: 'main', url: 'https://github.com/akramsyed8046/Devops-html-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t devops-html-app .'
            }
        }

        stage('Run Docker Container') {
            steps {
                sh 'docker run -d -p 4000:80 --name html-container devops-html-app'
            }
        }

    }
}

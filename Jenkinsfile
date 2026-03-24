pipeline {
    agent any

    environment {
        EMAIL = "akramsyed8046@gmail.com"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/akramsyed8046/Devops-html-app.git'
            }
            post {
                success {
                    emailext subject: "✅ Clone SUCCESS",
                    body: "Repository cloned successfully.",
                    to: "${EMAIL}"
                }
                failure {
                    emailext subject: "❌ Clone FAILED",
                    body: "Repository cloning failed.",
                    to: "${EMAIL}"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                    kubectl get nodes
                    kubectl apply -f deployment.yaml
                    kubectl apply -f service.yaml
                    kubectl apply -f ingress.yaml
                    '''
                }
            }
            post {
                success {
                    emailext subject: "✅ Deployment SUCCESS",
                    body: "Application deployed to Kubernetes successfully.",
                    to: "${EMAIL}"
                }
                failure {
                    emailext subject: "❌ Deployment FAILED",
                    body: "Kubernetes deployment failed. Check logs.",
                    to: "${EMAIL}"
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                    kubectl get pods -o wide
                    kubectl get svc
                    kubectl get ingress
                    '''
                }
            }
            post {
                success {
                    emailext subject: "✅ Verification SUCCESS",
                    body: "Pods, services, and ingress are running successfully.",
                    to: "${EMAIL}"
                }
                failure {
                    emailext subject: "❌ Verification FAILED",
                    body: "Verification failed. Check Kubernetes resources.",
                    to: "${EMAIL}"
                }
            }
        }
    }
}

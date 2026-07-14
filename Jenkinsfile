pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    some-label: jenkins-agent
spec:
  containers:
  - name: maven
    image: maven:3.8.1-openjdk-17
    command:
    - cat
    tty: true
  - name: docker
    image: docker:latest
    command:
    - cat
    tty: true
'''
        }
    }
    stages {
        stage('Build') {
            steps {
                container('maven') {
                    sh 'mvn -version'
                }
            }
        }
        stage('Test') {
            steps {
                container('maven') {
                    sh 'echo "Running tests..."'
                }
            }
        }
    }
}

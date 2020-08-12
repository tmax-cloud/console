pipeline {
  agent any
  stages {
    stage('Build') {
      agent any
      environment {
        DOCKER_TAG = '0.0.0.0'
      }
      steps {
        echo 'Start Build Step'
        sh './push-jenkins.sh'
        echo 'End Build Step'
      }
    }

  }
}
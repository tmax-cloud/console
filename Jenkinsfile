pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        echo 'Start Build Step'
        sh './push-jenkins.sh'
        echo 'End Build Step'
      }
    }

  }
}
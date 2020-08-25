//input 'Is it OK? \n MAJOR_VERSION=4, MINOR_VERSION=1, PATCH_VERSION=${env.BUILD_NUMBER}, HOTFIX_VERSION=3'
// Script Pipeline 
// def CHOICE = input message: 'choice your cloud', 
  // parameters: [choice(choices: ['kubernetes','196'],
  // description: 'need to specify where deploy console app', name: 'Cloud option')]
// def CHOICE = "kubernetes"
// def MAJOR_VERSION = "4"
// def MINOR_VERSION = "1"
def CHOICE = "${params.choice}"
def MAJOR_VERSION = "${params.major_version}"
def MINOR_VERSION = "${params.minor_version}"
def PATCH_VERSION = "2"
def HOTFIX_VERSION = "test"
def DOCKER_REGISTRY = "tmaxcloudck"
def PRODUCT = "hypercloud-console"
def VER = "${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}.${HOTFIX_VERSION}"
def PRE_VER = "${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}.${HOTFIX_VERSION}"
// def VER = "1.1.38.1"
def REALM = "${params.realm}"
def KEYCLOAK = "${params.keycloak}"
def CLIENTID = "${params.clientid}"
def BRANCH = "hc-dev-jenkins-test"
 
// k8s environment 
def NAME_NS = "console-test"
def NODE_PORT = "31333"
def HDC_FLAG = "false"
def PORTAL = "false"

podTemplate(cloud: "${CHOICE}", containers: [
//   podTemplate(containers: [
// // podTemplate(cloud: 'kubernetes', containers: [
    containerTemplate(name: 'docker', image: 'docker', command: 'cat', ttyEnabled: true),
    containerTemplate(name: 'kubectl', image: 'lachlanevenson/k8s-kubectl:v1.18.3', command: 'cat', ttyEnabled: true),
    // containerTemplate(name: 'ssh-client', image: 'kroniak/ssh-client', command: 'cat', ttyEnabled: true),
],
volumes: [
  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
]) {
  node(POD_LABEL) {
    def myRepo = checkout scm
    def gitBranch = myRepo.GIT_BRANCH 

    stage('Input'){
      sh "echo 'INSTALL TO ${CHOICE}'"
      sh "echo 'PRODUCT=${PRODUCT}'"
      sh "echo 'VERSION=${VER}'"
      sh "echo 'PREVIOUS_VERSION=${PRE_VER}'"
    }

    // stage('Docker Build'){
    //   container('docker'){
    //     withCredentials([usernamePassword(
    //       credentialsId: 'tmaxcloudck', 
    //       usernameVariable: 'DOCKER_USER',
    //       passwordVariable: 'DOCKER_PWD')]){
    //       sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PWD}"
    //       sh "docker build -t ${DOCKER_REGISTRY}/${PRODUCT}:${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}.${HOTFIX_VERSION} -f ./Dockerfile.jenkins ."
    //       sh "docker push ${DOCKER_REGISTRY}/${PRODUCT}:${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}.${HOTFIX_VERSION}"
    //       }
    //   }
    // }
    
    stage('K8S Deploy'){
      container('kubectl'){     
        sh "sed -i 's#@@NAME_NS@@#${NAME_NS}#g' ./install-yaml/*.yaml"
        sh "cat ./install-yaml/1.initialization.yaml"
        sh "sed -i 's#@@NODE_PORT@@#${NODE_PORT}#g' ./install-yaml/2.svc-np.yaml"
        sh "cat ./install-yaml/2.svc-np.yaml"
        
        sh "sed -i 's#@@REALM@@#${REALM}#g' ./install-yaml/3.deployment-pod.yaml "
        sh "sed -i 's#@@KEYCLOAK@@#${KEYCLOAK}#g' ./install-yaml/3.deployment-pod.yaml "
        sh "sed -i 's#@@CLIENTID@@#${CLIENTID}#g' ./install-yaml/3.deployment-pod.yaml "
        sh "sed -i 's#@@VER@@#${VER}#g' ./install-yaml/3.deployment-pod.yaml "
        sh "sed -i '/--hdc-mode=/d' ./install-yaml/3.deployment-pod.yaml"
        sh "sed -i '/--tmaxcloud-portal=/d' ./install-yaml/3.deployment-pod.yaml"
        sh "cat ./install-yaml/3.deployment-pod.yaml"
        sh "kubectl apply -f ./install-yaml/1.initialization.yaml"
        // sh "secret=$(kubectl get secret console-https-secret -n ${NAME_NS})"

        secret = sh (
          script: 'kubectl get secret console-https-secret -n "${NAME_NS}"',
          returnStdout: true
        ).trim()
        sh """
        if [ -z "${secret}" ]; then
          kubectl create secret tls console-https-secret --cert=tls/tls.crt --key=tls/tls.key -n ${NAME_NS}
        fi
        """
        // try {
        //     sh "kubectl create secret tls console-https-secret --cert=tls/tls.crt --key=tls/tls.key -n ${NAME_NS}"
        // } catch {
        //   sh "echo Error from server (AlreadyExists): secrets console-https-secret already exists"
        // }
        sh "kubectl apply -f ./install-yaml/2.svc-lb.yaml"
        sh "kubectl apply -f ./install-yaml/2.svc-np.yaml"
        sh "kubectl apply -f ./install-yaml/3.deployment.yaml"
        // sh "kubectl apply -f ./install-yaml/3.deployment-pod.yaml"
      }
    }

    stage('GIT Commit & Push'){
      withCredentials([usernamePassword(credentialsId: 'jinsoo-youn', usernameVariable: 'username', passwordVariable: 'password')]) {      
        sh """
          git config --global user.name ${username}
          git config --global user.email jinsoo_youn@tmax.co.kr
          git config --global credential.username ${username}
          git config --global credential.helper "!echo password=${password}; echo"          
        """

        sh """
          echo '# hypercloud-console patch note' > CHANGELOG_${PRODUCT}_${VER}.md
          echo '## [Product Name]_[major].[minor].[patch].[hotfix]' >> CHANGELOG_${PRODUCT}_${VER}.md
          echo 'Version: ${PRODUCT}_${VER}' >> CHANGELOG_${PRODUCT}_${VER}.md
          date '+%F  %r' >> CHANGELOG_${PRODUCT}_${VER}.md

          git log --grep=[patch] -F --all-match --no-merges --date-order --reverse \
          --pretty=format:"- %s (%cn) %n    Message: %b" \
          --simplify-merges -10 \
          >> CHANGELOG_${PRODUCT}_${VER}.md
        """
        sh "git add -A"
        sh "git commit -m 'build ${PRODUCT}_${VER}' "
        sh "git tag ${VER}"
        sh "git push origin HEAD:${BRANCH} --tags"        

      }
    }


  }
}

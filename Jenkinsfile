pipeline {
  parameters {
    choice(name: 'BUILD_MODE', choices:['PATCH','HOTFIX','IMAGE'], description: 'Select the mode you want to act')
  }
  triggers {
    // ref https://plugins.jenkins.io/parameterized-scheduler/
    // trigger at 9:00 every Thursday
    parameterizedCron('''
    H 21 * * 4 %BUILD_MODE=PATCH
    ''')
  }
  agent any
  environment {
    BRANCH = "master"
    BUILD_MODE = "${params.BUILD_MODE}"

    // DOCKER_REGISTRY="tmaxcloudck"
    DOCKER_REGISTRY="hyperregistry.tmaxcloud.org/ck3-2"
    PRODUCT = "hypercloud-console"
    MAJOR_VER="5"
    MINOR_VER="2"
    PATCH_VER="0"
    HOTFIX_VER="0"
    VER = "${MAJOR_VER}.${MINOR_VER}.${PATCH_VER}.${HOTFIX_VER}"

    // GUIDE_URL = "https://github.com/tmax-cloud/install-console/blob/5.0/README.md"
    GUIDE_URL = "https://github.com/tmax-cloud/charts/blob/main/charts/console/README.md"
    CHANGELOG_SERVER = "https://github.com/tmax-cloud/console/blob/master/CHANGELOG/CHANGELOG-SERVER.md"

    USER_TOKEN = "hyowook-access-token"
    USER_NAME = "hyowook_park"
    USER_EMAIL = "hyowook_park@tmax.co.kr"
  }
  stages {
    // When using SCM, the checkout stage can be completely omitted 
    stage('Git') {
      steps {
        git branch: "${BRANCH}", credentialsId: "${USER_NAME}", url: 'https://github.com/tmax-cloud/console.git'
        sh """
        git branch
        git pull origin ${BRANCH}:${BRANCH}
        """
         script {
            PATCH_VER = sh(script: 'cat ./CHANGELOG/tag.txt | head -2 | tail -1 | cut --delimiter="." --fields=3', returnStdout: true).trim()
            HOTFIX_VER = sh(script: 'cat ./CHANGELOG/tag.txt | head -2 | tail -1 | cut --delimiter="." --fields=4', returnStdout: true).trim()
          if (BUILD_MODE == 'PATCH') {
            def number = (PATCH_VER as int) + 1
            PATCH_VER = number.toString()
            HOTFIX_VER = "0"
            VER = "${MAJOR_VER}.${MINOR_VER}.${PATCH_VER}.${HOTFIX_VER}"
          } else if (BUILD_MODE == 'HOTFIX') {
            def hotfix_number = (HOTFIX_VER as int) + 1
            HOTFIX_VER = hotfix_number.toString()
            VER = "${MAJOR_VER}.${MINOR_VER}.${PATCH_VER}.${HOTFIX_VER}"
          }
        }
          sh """
            git config --global user.name ${USER_NAME}
            git config --global user.email ${USER_EMAIL}
          """
          sh """
          git tag ${VER}
          echo "Console Version History" > ./CHANGELOG/tag.txt
          git tag --list "5.2.*" --sort=-version:refname >> ./CHANGELOG/tag.txt
          """
      }
    }

    stage('Build') {
      steps{
        withCredentials([usernamePassword(
            credentialsId: 'hyperregistry',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PWD')]){
            sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PWD}"
            sh "docker build -t ${DOCKER_REGISTRY}/${PRODUCT}:${VER} -f ./Dockerfile ."
            sh "docker push ${DOCKER_REGISTRY}/${PRODUCT}:${VER}"
          }
      }
    }

    stage('Changelog'){
      when {
        anyOf {
          environment name: 'BUILD_MODE', value: 'PATCH'
          environment name: 'BUILD_MODE', value: 'HOTFIX'
        }
      }
      steps {
        script {
          if (BUILD_MODE == 'PATCH') {
            def number = (PATCH_VER as int) -1
            PATCH_VER = number.toString()
            HOTFIX_VER = "0"
            PRE_VER = "${MAJOR_VER}.${MINOR_VER}.${PATCH_VER}.${HOTFIX_VER}"
          } else if (BUILD_MODE == 'HOTFIX') {
            def hotfix_number = (HOTFIX_VER as int) - 1
            HOTFIX_VER = hotfix_number.toString()
            PRE_VER = "${MAJOR_VER}.${MINOR_VER}.${PATCH_VER}.${HOTFIX_VER}"
          }
        }
          sh """
            git config --global user.name ${USER_NAME}
            git config --global user.email ${USER_EMAIL}
          """
          sh """
            echo "# ${PRODUCT}_${VER} Patch Note" > ./CHANGELOG/CHANGELOG-${VER}.md
            echo "" >> ./CHANGELOG/CHANGELOG-${VER}.md
            echo "Version Info: ${VER} ([ major ].[ minor ].[ patch ].[ hotfix ])" >> ./CHANGELOG/CHANGELOG-${VER}.md
            echo "Released Time: \$(TZ=Asia/Seoul date '+%F %H:%M:%S')" >> ./CHANGELOG/CHANGELOG-${VER}.md
            echo "" >> ./CHANGELOG/CHANGELOG-${VER}.md
            git log ${PRE_VER}..${VER} --grep=[patch] -F --all-match --no-merges --simplify-merges \
            --date-order --reverse --date=format:'%Y-%m-%d' \
            --pretty=format:'- %ad %s (by %cn) %n    Note: %b' >> ./CHANGELOG/CHANGELOG-${VER}.md
            echo "" >> ./CHANGELOG/CHANGELOG-${VER}.md
            sed -i "s/\\[patch\\]//g" ./CHANGELOG/CHANGELOG-${VER}.md
            sed -i "/^    Note: \$/d" ./CHANGELOG/CHANGELOG-${VER}.md
          """
      }
    }

    stage('Email'){
      when {
        anyOf {
          environment name: 'BUILD_MODE', value: 'PATCH'
          environment name: 'BUILD_MODE', value: 'HOTFIX'
        }
      }
      steps {
        withCredentials([string(credentialsId: "${USER_TOKEN}", variable: 'GITHUB_ACCESS_TOKEN')]) { 
          sh """
            git push https://${GITHUB_ACCESS_TOKEN}@github.com/tmax-cloud/console.git HEAD:${BRANCH} --tags
            git add -A
            git commit -m 'Added changelog and updated history'
            git push https://${GITHUB_ACCESS_TOKEN}@github.com/tmax-cloud/console.git HEAD:${BRANCH}
          """        
        }
        emailext (
          to: 'ck_platformqa@tmax.co.kr, ck_rnd1_unit@tmax.co.kr, ck_rnd2_unit@tmax.co.kr, ck_rnd3_4@tmax.co.kr',
          subject: "[${PRODUCT}] Release Update - ${PRODUCT}:${VER}", 
          attachmentsPattern: "**/CHANGELOG/CHANGELOG-${VER}.md",
          body: "안녕하세요. \n\n${PRODUCT} Release Update 입니다. \n\n [필독] 5.2.11.0 버전부터 console의 변수 값 설정이 변경 되었습니다." +
          "\n\n 변경 사항 파일로 첨부합니다. \n\n 감사합니다.\n\n" +
                "※ 이미지 : ${DOCKER_REGISTRY}/${PRODUCT}:${VER} \n\n※ 설치 가이드 : ${GUIDE_URL} 변경 사항: ${CHANGELOG_SERVER}",
          mimeType: 'text/plain'  
        )
      }
    }

    stage('Deploy'){
      when {
        anyOf {
          environment name: 'BUILD_MODE', value: 'PATCH'
          environment name: 'BUILD_MODE', value: 'HOTFIX'
        }     
      }
      steps {
        sh """
          cp -r ./deploy/values-ck1-1.link.yaml.temp ./deploy/values-ck1-1.link.yaml
          sed -i "s/@@VER@@/${VER}/g" ./deploy/values-ck1-1.link.yaml
          cp -r ./deploy/values-tmaxcloud.org.yaml.tmp ./deploy/values-tmaxcloud.org.yaml
          sed -i "s/@@VER@@/${VER}/g" ./deploy/values-tmaxcloud.org.yaml
        """
        withCredentials([string(credentialsId: "${USER_TOKEN}", variable: 'GITHUB_ACCESS_TOKEN')]) { 
          sh """
            git add -A
            git commit -m 'Update deployment of console'
            git push https://${GITHUB_ACCESS_TOKEN}@github.com/tmax-cloud/console.git HEAD:${BRANCH}
          """
        }
      }
    }  
  
  }


  post {
    success {
      sh "echo SUCCESSFUL"
      emailext (
        to: "hyowook_park@tmax.co.kr",
        subject: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
        body:  """<p>SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
            <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
        mimeType: 'text/html',    
      )
    } 
    failure {
      sh "echo FAILED"
      emailext (
        to: "hyowook_park@tmax.co.kr",
        subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
        body: """<p>FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
          <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
        mimeType: 'text/html'
      )
    }
  }
}

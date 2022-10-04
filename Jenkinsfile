pipeline {
  parameters {
    choice(name: 'BUILD_MODE', choices:['PATCH','HOTFIX','IMAGE'], description: 'Select the mode you want to act')
  }
  triggers {
    // ref https://plugins.jenkins.io/parameterized-scheduler/
    // trigger at 9:00 every Thursday
    parameterizedCron('''
    H 9 * * 4 %BUILD_MODE=PATCH
    ''')
  }
  agent {
    kubernetes {
      yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - sleep
    args:
    - 9999999
    volumeMounts:
    - mountPath: /kaniko/.docker
      name: kaniko-secret
  volumes:
  - name: kaniko-secret
    secret:
      secretName: dockercred
      items:
      - key: .dockerconfigjson
        path: config.json
'''
    }
  }
  environment {
    BRANCH = "master"
    BUILD_MODE = "${params.BUILD_MODE}"

    DOCKER_REGISTRY="tmaxcloudck"
    PRODUCT = "hypercloud-console"
    MAJOR_VER="5"
    MINOR_VER="2"
    PATCH_VER="0"
    HOTFIX_VER="0"
    VER = "${MAJOR_VER}.${MINOR_VER}.${PATCH_VER}.${HOTFIX_VER}"

    GUIDE_URL = "https://github.com/tmax-cloud/install-console/blob/5.0/README.md"
    
    USER_TOKEN = "jinsoo-access-token"
    USER_NAME = "jinsoo-youn"
    USER_EMAIL = "jinsoo_youn@tmax.co.kr"
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
        container('kaniko'){
          sh """
            /kaniko/executor --context `pwd` --destination ${DOCKER_REGISTRY}/${PRODUCT}:${VER}
          """
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
          sh """
            cp -r ./contrib/console/console.ck1-1.link-values.yaml.temp ./contrib/console/console.ck1-1.link-values.yaml
            sed -i "s/@@VER@@/${VER}/g" ./contrib/console/console.ck1-1.link-values.yaml
            cp -r ./contrib/console/console.tmaxcloud.org-values.yaml.temp ./contrib/console/console.tmaxcloud.org-values.yaml
            sed -i "s/@@VER@@/${VER}/g" ./contrib/console/console.tmaxcloud.org-values.yaml
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
          to: 'cqa1@tmax.co.kr, ck1@tmax.co.kr, ck2@tmax.co.kr',
          subject: "[${PRODUCT}] Release Update - ${PRODUCT}:${VER}", 
          attachmentsPattern: "**/CHANGELOG/CHANGELOG-${VER}.md",
          body: "안녕하세요. \n\n${PRODUCT} Release Update 입니다. \n\n [필독] 타 모듈과의 버전을 맞추기위해 기존 5.1에서 5.0으로 변경했습니다. (PATCH, HOTFIX 는 기존 번호 유지)" + 
          "\n\n변경사항 파일로 첨부합니다. \n\n감사합니다.\n\n" +
                "※ 이미지 : ${DOCKER_REGISTRY}/${PRODUCT}:${VER} \n\n※ 설치 가이드 : ${GUIDE_URL} ",
          mimeType: 'text/plain'  
        )
      }
    }

  }

  post {
    success {
      sh "echo SUCCESSFUL"
      emailext (
        to: "jinsoo_youn@tmax.co.kr",
        subject: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
        body:  """<p>SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
            <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
        mimeType: 'text/html',    
      )
    } 
    failure {
      sh "echo FAILED"
      emailext (
        to: "jinsoo_youn@tmax.co.kr",
        subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
        body: """<p>FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
          <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
        mimeType: 'text/html'
      )
    }
  }
}
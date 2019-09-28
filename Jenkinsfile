pipeline {
	environment {
		registry = 'rott33/udacity-devops-capstone'
		registryCredential = 'dockerhub'
		dockerImage = ''
		awsRegion = 'us-east-2'
		awsCredentials = 'aws-jenkins'
	}
	agent any
	
	stages {
		stage('Build image') {
			steps {
				script {
					dockerImage = docker.build registry
				}
			}
		}
		stage('Linting') {
			steps {
				script {
					sh 'eslint *.js'
				}
			}
		}
		stage('Test container service') {
			/* Run container & test web service for expected request output */
			steps {
				script {
					dockerImage.withRun('-p 8085:8080') {c ->
						sh '''
							RES=$(curl -s localhost:8085)
							if [ $(echo "$RES" | grep -c "Hello") -eq 0 ]
							then	
								echo "Web service request error"
								exit 1
							fi
						'''
					}
				}
			}
		}
		stage('Publish image') {
			/* Publish image with tags corresponding to Jenkins build # as well as 'latest' */
			steps{
				script {
					docker.withRegistry( '', registryCredential ) {
						dockerImage.push("${env.BUILD_NUMBER}")
						dockerImage.push("latest")
					}
				}
			}
		}
		stage('Cleanup image artificat') {
			steps{
				sh "docker rmi $registry:$BUILD_NUMBER"
			}
		}
		stage('Deploy to Kubernetes') {
			steps{
				withAWS(region:awsRegion, credentials:awsCredentials) {
					sh '''
						# Kubernetes service
						kubectl apply -f kubernetes/helloworld-service.yaml
						sleep 5
						kubectl get svc helloworld-service
						
						# Parameter replacement by Jenkins env variable in order for
						# current build number to be appended to Docker image tag
						cat kubernetes/helloworld-deployment.yaml | \
						sed 's/\$BUILD_NUMBER'"/$BUILD_NUMBER/g" | \
						kubectl apply -f -

						kubectl get pods
						sleep 15
						kubectl get pods
					'''
				}				
			}
		}		
	}
}
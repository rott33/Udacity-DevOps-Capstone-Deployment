# Udacity-DevOps-Capstone-Deployment
**Prerequisite**: an existing Kubernetes cluster (or [Minikube](https://github.com/kubernetes/minikube)) (see [here](https://github.com/rott33/Udacity-DevOps-Capstone-Provision) for a Jenkins AWS EKS cluster-provisioning pipeline example).

This is a Jenkins pipeline that performs the following steps:
1. Check out project from SCM

   *Note that in my particular case I configured this when creating a new pipeline via the [Blue Ocean](https://jenkins.io/doc/book/blueocean/creating-pipelines/) plugin so there's no declared 'SCM' stage in this pipeline.  
2. Build Docker image
3. Linting of Node.js script (this arguably should be performed prior to the previous step but is inconsequential for demo purposes since the pipeline is still halted upon failure)
4. Test containerized application (in this case a rudimentary check for expected output)
5. Publish Docker image to Docker Hub
6. Clean up local Docker image artifact
7. Deploy containerized application to Kubernetes (using Rolling Update strategy)

### Docker image tagging
Since performing a rolling update by reapplying a Kubernetes Deployment file (e.g. ```kubectl apply -f helloworld-deployment.yaml```) using a Docker image tagged 'latest' may not be recognized as an image change (see [here](https://kubernetes.io/docs/tasks/run-application/rolling-update-replication-controller/#updating-the-container-image)) and is anyway not considered best practice (see [here](https://kubernetes.io/docs/concepts/configuration/overview/#container-images)), we're tagging, publishing, & deploying using the Jenkins build number appended to the image name.

This is accomplished in [Jenkinsfile](Jenkinsfile) with ```dockerImage.push("${env.BUILD_NUMBER}")``` in the *Publish image* stage, and this bit of environment variable substitution in the *Deploy to Kubernetes* stage:
```
cat kubernetes/helloworld-deployment.yaml | \
sed 's/\$BUILD_NUMBER'"/$BUILD_NUMBER/g" | \
kubectl apply -f -
```
with corresponding configuration in [helloworld-deployment.yaml](kubernetes/helloworld-deployment.yaml):
```
spec:
  containers:
  - name: helloworld
    image: rott33/udacity-devops-capstone:$BUILD_NUMBER
```
The downside of this approach is that executing a rolling update outside Jenkins, e.g. from the command line, is not so straightforward; in your shell you'd have to set/update the environment variable ```$BUILD_NUMBER``` and then execute the variable substitution snippet from above.

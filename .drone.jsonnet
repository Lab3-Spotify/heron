// output to .drone.yml (which drone really reads)
// jsonnet .drone.jsonnet | jq . | yq -P - > .drone.yml


local VALUES = {
  PROJECT_NAME:             "heron",
  DOCKERHUB_USER:           "popopopony",
  DOCKERHUB_IMAGE:          "popopopony/heron",
  K8S_DEPLOYMENT_NAME:      "heron",
  K8S_DEPLOYMENT_NAMESPACE: "heron",
  CONTAINER_NAME:           "heron",
  BRANCH:                   "master",
};



local SECRET = {
  K8S_SERVER:           { from_secret: "K8S_SERVER" },
  K8S_TOKEN:            { from_secret: "K8S_TOKEN" },
  K8S_CA:               { from_secret: "K8S_CA" },
  DOCKER_USERNAME:      { from_secret: "DOCKER_USERNAME_pony" },
  DOCKER_PASSWORD:      { from_secret: "DOCKER_PASSWORD_pony" },
};


local deploy_pipeline = {
  kind: "pipeline",
  type: "kubernetes",
  name: "heron-deploy",
  node: {
    // should be equal to DRONE_RUNNER_LABELS in drone-runner
    repo: "Lab3-Spotify-heron",
  },
  trigger: {
    event:  ["push"],
    branch: [ VALUES.BRANCH ],
  },
  steps: [
    {
      name:  "build and push docker image",
      image: "plugins/docker",
      settings: {
        repo:  VALUES.DOCKERHUB_IMAGE,
        tags: ["latest", "${DRONE_COMMIT_SHA}"],
        username: SECRET.DOCKER_USERNAME,
        password: SECRET.DOCKER_PASSWORD,
        build_args: [
          "WALRUS_API_BASE_URL=https://lab3-walrus.ddns.net",
          "ENV=staging",
          "APP_TITLE=Heron"
        ],
      },
    },
    {
      name:  "deploy to k8s",
      image: "sinlead/drone-kubectl",
      settings: {
        kubernetes_server: SECRET.K8S_SERVER,
        kubernetes_token:  SECRET.K8S_TOKEN,
        kubernetes_cert:   SECRET.K8S_CA,
        namespace: VALUES.K8S_DEPLOYMENT_NAMESPACE,
        startTimeout: 240
      },
      commands: [
        std.format(
          "kubectl set image deployment/%s %s=%s:${DRONE_COMMIT_SHA} --namespace=%s || exit 1",
          [VALUES.K8S_DEPLOYMENT_NAME, VALUES.CONTAINER_NAME, VALUES.DOCKERHUB_IMAGE, VALUES.K8S_DEPLOYMENT_NAMESPACE]
        ),
        std.format(
          "kubectl rollout status deployment/%s --namespace=%s || exit 1",
          [VALUES.K8S_DEPLOYMENT_NAME, VALUES.K8S_DEPLOYMENT_NAMESPACE]
        ),
        "echo Deployment success!",
      ]
    },
  ],
};

std.manifestYamlDoc(deploy_pipeline)


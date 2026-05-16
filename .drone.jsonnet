// output to .drone.yml (which drone really reads)
// jsonnet .drone.jsonnet | yq -P - > .drone.yml

local VALUES = {
  DOCKERHUB_IMAGE:          "lislab3morris/heron",
  K8S_DEPLOYMENT_NAME:      "heron",
  K8S_DEPLOYMENT_NAMESPACE: "heron",
  BRANCH:                   "master",
};

local SECRET = {
  DOCKER_USERNAME: { from_secret: "docker-username" },
  DOCKER_PASSWORD: { from_secret: "docker-password" },
};

local secret_docker_user = { kind: "secret", name: "docker-username", get: { path: "docker-username", name: "value" } };
local secret_docker_pass = { kind: "secret", name: "docker-password", get: { path: "docker-password", name: "value" } };

local node = { repo: "Lab3-Spotify-heron" };

local trigger = {
  event:  ["push"],
  branch: [VALUES.BRANCH],
};

// ── build ─────────────────────────────────────────────────
local buildPipeline = {
  kind: "pipeline",
  type: "kubernetes",
  name: "heron-build",
  node: node,
  trigger: trigger,
  steps: [
    {
      name:  "build",
      image: "plugins/docker",
      settings: {
        repo:       VALUES.DOCKERHUB_IMAGE,
        tags:       ["test-${DRONE_COMMIT_SHA}"],
        username:   SECRET.DOCKER_USERNAME,
        password:   SECRET.DOCKER_PASSWORD,
        cache_from: [VALUES.DOCKERHUB_IMAGE + ":latest"],
        buildkit:   true,
        build_args: [
          "WALRUS_API_BASE_URL=https://walrus.lab3.website",
          "ENV=staging",
          "APP_TITLE=Heron",
          "BUILDKIT_INLINE_CACHE=1",
        ],
      },
    },
  ],
};

// ── publish ───────────────────────────────────────────────
local publishPipeline = {
  kind: "pipeline",
  type: "kubernetes",
  name: "heron-publish",
  node: node,
  depends_on: ["heron-build"],
  trigger: trigger,
  steps: [
    {
      name:  "promote",
      image: "regclient/regctl:edge-alpine",
      environment: {
        DOCKER_USERNAME: SECRET.DOCKER_USERNAME,
        DOCKER_PASSWORD: SECRET.DOCKER_PASSWORD,
      },
      commands: [
        "regctl registry login registry-1.docker.io -u $DOCKER_USERNAME -p $DOCKER_PASSWORD",
        "regctl image copy %(img)s:test-${DRONE_COMMIT_SHA} %(img)s:${DRONE_COMMIT_SHA}" % { img: VALUES.DOCKERHUB_IMAGE },
        "regctl image copy %(img)s:test-${DRONE_COMMIT_SHA} %(img)s:latest"              % { img: VALUES.DOCKERHUB_IMAGE },
        "regctl tag delete %s:test-${DRONE_COMMIT_SHA}"                                  % VALUES.DOCKERHUB_IMAGE,
      ],
    },
  ],
};

// ── deploy ────────────────────────────────────────────────
local deployPipeline = {
  kind: "pipeline",
  type: "kubernetes",
  name: "heron-deploy",
  node: node,
  depends_on: ["heron-publish"],
  trigger: trigger,
  steps: [
    {
      name:  "deploy",
      image: "bitnami/kubectl",
      commands: [
        "kubectl rollout restart deployment/%s -n %s || exit 1" % [VALUES.K8S_DEPLOYMENT_NAME, VALUES.K8S_DEPLOYMENT_NAMESPACE],
      ],
    },
    {
      name:  "verify",
      image: "bitnami/kubectl",
      commands: [
        "kubectl rollout status deployment/%s -n %s --timeout=120s || exit 1" % [VALUES.K8S_DEPLOYMENT_NAME, VALUES.K8S_DEPLOYMENT_NAMESPACE],
      ],
    },
    {
      name:  "cleanup-old-tags",
      image: "alpine:3",
      environment: {
        DOCKER_USERNAME: SECRET.DOCKER_USERNAME,
        DOCKER_PASSWORD: SECRET.DOCKER_PASSWORD,
        REPO_PATH:       VALUES.DOCKERHUB_IMAGE,
      },
      commands: [
        "apk add --no-cache curl jq",
        "sh ci/cleanup-dockerhub.sh",
      ],
    },
  ],
};

// ── output ────────────────────────────────────────────────
std.join("\n---\n", [
  std.manifestYamlDoc(p)
  for p in [
    buildPipeline,
    publishPipeline,
    deployPipeline,
    secret_docker_user,
    secret_docker_pass,
  ]
])

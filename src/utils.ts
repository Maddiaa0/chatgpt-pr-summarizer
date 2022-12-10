import github from "@actions/github";

export function getSha() {
  if (github.context.eventName == "pull_request") {
    return github.context.payload.pull_request?.head.sha;
  } else {
    return github.context.sha;
  }
}

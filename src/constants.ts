export const REMOTE_NAME = "chatgpt-pr";

export const TARGET_EVENTS = {
  pull_request: ["opened", "reopened", "synchronize", "closed", "ready_for_review"],
  push: "*",
};

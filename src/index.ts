import core from "@actions/core";
import github from "@actions/github";
import { inspect } from "util";
import { Context } from "@actions/github/lib/context";
import { Logger } from "@technote-space/github-action-log-helper";
import { getSummary } from "./chatgpt";
import { getDiff } from "./diff";
import { getPrNumber } from "./utils";
import { COMMENT_HEADING } from "./constants";
import { Inputs } from "./types";

async function run(): Promise<void> {
  try {
    const context = new Context();
    const logger = new Logger();

    console.log("Parsing inputs...");
    // Parse action inputs
    const inputs: Inputs = {
      token: core.getInput("GITHUB_TOKEN"),
      repository: core.getInput("repository"),
      body: core.getInput("body"),
      chatGptSessionKey: core.getInput("chat-gpt-session-key"),
    };
    const [owner, repo] = inputs.repository.split("/");
    if (!inputs.chatGptSessionKey) {
      throw new Error("Missing Session Key");
    }
    const prNumber = getPrNumber();
    if (!prNumber) {
      throw new Error("Cannot determine pr number");
    }

    // Setup github api
    const octokit = github.getOctokit(inputs.token);

    // Get pr diff
    console.log("Checking diff...");
    const diff = await getDiff(logger, context);

    // Get summary from chatgpt
    console.log("Generating Summary...");
    const summary = await getSummary(inputs.chatGptSessionKey, diff);
    const body = COMMENT_HEADING + summary;

    // Create commit comment with output
    console.log("Generating comment...");
    await octokit.rest.issues.createComment({
      owner: owner,
      repo: repo,
      issue_number: prNumber,
      body: body,
    });
  } catch (error) {
    if (error instanceof Error) {
      core.debug(inspect(error));
      core.setFailed(error.message);
    }
  }
}

run();

import core from "@actions/core";
import github from "@actions/github";
import { inspect } from "util";
import { getSummary } from "./chatgpt";
import { getDiff } from "./diff";
import { getPrNumber, getSha } from "./utils";
import { Context } from "@actions/github/lib/context";
import { Logger } from "@technote-space/github-action-log-helper";

type Inputs = {
  token: string;
  repository: string;
  body: string;
  chatGptSessionKey: string;
};

async function run(): Promise<void> {
  try {
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
    console.log(github.context);

    // Get pr diff
    console.log("diff");
    const context = new Context();
    const logger = new Logger();
    const diff = await getDiff(logger, context);
    console.log("second context");
    console.log(context);
    console.log(diff);

    // Get summary from chatgpt
    console.log("session t");
    console.log(inputs.chatGptSessionKey);
    const summary = await getSummary(inputs.chatGptSessionKey, diff);

    console.log("summary");
    console.log(summary);

    // Create commit comment with output
    await octokit.rest.issues.createComment({
      owner: owner,
      repo: repo,
      issue_number: prNumber,
      body: summary,
    });
  } catch (error) {
    if (error instanceof Error) {
      core.debug(inspect(error));
      core.setFailed(error.message);
    }
  }
}

run();

import core from "@actions/core";
import github from "@actions/github";
import { inspect } from "util";
import { getSummary } from "./chatgpt";
import { getDiff } from "./diff";
import { getSha } from "./utils";
import { Context } from "@actions/github/lib/context";

type Inputs = {
  token: string;
  repository: string;
  sha: string;
  body: string;
  path: string;
  position: number;
  chatGptSessionKey: string;
};

async function run(): Promise<void> {
  try {
    // Parse action inputs
    const inputs: Inputs = {
      token: await core.getIDToken(),
      repository: core.getInput("repository"),
      sha: core.getInput("sha"),
      body: core.getInput("body"),
      path: core.getInput("path"),
      position: +core.getInput("position"),
      chatGptSessionKey: core.getInput("chat-gpt-session-key"),
    };
    const [owner, repo] = inputs.repository.split("/");
    const sha = inputs.sha ? inputs.sha : getSha();
    if (!inputs.chatGptSessionKey) {
      throw new Error("Missing Session Key");
    }

    // Setup github api
    const octokit = github.getOctokit(inputs.token);
    console.log(github.context);

    // Get pr diff
    console.log("diff");
    const context = new Context();
    const diff = await getDiff(context);
    console.log("second context");
    console.log(context);
    console.log(diff);

    // Get summary from chatgpt
    const summary = await getSummary(inputs.chatGptSessionKey, diff);

    // Create commit comment with output
    await octokit.rest.repos.createCommitComment({
      owner: owner,
      repo: repo,
      commit_sha: sha,
      body: summary,
      path: inputs.path,
      position: inputs.position,
    });
  } catch (error) {
    if (error instanceof Error) {
      core.debug(inspect(error));
      core.setFailed(error.message);
    }
  }
}

run();

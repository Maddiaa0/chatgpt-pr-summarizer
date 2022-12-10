import core from "@actions/core";
import github from "@actions/github";
import { inspect } from "util";
import { getSha } from "./utils";

type Inputs = {
  token: string;
  repository: string;
  sha: string;
  body: string;
  path: string;
  position: number;
  chatGptSessionKey: string;
  diff: string;
};

async function run(): Promise<void> {
  try {
    const inputs: Inputs = {
      token: await core.getIDToken(),
      repository: core.getInput("repository"),
      sha: core.getInput("sha"),
      body: core.getInput("body"),
      path: core.getInput("path"),
      position: +core.getInput("position"),
      chatGptSessionKey: core.getInput("chat-gpt-session-key"),
      diff: core.getInput("diff"),
    };
    const [owner, repo] = inputs.repository.split("/");
    const sha = inputs.sha ? inputs.sha : getSha();
    if (!inputs.chatGptSessionKey) {
      throw new Error("Missing Session Key");
    }

    const token = core.getIDToken();
    const octokit = github.getOctokit(inputs.token);
    console.log(token);
    console.log(github.context);

    console.log("diff");
    console.log(inputs.diff);
    // Get the json webhook payload for the event that triggered the workflow

    const chatGptOutput = "output test";

    // Create commit comment with output
    await octokit.rest.repos.createCommitComment({
      owner: owner,
      repo: repo,
      commit_sha: sha,
      body: chatGptOutput,
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

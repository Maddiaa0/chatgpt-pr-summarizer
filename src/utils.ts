// Taken from: https://github.dev/technote-space/get-diff-action/tree/main/src/utils

import type { PullRequestParams, DiffInfo } from "./types";
import type { Context } from "@actions/github/lib/context";
import type { Octokit } from "@technote-space/github-action-helper/dist/types";
import { getInput } from "@actions/core";
import { Utils, ApiHelper } from "@technote-space/github-action-helper";
import github from "@actions/github";

export function getSha() {
  if (github.context.eventName == "pull_request") {
    return github.context.payload.pull_request?.head.sha;
  } else {
    return github.context.sha;
  }
}

export const escape = (items: string[]): string[] =>
  items.map(item => {
    // eslint-disable-next-line no-useless-escape
    if (!/^[A-Za-z0-9_\/-]+$/.test(item)) {
      item = "'" + item.replace(/'/g, "'\\''") + "'";
      item = item
        .replace(/^(?:'')+/g, "") // unduplicate single-quote at the beginning
        .replace(/\\'''/g, "\\'"); // remove non-escaped single-quote if there are enclosed between 2 escaped
    }
    return item;
  });

export const getDiffInfoForPR = (pull: PullRequestParams, context: Context): DiffInfo => ({
  base: context.payload.action === "closed" ? pull.base.sha : Utils.normalizeRef(pull.base.ref),
  head: context.payload.action === "closed" ? context.sha : Utils.normalizeRef(context.ref),
});

export const isDefaultBranch = async (octokit: Octokit, context: Context): Promise<boolean> =>
  (await new ApiHelper(octokit, context).getDefaultBranch()) === Utils.getBranch(context);

const getBase = (context: Context): string => getInput("BASE") || context.payload.before;

export const getDiffInfoForPush = async (octokit: Octokit, context: Context): Promise<DiffInfo> => {
  if (Utils.isTagRef(context)) {
    return { base: "", head: "" };
  }

  if (!(await isDefaultBranch(octokit, context))) {
    const pull = await new ApiHelper(octokit, context).findPullRequest(context.ref);
    if (pull) {
      if (checkOnlyCommit(Utils.ensureNotNullValue(pull.draft, false))) {
        return {
          base: context.payload.before,
          head: context.payload.after,
        };
      }

      return {
        base: Utils.normalizeRef(pull.base.ref),
        head: `refs/pull/${pull.number}/merge`,
      };
    }
  }

  if (/^0+$/.test(context.payload.before)) {
    // new branch
    return {
      base: Utils.normalizeRef(await new ApiHelper(octokit, context).getDefaultBranch()),
      head: context.payload.after,
    };
  }

  return {
    base: getBase(context),
    head: context.payload.after,
  };
};

const checkOnlyCommit = (isDraft: boolean): boolean =>
  isDraft && Utils.getBoolValue(getInput("CHECK_ONLY_COMMIT_WHEN_DRAFT"));
export const getDiffInfo = async (octokit: Octokit, context: Context): Promise<DiffInfo> => {
  if (context.payload.pull_request) {
    if (checkOnlyCommit(context.payload.pull_request.draft)) {
      return {
        base: context.payload.before,
        head: context.payload.after,
      };
    }

    return getDiffInfoForPR(
      {
        base: context.payload.pull_request.base,
        head: context.payload.pull_request.head,
      },
      context,
    );
  }

  return getDiffInfoForPush(octokit, context);
};

// Adapted from: https://github.dev/technote-space/get-diff-action/tree/main/src/utils

import type { Context } from "@actions/github/lib/context";
import { Command, Utils } from "@technote-space/github-action-helper";
import { Logger } from "@technote-space/github-action-log-helper";
import { REMOTE_NAME } from "./constants";
import { getInput } from "@actions/core";
import { getDiffInfo } from "./utils";

const command = new Command(new Logger());
const getDot = (): string => getInput("DOT", { required: true });
const getCompareRef = (ref: string): string => (Utils.isRef(ref) ? Utils.getLocalRefspec(ref, REMOTE_NAME) : ref);
const isSuppressGitDiffError = (): boolean => Utils.getBoolValue(getInput("SUPPRESS_ERROR"));

export async function getDiff(context: Context): Promise<string> {
  const dot = getDot();
  const diffInfo = await getDiffInfo(Utils.getOctokit(), context);
  const stdout = (
    await command.execAsync({
      command: "git diff",
      args: [`${getCompareRef(diffInfo.base)}${dot}${getCompareRef(diffInfo.head)}`],
      cwd: Utils.getWorkspace(),
      suppressError: isSuppressGitDiffError(),
    })
  ).stdout;

  return stdout;
}

// Adapted from: https://github.dev/technote-space/get-diff-action/tree/main/src/utils

import type { Context } from "@actions/github/lib/context";
import { Command, Utils, GitHelper } from "@technote-space/github-action-helper";
import { Logger } from "@technote-space/github-action-log-helper";
import { REMOTE_NAME } from "./constants";
import { getInput } from "@actions/core";
import { getDiffInfo } from "./utils";

const command = new Command(new Logger());
const getDot = (): string => getInput("DOT", { required: true });
const getCompareRef = (ref: string): string => (Utils.isRef(ref) ? Utils.getLocalRefspec(ref, REMOTE_NAME) : ref);
const isSuppressGitDiffError = (): boolean => Utils.getBoolValue(getInput("SUPPRESS_ERROR"));

export async function getDiff(logger: Logger, context: Context): Promise<string> {
  const helper = new GitHelper(logger);
  helper.useOrigin(REMOTE_NAME);

  // Get diff info
  const diffInfo = await getDiffInfo(Utils.getOctokit(), context);

  // Get refs
  const refs = [Utils.normalizeRef(context.ref)];
  if (Utils.isRef(diffInfo.base)) {
    refs.push(diffInfo.base);
  }
  if (Utils.isRef(diffInfo.head)) {
    refs.push(diffInfo.head);
  }
  await helper.fetchOrigin(
    Utils.getWorkspace(),
    context,
    ["--no-tags", "--no-recurse-submodules", "--depth=10000"],
    Utils.uniqueArray(refs).map(ref => Utils.getRefspec(ref, REMOTE_NAME)),
  );

  const dot = getDot();
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

import type { Context } from "@actions/github/lib/context";
import { Logger } from "@technote-space/github-action-log-helper";
export declare function getDiff(logger: Logger, context: Context): Promise<string>;

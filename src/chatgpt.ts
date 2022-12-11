import { ChatGPTAPI } from "chatgpt";

export async function getSummary(session: string, diff: string): Promise<string> {
  // Instantiate API
  const api = new ChatGPTAPI({
    sessionToken: session,
  });
  await api.ensureAuth();

  // Send diff and wait for response
  const starterPrompt =
    "The following describes a diff for a pull request into a git repository, can you describe concisely what changes have been made? \n";
  return api.sendMessage(starterPrompt + diff);
}

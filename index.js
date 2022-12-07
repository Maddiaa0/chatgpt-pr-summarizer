const core = require("@actions/core");
const github = require("@actions/github");

try {
  const nameToGreet = core.getInput("who-to-greet");
  console.log(`Hello ${nameToGreet}`);

  const token = core.getIDToken();

  console.log(github.context);

  const time = new Date().toTimeString();
  core.setOutput("time", time);

  // Get the json webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${JSON.stringify(payload)}`);
} catch (e) {
  core.setFailed(error.message);
}

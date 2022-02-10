/* eslint require-atomic-updates: off */

const verifyGitee = require('./lib/verify');
const publishGitee = require('./lib/publish');

let verified;

async function verifyConditions(pluginConfig, context) {
  await verifyGitee(pluginConfig, context);
  verified = true;
}

async function publish(pluginConfig, context) {
  if (!verified) {
    await verifyGitee(pluginConfig, context);
    verified = true;
  }

  return publishGitee(pluginConfig, context);
}

module.exports = {verifyConditions, publish};

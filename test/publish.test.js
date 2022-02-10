const test = require('ava');
const nock = require('nock');
const {stub} = require('sinon');
const publish = require('../lib/publish');
const authenticate = require('./helpers/mock-gitee');

/* eslint camelcase: ["error", {properties: "never"}] */

test.beforeEach(t => {
  // Mock logger
  t.context.log = stub();
  t.context.error = stub();
  t.context.logger = {log: t.context.log, error: t.context.error};
});

test.afterEach.always(() => {
  // Clear nock
  nock.cleanAll();
});

test.serial('Publish a release', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const pluginConfig = {};
  const nextRelease = {gitHead: '123', gitTag: 'v1.0.0', notes: 'Test release note body'};
  const options = {repositoryUrl: `https://gitee.com/${owner}/${repo}.git`};
  const repoId = `${owner}/${repo}`;
  const encodedGitTag = encodeURIComponent(nextRelease.gitTag);
  const gitee = authenticate(env)
    .post(`/repos/${repoId}/releases`, {
      access_token: env.GITEE_TOKEN,
      tag_name: nextRelease.gitTag,
      name: nextRelease.gitTag,
      body: nextRelease.notes,
    })
    .reply(200);

  const result = await publish(pluginConfig, {env, options, nextRelease, logger: t.context.logger});

  t.is(result.url, `https://gitee.com/${repoId}/releases/${encodedGitTag}`);
  t.deepEqual(t.context.log.args[0], ['Published Gitee release: %s', nextRelease.gitTag]);
  t.true(gitee.isDone());
});
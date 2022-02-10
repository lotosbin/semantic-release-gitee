const test = require('ava');
const nock = require('nock');
const {stub} = require('sinon');
const clearModule = require('clear-module');
const authenticate = require('./helpers/mock-gitee');

/* eslint camelcase: ["error", {properties: "never"}] */

test.beforeEach(t => {
  // Clear npm cache to refresh the module state
  clearModule('..');
  t.context.m = require('..');
  // Stub the logger
  t.context.log = stub();
  t.context.error = stub();
  t.context.logger = {log: t.context.log, error: t.context.error};
});

test.afterEach.always(() => {
  // Clear nock
  nock.cleanAll();
});

test.serial('Verify Gitee auth', async t => {
  const env = {GITEE_TOKEN: 'gitee_token'};
  const owner = 'test_user';
  const repo = 'test_repo';
  const options = {repositoryUrl: `git+https://othertesturl.com/${owner}/${repo}.git`};
  const gitee = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .reply(200, {permission: {push:true}});

  await t.notThrowsAsync(t.context.m.verifyConditions({}, {env, options, logger: t.context.logger}));

  t.true(gitee.isDone());
});

test.serial('Throw SemanticReleaseError if invalid config', async t => {
  const env = {};
  const options = {
    publish: [{path: '@semantic-release/npm'}, {path: 'semantic-release-gitee'}],
    repositoryUrl: 'git+ssh://git@gitee.com/context.git',
  };

  const errors = [
    ...(await t.throwsAsync(
      t.context.m.verifyConditions({giteeUrl: 'https://gitee.com/context'}, {env, options, logger: t.context.logger})
    )),
  ];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'EINVALIDGITEEURL');
  t.is(errors[1].name, 'SemanticReleaseError');
  t.is(errors[1].code, 'ENOGITEETOKEN');
});

test.serial('Publish a release', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const nextRelease = {gitHead: '123', gitTag: 'v1.0.0', notes: 'Test release note body'};
  const options = {branch: 'master', repositoryUrl: `https://gitee.com/${owner}/${repo}.git`};
  const repoId = `${owner}/${repo}`;

  const gitee = authenticate(env)
    .get(`/repos/${repoId}`)
    .query(true)
    .reply(200, {permission: {push: true}})
    .post(`/repos/${repoId}/releases`, {
      access_token: env.GITEE_TOKEN,
      tag_name: nextRelease.gitTag,
      name: nextRelease.gitTag,
      body: nextRelease.notes,
    })
    .reply(200);

  const result = await t.context.m.publish({}, {env, nextRelease, options, logger: t.context.logger});

  t.is(result.url, `https://gitee.com/${repoId}/releases/${nextRelease.gitTag}`);
  t.deepEqual(t.context.log.args[0], ['Verify Gitee authentication (%s)', 'https://gitee.com/api/v5']);
  t.deepEqual(t.context.log.args[1], ['Published Gitee release: %s', nextRelease.gitTag]);
  t.true(gitee.isDone());
});

test.serial('Verify Gitee auth and release', async t => {
  const env = {GITEE_TOKEN: 'gitee_token'};
  const owner = 'test_user';
  const repo = 'test_repo';
  const options = {repositoryUrl: `https://gitee.com/${owner}/${repo}.git`};
  const repoId = `${owner}/${repo}`;
  const nextRelease = {gitHead: '123', gitTag: 'v1.0.0', notes: 'Test release note body'};

  const gitee = authenticate(env)
    .get(`/repos/${repoId}`)
    .query(true)
    .reply(200, {permission: {push: true}})
    .post(`/repos/${repoId}/releases`, {
      access_token: env.GITEE_TOKEN,
      tag_name: nextRelease.gitTag,
      name: nextRelease.gitTag,
      body: nextRelease.notes,
    })
    .reply(200);

  await t.notThrowsAsync(t.context.m.verifyConditions({}, {env, options, logger: t.context.logger}));
  const result = await t.context.m.publish({}, {env, options, nextRelease, logger: t.context.logger});

  t.is(result.url, `https://gitee.com/${repoId}/releases/${nextRelease.gitTag}`);
  t.deepEqual(t.context.log.args[0], ['Verify Gitee authentication (%s)', 'https://gitee.com/api/v5']);
  t.deepEqual(t.context.log.args[1], ['Published Gitee release: %s', nextRelease.gitTag]);
  t.true(gitee.isDone());
});

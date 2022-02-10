const test = require('ava');
const nock = require('nock');
const {stub} = require('sinon');
const verify = require('../lib/verify');
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

test.serial('Verify token and repository access (push true)', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const gitee = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .reply(200, {permission: {push: true}});

  await t.notThrowsAsync(
    verify({}, {env, options: {repositoryUrl: `git+https://gitee.com/${owner}/${repo}.git`}, logger: t.context.logger})
  );
  t.true(gitee.isDone());
});

test.serial('Verify token and repository access and custom URL with prefix', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const giteeUrl = 'https://othertesturl.com:9090';
  const giteeApiPathPrefix = 'prefix';
  const gitee = authenticate(env, {giteeUrl, giteeApiPathPrefix})
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .reply(200, {permission: {push: true}});

  await t.notThrowsAsync(
    verify(
      {giteeUrl, giteeApiPathPrefix},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(gitee.isDone());
  t.deepEqual(t.context.log.args[0], ['Verify Gitee authentication (%s)', 'https://othertesturl.com:9090/prefix']);
});

test.serial('Verify token and repository access and custom URL without prefix', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const giteeUrl = 'https://othertesturl.com:9090';
  const gitee = authenticate(env, {giteeUrl})
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .reply(200, {permission: {push: true}});

  await t.notThrowsAsync(
    verify(
      {giteeUrl},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(gitee.isDone());
  t.deepEqual(t.context.log.args[0], ['Verify Gitee authentication (%s)', 'https://othertesturl.com:9090/api/v5']);
});

test.serial('Verify token and repository access with subgroup git URL', async t => {
  const repoUri = 'orga/subgroup/test_user/test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const giteeUrl = 'https://customurl.com:9090/context';
  const giteeApiPathPrefix = 'prefix';
  const gitee = authenticate(env, {giteeUrl, giteeApiPathPrefix})
    .get(`/repos/${repoUri}`)
    .query(true)
    .reply(200, {permission: {push: true}});

  await t.notThrowsAsync(
    verify(
      {giteeUrl, giteeApiPathPrefix},
      {env, options: {repositoryUrl: `git@customurl.com:${repoUri}.git`}, logger: t.context.logger}
    )
  );

  t.true(gitee.isDone());
  t.deepEqual(t.context.log.args[0], ['Verify Gitee authentication (%s)', 'https://customurl.com:9090/context/prefix']);
});

test.serial('Verify token and repository access with subgroup http URL', async t => {
  const repoUri = 'orga/subgroup/test_user/test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const giteeUrl = 'https://customurl.com:9090/context';
  const giteeApiPathPrefix = 'prefix';
  const gitee = authenticate(env, {giteeUrl, giteeApiPathPrefix})
    .get(`/repos/${repoUri}`)
    .query(true)
    .reply(200, {permission: {push: true}});

  await t.notThrowsAsync(
    verify(
      {giteeUrl, giteeApiPathPrefix},
      {env, options: {repositoryUrl: `http://customurl.com/${repoUri}.git`}, logger: t.context.logger}
    )
  );

  t.true(gitee.isDone());
  t.deepEqual(t.context.log.args[0], ['Verify Gitee authentication (%s)', 'https://customurl.com:9090/context/prefix']);
});

test.serial('Verify token and repository access with empty giteeApiPathPrefix', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const giteeUrl = 'https://othertesturl.com:9090';
  const giteeApiPathPrefix = '';
  const gitee = authenticate(env, {giteeUrl, giteeApiPathPrefix})
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .reply(200, {permission: {push: true}});

  await t.notThrowsAsync(
    verify(
      {giteeUrl, giteeApiPathPrefix},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(gitee.isDone());
  t.deepEqual(t.context.log.args[0], ['Verify Gitee authentication (%s)', 'https://othertesturl.com:9090']);
});

test.serial('Verify token and repository with environment variables', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_URL: 'https://othertesturl.com:443', GITEE_TOKEN: 'gitee_token', GITEE_PREFIX: 'prefix'};
  const gitee = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .reply(200, {permission: {push: true}});

  await t.notThrowsAsync(
    verify({}, {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger})
  );

  t.true(gitee.isDone());
  t.deepEqual(t.context.log.args[0], ['Verify Gitee authentication (%s)', 'https://othertesturl.com:443/prefix']);
});

test.serial('Verify token and repository access with alternative environment varialbes', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_URL: 'https://othertesturl.com:443', GITEE_TOKEN: 'gitee_token'};
  const gitee = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .reply(200, {permission: {push: true}});

  await t.notThrowsAsync(
    verify({}, {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger})
  );
  t.true(gitee.isDone());
});

test('Throw SemanticReleaseError for missing Gitee token', async t => {
  const env = {};
  const [error, ...errors] = await t.throwsAsync(
    verify(
      {},
      {env, options: {repositoryUrl: 'https://gitee.com/lotosbin/semantic-release-gitee.git'}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'ENOGITEETOKEN');
});

test.serial('Throw SemanticReleaseError for invalid token', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const gitee = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .reply(401);

  const [error, ...errors] = await t.throwsAsync(
    verify({}, {env, options: {repositoryUrl: `https://gitee.com:${owner}/${repo}.git`}, logger: t.context.logger})
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDGITEETOKEN');
  t.true(gitee.isDone());
});

test.serial('Throw SemanticReleaseError for invalid repositoryUrl', async t => {
  const env = {GITEE_TOKEN: 'gitee_token'};
  const giteeUrl = 'https://gitee.com/context';

  const [error, ...errors] = await t.throwsAsync(
    verify({giteeUrl}, {env, options: {repositoryUrl: 'git+ssh://git@gitee.com/context.git'}, logger: t.context.logger})
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDGITEEURL');
});

test.serial('Throw AggregateError if multiple verification fails', async t => {
  const env = {};
  const giteeUrl = 'https://gitee.com/context';
  const assets = 42;

  const [invalidUrlError, invalidAssetsError, noTokenError, ...errors] = await t.throwsAsync(
    verify(
      {assets, giteeUrl},
      {env, options: {repositoryUrl: 'git+ssh://git@gitee.com/context.git'}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(invalidUrlError.name, 'SemanticReleaseError');
  t.is(invalidUrlError.code, 'EINVALIDGITEEURL');
  t.is(invalidAssetsError.name, 'SemanticReleaseError');
  t.is(invalidAssetsError.code, 'EINVALIDASSETS');
  t.is(noTokenError.name, 'SemanticReleaseError');
  t.is(noTokenError.code, 'ENOGITEETOKEN');
});

test.serial("Throw SemanticReleaseError if token doesn't have the push permission on the repository", async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const gitee = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .reply(200, {permission: {push: false}});

  const [error, ...errors] = await t.throwsAsync(
    verify({}, {env, options: {repositoryUrl: `https://gitee.com:${owner}/${repo}.git`}, logger: t.context.logger})
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EGLNOPERMISSION');
  t.true(gitee.isDone());
});

test.serial("Throw SemanticReleaseError if the repository doesn't exist", async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const gitee = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .reply(404);

  const [error, ...errors] = await t.throwsAsync(
    verify({}, {env, options: {repositoryUrl: `https://gitee.com:${owner}/${repo}.git`}, logger: t.context.logger})
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EMISSINGREPO');
  t.true(gitee.isDone());
});

test.serial('Throw error if Gitee API return any other errors', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEE_TOKEN: 'gitee_token'};
  const gitee = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .query(true)
    .times(3)
    .reply(500);

  const error = await t.throwsAsync(
    verify({}, {env, options: {repositoryUrl: `https://gitee.com:${owner}/${repo}.git`}, logger: t.context.logger})
  );

  t.is(error.response.statusCode, 500);
  t.true(gitee.isDone());
});

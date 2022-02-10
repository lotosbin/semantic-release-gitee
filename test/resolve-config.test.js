const test = require('ava');
const urlJoin = require('url-join');
const resolveConfig = require('../lib/resolve-config');

test('Returns default config', t => {
  const giteeToken = 'TOKEN';
  const giteeApiPathPrefix = '/api/prefix';
  const giteeUrl = 'https://gitee.com';

  t.deepEqual(resolveConfig({}, {env: {GITEE_TOKEN: giteeToken}}), {
    giteeToken,
    giteeUrl: 'https://gitee.com',
    giteeApiUrl: urlJoin('https://gitee.com', '/api/v5'),
    assets: undefined,
    milestones: undefined,
  });

  t.deepEqual(resolveConfig({giteeApiPathPrefix}, {env: {GITEE_TOKEN: giteeToken}}), {
    giteeToken,
    giteeUrl: 'https://gitee.com',
    giteeApiUrl: urlJoin('https://gitee.com', giteeApiPathPrefix),
    assets: undefined,
    milestones: undefined,
  });

  t.deepEqual(resolveConfig({giteeUrl}, {env: {GITEE_TOKEN: giteeToken}}), {
    giteeToken,
    giteeUrl: 'https://gitee.com',
    giteeApiUrl: urlJoin(giteeUrl, '/api/v5'),
    assets: undefined,
    milestones: undefined,
  });
});

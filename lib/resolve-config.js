const {castArray, isNil} = require('lodash');
const urlJoin = require('url-join');

module.exports = (
  {giteeUrl, giteeApiPathPrefix, assets, milestones},
  {env: {GITEE_TOKEN, GITEE_URL, GITEE_PREFIX}}
) => {
  const _giteeUrl = giteeUrl || GITEE_URL || 'https://gitee.com';
  const _giteeApiPathPrefix = isNil(giteeApiPathPrefix)
    ? isNil(GITEE_PREFIX)
      ? '/api/v5'
      : GITEE_PREFIX
    : giteeApiPathPrefix;
  return {
    giteeToken: GITEE_TOKEN,
    giteeUrl: _giteeUrl,
    giteeApiUrl: urlJoin(_giteeUrl, _giteeApiPathPrefix),
    assets: assets ? castArray(assets) : assets,
    milestones: milestones ? castArray(milestones) : milestones,
  };
};

const {isString, isPlainObject, isArray} = require('lodash');
const debug = require('debug')('semantic-release:gitee');
const urlJoin = require('url-join');
const got = require('got');
const AggregateError = require('aggregate-error');
const resolveConfig = require('./resolve-config');
const getRepoId = require('./get-repo-id');
const getError = require('./get-error');

const isNonEmptyString = value => isString(value) && value.trim();
const isStringOrStringArray = value => isNonEmptyString(value) || (isArray(value) && value.every(isNonEmptyString));
const isArrayOf = validator => array => isArray(array) && array.every(value => validator(value));

const VALIDATORS = {
  assets: isArrayOf(
    asset => isStringOrStringArray(asset) || (isPlainObject(asset) && isStringOrStringArray(asset.path))
  ),
};

module.exports = async (pluginConfig, context) => {
  const {
    options: {repositoryUrl},
    logger,
  } = context;
  const errors = [];
  const {giteeToken, giteeUrl, giteeApiUrl, assets} = resolveConfig(pluginConfig, context);
  const repoId = getRepoId(context, giteeUrl, repositoryUrl);
  debug('apiUrl: %o', giteeApiUrl);
  debug('repoId: %o', repoId);

  if (!repoId) {
    errors.push(getError('EINVALIDGITEEURL'));
  }

  if (assets && !VALIDATORS.assets(assets)) {
    errors.push(getError('EINVALIDASSETS'));
  }

  if (!giteeToken) {
    errors.push(getError('ENOGITEETOKEN', {repositoryUrl}));
  }

  if (giteeToken && repoId) {
    let pushAccess;
    logger.log('Verify Gitee authentication (%s)', giteeApiUrl);
    try {
      const json = {
        /* eslint-disable camelcase */
        access_token: giteeToken,
        /* eslint-enable camelcase */
      };
      ({
        permission: {push: pushAccess},
      } = await got
        .get(urlJoin(giteeApiUrl, `/repos/${repoId}`), {
          searchParams: json,
        })
        .json());
      if (!pushAccess) {
        errors.push(getError('EGLNOPERMISSION', {repoId}));
      }
    } catch (error) {
      if (error.response && error.response.statusCode === 401) {
        errors.push(getError('EINVALIDGITEETOKEN', {repoId}));
      } else if (error.response && error.response.statusCode === 404) {
        errors.push(getError('EMISSINGREPO', {repoId}));
      } else {
        throw error;
      }
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }
};

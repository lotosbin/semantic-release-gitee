const nock = require('nock');
const urlJoin = require('url-join');
const resolveConfig = require('../../lib/resolve-config');

/**
 * Retun a `nock` object setup to respond to a Gitee authentication request. Other expectation and responses can be chained.
 *
 * @param {Object} [env={}] Environment variables.
 * @param {String} [giteeToken= env.GITEE_TOKEN] The gitee token to return in the authentication response.
 * @param {String} [giteeUrl= 'https://gitee.com'] The url on which to intercept http requests.
 * @param {String} [giteeApiPathPrefix= '/api/v5'] The Gitee Enterprise API prefix.
 * @return {Object} A `nock` object ready to respond to a gitee authentication request.
 */
module.exports = function(envConfig = {}, pluginConfig = {}) {
  const {giteeApiUrl} = resolveConfig(pluginConfig, {env: envConfig});
  return nock(urlJoin(giteeApiUrl));
};

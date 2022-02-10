const urlJoin = require('url-join');
const got = require('got');
const debug = require('debug')('semantic-release:gitee');
const resolveConfig = require('./resolve-config');
const getRepoId = require('./get-repo-id');

module.exports = async (pluginConfig, context) => {
  const {
    options: {repositoryUrl},
    nextRelease: {gitTag, gitHead, notes},
    logger,
  } = context;
  const {giteeToken, giteeUrl, giteeApiUrl, milestones} = resolveConfig(pluginConfig, context);
  const repoId = getRepoId(context, giteeUrl, repositoryUrl);
  const encodedGitTag = encodeURIComponent(gitTag);

  debug('repoId: %o', repoId);
  debug('release name: %o', gitTag);
  debug('release ref: %o', gitHead);
  debug('milestones: %o', milestones);

  debug('Create a release for git tag %o with commit %o', gitTag, gitHead);

  const createReleaseEndpoint = urlJoin(giteeApiUrl, `repos/${repoId}/releases`);

  const json = {
    /* eslint-disable camelcase */
    access_token: giteeToken,
    tag_name: gitTag,
    name: gitTag,
    body: notes && notes.trim() ? notes : gitTag,
    milestones,
    /* eslint-enable camelcase */
  };

  debug('POST-ing the following JSON to %s:\n%s', createReleaseEndpoint, JSON.stringify(json, null, 2));

  try {
    await got.post(createReleaseEndpoint, {
      json,
    });
  } catch (error) {
    logger.error('An error occurred while making a request to the Gitee release API:\n%O', error);
    throw error;
  }

  logger.log('Published Gitee release: %s', gitTag);

  return {url: urlJoin(giteeUrl, repoId, `/releases/${encodedGitTag}`), name: 'Gitee release'};
};

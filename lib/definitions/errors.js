const {inspect} = require('util');
const pkg = require('../../package.json');

const [homepage] = pkg.homepage.split('#');
const linkify = file => `${homepage}/blob/master/${file}`;
const stringify = object => inspect(object, {breakLength: Infinity, depth: 2, maxArrayLength: 5});

module.exports = {
  EINVALIDASSETS: ({assets}) => ({
    message: 'Invalid `assets` option.',
    details: `The [assets option](${linkify(
      'README.md#assets'
    )}) must be an \`Array\` of \`Strings\` or \`Objects\` with a \`path\` property.
Your configuration for the \`assets\` option is \`${stringify(assets)}\`.`,
  }),
  EINVALIDGITEEURL: () => ({
    message: 'The git repository URL is not a valid Gitee URL.',
    details: `The **semantic-release** \`repositoryUrl\` option must a valid Gitee URL with the format \`<Gitee_URL>/<repoId>.git\`.

By default the \`repositoryUrl\` option is retrieved from the \`repository\` property of your \`package.json\` or the [git origin url](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes) of the repository cloned by your CI environment.`,
  }),
  EINVALIDGITEETOKEN: ({repoId}) => ({
    message: 'Invalid Gitee token.',
    details: `The [Gitee token](${linkify(
      'README.md#gitee-authentication'
    )}) configured in the  \`GITEE_TOKEN\` environment variable must be a valid [personal access token](https://gitee.com/profile/personal_access_tokens) allowing to push to the repository ${repoId}.

Please make sure to set the \`GITEE_TOKEN\` environment variable in your CI with the exact value of the Gitee personal token.`,
  }),
  EMISSINGREPO: ({repoId}) => ({
    message: `The repository ${repoId} doesn't exist.`,
    details: `The **semantic-release** \`repositoryUrl\` option must refer to your Gitee repository. The repository must be accessible with the [Gitee API](https://gitee.com/api/v5/swagger).

By default the \`repositoryUrl\` option is retrieved from the \`repository\` property of your \`package.json\` or the [git origin url](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes) of the repository cloned by your CI environment.

If you are using [Gitee Enterprise Edition] please make sure to configure the \`giteeUrl\` [options](${linkify(
      'README.md#options'
    )}).`,
  }),
  EGLNOPERMISSION: ({repoId}) => ({
    message: `The Gitee token doesn't allow to push on the repository ${repoId}.`,
    details: `The user associated with the [Gitee token](${linkify(
      'README.md#gitee-authentication'
    )}) configured in the \`GITEE_TOKEN\` environment variable must allows to push to the repository ${repoId}.

Please make sure the Gitee user associated with the token has the [permission to push](https://gitee.com/profile/personal_access_tokens) to the repository ${repoId}.`,
  }),
  ENOGITEETOKEN: ({repositoryUrl}) => ({
    message: 'No Gitee token specified.',
    details: `A [Gitee personal access token](${linkify(
      'README.md#gitee-authentication'
    )}) must be created and set in the \`GITEE_TOKEN\` environment variable on your CI environment.

Please make sure to create a [Gitee personal access token](https://gitee.com/profile/personal_access_tokens) and to set it in the \`GITEE_TOKEN\` environment variable on your CI environment. The token must allow to push to the repository ${repositoryUrl}.`,
  }),
};

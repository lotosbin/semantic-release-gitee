const parsePath = require('parse-path');
const escapeStringRegexp = require('escape-string-regexp');

module.exports = (_, giteeUrl, repositoryUrl) =>
  parsePath(repositoryUrl)
    .pathname.replace(new RegExp(`^${escapeStringRegexp(parsePath(giteeUrl).pathname)}`), '')
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/\.git$/, '');

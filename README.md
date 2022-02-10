# semantic-release-gitee
[![npm version](https://badge.fury.io/js/semantic-release-gitee.svg)](https://badge.fury.io/js/semantic-release-gitee)

[**semantic-release**](https://github.com/semantic-release/semantic-release) 


| Step               | Description                                                                                                           |
|--------------------|-----------------------------------------------------------------------------------------------------------------------|
| `verifyConditions` | Verify the presence and the validity of the authentication (set via [environment variables](#environment-variables)). |
| `publish`          | Publish a [Gitee release]().                                        |

## Install

```bash
$ npm install semantic-release-gitee -D
```

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["semantic-release-gitee", {
    }],
  ]
}
```

With this example [Gitee releases]() will be published to the `https://gitee.com` instance.

## Configuration

### Gitee authentication

The Gitee authentication configuration is **required** and can be set via
[environment variables](#environment-variables).

Create a [personal access token]() with the `api` scope and make it available in your CI environment via the `GITEE_TOKEN` environment variable. If you are using `GITEE_TOKEN` as the [remote Git repository authentication](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/ci-configuration.md#authentication) it must also have the `write_repository` scope.

### Environment variables

| Variable                       | Description                                               |
|--------------------------------|-----------------------------------------------------------|
| `GITEE_TOKEN`   | **Required.** The token used to authenticate with Gitee. |

### Options

| Option                | Description                                                                                                                                    | Default                                                                                                                                                                 |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `giteeApiPathPrefix` | The Gitee API prefix.                                                                                                                         | `GITEE_PREFIX` environment variable or CI provided environment variables if running on ci or `/api/v5`.      |

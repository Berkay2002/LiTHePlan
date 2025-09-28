# Claude Code Actions Setup Guide

Use this guide to add Anthropic's Claude Code GitHub Action to your repository and keep the integration secure.

## 1. Quick Start (Official Claude GitHub App)

The fastest way to get going is to use the official Claude GitHub App together with the hosted Anthropic API.

**Prerequisites**

- Repository admin access
- Either an Anthropic API key (Pro plan or higher) or a Claude Code OAuth token

**Steps**

1. Install the Claude GitHub App: https://github.com/apps/claude
2. In GitHub, open Settings > Secrets and variables > Actions and add one of the following secrets:
   - `ANTHROPIC_API_KEY` containing the API key that starts with `sk-ant-`
   - `CLAUDE_CODE_OAUTH_TOKEN` generated locally via `claude setup-token`
3. Create a workflow file at `.github/workflows/claude.yml` with the contents below:

   ```yaml
   name: Claude Code Assistant

   on:
     issue_comment:
       types: [created]
     pull_request:
       types: [opened, reopened, ready_for_review]

   jobs:
     claude:
       runs-on: ubuntu-latest
       permissions:
         contents: write
         issues: write
         pull-requests: write
       steps:
         - uses: actions/checkout@v4
         - uses: anthropics/claude-code-action@v1
           with:
             anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
             github_token: ${{ secrets.GITHUB_TOKEN }}
             # optional: repository default prompt/settings
             # prompt: "You are the LiTHePlan assistant..."
   ```

4. Commit the workflow on your default branch. Claude will then respond to new pull requests and mentions that trigger the workflow.

**Tip:** Replace the trigger list with whatever events make sense for your repo (for example, only `issue_comment` events that include `/claude`).

## 2. Choosing an Authentication Method

| Method | When to use it | Secret name | How to obtain |
| --- | --- | --- | --- |
| API key | Standard Claude API access | `ANTHROPIC_API_KEY` | Generate in the Anthropic console |
| OAuth token | Claude desktop users who want short-lived tokens | `CLAUDE_CODE_OAUTH_TOKEN` | Run `claude setup-token` locally (Pro and Max) |

- Define only one of the secrets; the action prefers `CLAUDE_CODE_OAUTH_TOKEN` when both exist.
- Rotate secrets regularly and remove credentials that are no longer needed.

## 3. Optional: Use a Custom GitHub App

If policy prevents installing the official app, create a custom GitHub App and scope its permissions tightly.

1. Go to https://github.com/settings/apps (or your organization settings) and choose New GitHub App.
2. Configure minimum repository permissions:
   - Contents: Read and write
   - Issues: Read and write
   - Pull requests: Read and write
3. Generate a private key (`.pem`) for the app and store it securely.
4. Install the app on the repositories that should use Claude.
5. Add these secrets in Settings > Secrets and variables > Actions:
   - `APP_ID`: The numeric GitHub App ID
   - `APP_PRIVATE_KEY`: The full text of the private key file
   - `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN`
6. Update your workflow so the job impersonates your app:

   ```yaml
   jobs:
     claude:
       runs-on: ubuntu-latest
       steps:
         - name: Generate GitHub App token
           id: app-token
           uses: actions/create-github-app-token@v1
           with:
             app-id: ${{ secrets.APP_ID }}
             private-key: ${{ secrets.APP_PRIVATE_KEY }}

         - uses: anthropics/claude-code-action@v1
           with:
             anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
             github_token: ${{ steps.app-token.outputs.token }}
   ```

The app token inherits exactly the permissions you assign, so double-check them before installation.

## 4. Security Best Practices

- Never commit API keys or tokens to version control.
- Prefer organization or environment secrets when multiple repositories share the same credentials.
- Avoid logging secrets in workflow output; keep values referenced as `${{ secrets.NAME }}`.
- Rotate credentials on a schedule and immediately if a leak is suspected.
- Grant the GitHub App only the minimum permissions the workflow requires.

### Setting GitHub Secrets

1. Navigate to Settings > Secrets and variables > Actions.
2. Select New repository secret.
3. Enter the secret name (`ANTHROPIC_API_KEY`, `CLAUDE_CODE_OAUTH_TOKEN`, `APP_ID`, or `APP_PRIVATE_KEY`).
4. Paste the value, then choose Add secret. Repeat for each credential.

Correct usage in workflows:

```yaml
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Incorrect usage that exposes the value:

```yaml
anthropic_api_key: "sk-ant-..."
```

## 5. Verify and Troubleshoot

- After merging the workflow, open the Actions tab to confirm that the new workflow appears without configuration warnings.
- Trigger the workflow (for example, open a pull request or leave a `/claude help` comment) and ensure a run starts.
- If a run fails with `403` errors, review repository permissions and verify which token is passed to the action.
- Missing responses usually indicate that the secret is not defined or that the trigger did not match; inspect the workflow logs for details.
- For more configuration options (model selection, prompt templates, auto-responses), review the action's README on GitHub.

# Release Guide

This project uses [Semantic Release](https://semantic-release.gitbook.io/) for automated versioning and releases.

## How it works

1. **Automatic Versioning**: Based on commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification
2. **Automatic Changelog**: Updates CHANGELOG.md with release notes
3. **GitHub Releases**: Creates releases with assets
4. **NPM Publishing**: Publishes to npm registry (if NPM_TOKEN is configured)

## Commit Message Format

Use the following format for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types:
- `feat`: New feature (minor version bump)
- `fix`: Bug fix (patch version bump)
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

### Examples:
- `feat: add support for custom notification templates`
- `fix: resolve connection timeout issue`
- `docs: update installation instructions`

## Manual Release Trigger

You can manually trigger a release by:
1. Going to Actions → Release workflow
2. Click "Run workflow"
3. Select the branch (main)

## Required Secrets

Make sure these secrets are configured in your repository:

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `NPM_TOKEN`: (Optional) For publishing to npm registry

## Release Process

1. Push commits to main branch
2. GitHub Actions runs the release workflow
3. Semantic Release analyzes commits
4. New version is determined and tagged
5. CHANGELOG.md is updated
6. GitHub release is created
7. NPM package is published (if configured)

## Skipping Releases

To skip the release process, include `[skip ci]` in your commit message.
# Tools

Tools used to manage monorepo tasks like pre-commit hooks and npm releases.

## How to create a release

The release script (run from the monorepo root) must be used to create and publish releases. All releases must follow semver versioning standards, e.g., `0.20.1`.

Checkout a release branch from latest `main`:

```shell
git checkout main
git pull origin main
git checkout -b release/<version>
```

You can perform a dry run by only specifying the new version for a release:

```shell
npm run release -- --pkg-version <version>
```

To commit the release:

```shell
npm run release -- --pkg-version <version> --commit
```

Push the branch up for review:

```shell
git push origin release/<version>
```

Once the branch has been merged, update `main` and the git-tag.

```shell
git checkout main
git pull origin main
git tag -am <version> "<version>"
git push --tags origin main
```

To publish the release:

```shell
npm run release -- --pkg-version <version> --publish --otp 123456
```

# Tools

Tools used to manage monorepo tasks like pre-commit hooks and npm releases.

## How to create a release

The release script (run from the monorepo root) must be used to create and publish releases.

```shell
npm run release
  # package version (required)
  --pkg-version 0.10.2
  # creates git commit and tag
  --commit
  # publishes to npm using 2fa
  --publish --otp 123456
```

You can perform a dry run by only specifying the new version for a release:

```shell
npm run release -- --pkg-version 0.10.2
```

To commit and tag the release:

```shell
npm run release -- --pkg-version 0.10.2 --commit
```

To publish the release:

```shell
npm run release -- --pkg-version 0.10.2 --publish
```

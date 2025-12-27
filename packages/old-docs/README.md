# StyleX website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## Local Development

Local development should be performed from the monorepo root.
Please see the monorepo's CONTRIBUTING.md file for more instructions.

### Deployment

Using SSH:

```bash
$ USE_SSH=true npm run deploy
```

Not using SSH:

```bash
$ GIT_USER=<Your GitHub username> npm run deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push it to the `gh-pages` branch.

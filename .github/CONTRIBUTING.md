# Contributing

## Reporting Issues and Asking Questions

Before opening an issue, please search the issue tracker to make sure your issue
hasn't already been reported. Please note that your issue may be closed if it
doesn't include the information requested in the issue template.

## Getting started

Visit the issue tracker to find a list of open issues that need attention.

Fork, then clone the repo:

```
git clone https://github.com/your-username/stylex.git
```

Make sure you have npm@>=7 and node@>=16 installed. Then install the package
dependencies:

```
npm install
```

## Automated tests

To run the linter:

```
npm run lint
```

To run flow:

```
npm run flow
```

To run all the unit tests:

```
npm run test
```

…in watch mode:

```
npm run test -- --watch
```

## Compile and build

To compile the source code:

```
npm run build
```

### New Features

Please, familiarize yourself with
[StyleX's architectural principles](https://stylex-docusaurus.vercel.app/docs/learn/thinking-in-stylex/),
and open an issue with a proposal when suggesting a new feature of behavioural
change. We don't want you to waste your efforts on a pull request that we won't
want to accept.

## Pull requests

**Before submitting a pull request**, please make sure the following is done:

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests!
3. If you've changed APIs, update the documentation.
4. Ensure the tests pass (`npm run test`).

You can now submit a pull request, referencing any issues it addresses.

Please try to keep your pull request focused in scope and avoid including
unrelated commits.

After you have submitted your pull request, we'll try to get back to you as soon
as possible. We may suggest some changes or improvements.

Thank you for contributing!

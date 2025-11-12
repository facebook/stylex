---
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
slug: introducing-stylex
title: Introducing StyleX
authors: [nmn, necolas]
tags: [announcement]
---

We are thrilled to introduce StyleX. StyleX is an expressive, deterministic,
reliable, and scalable styling system for ambitious applications. We've taken
the best ideas from the styling libraries that have come before to create
something that is simultaneously familiar and uniquely new.

## What is StyleX?

StyleX takes the developer experience of CSS-in-JS libraries and uses
compile-time tooling to bridge it with the performance and scalability of static
CSS. However, StyleX is not just another compiler-based CSS-in-JS library.
StyleX has been carefully designed to meet the requirements of large
applications, reusable component libraries, and statically typed codebases.

1. StyleX supports an expressive subset of CSS. It avoids complex selectors and
   guarantees no specificity conflicts in the generated CSS.
2. StyleX transforms, organizes, and optimizes styles into "atomic" CSS class
   names. There's no need to learn or manage a separate library of utility class
   names.
3. StyleX allows styles to be merged across file and component boundaries,
   making it ideal for component libraries that allow user customization.
4. StyleX is fully typed and provides type utilities to allow fine-grained
   control over what properties and values can be accepted by a component.

## What are the advantages of StyleX?

### Fast

StyleX is designed to be fast at both compile-time and runtime. The Babel
transforms do not significantly slow down builds.

At runtime, StyleX entirely avoids the costs associated with using JavaScript to
insert styles at runtime, and does little more than efficiently combine class
name strings when necessary. And the generated CSS is optimized for size,
ensuring that the styles for even the largest websites can be quickly parsed by
browsers.

### Scalable

StyleX is designed to scale to extremely large codebases, like the ones we have
at Meta. The Babel plugin can handle processing styles in many thousands of
components at compile-time by leveraging atomic builds and file-level caching.
And because StyleX is designed to encapsulate styles, it allows new components
to be developed in isolation with the expectation that they will render
predictably once used within other components.

By generating atomic CSS class names, StyleX helps minimize the size of the CSS
bundle. As the number of components in an application grows, the size of the CSS
bundle starts to plateau. This frees developers from having to manually optimize
or lazy-load CSS files.

### Predictable

StyleX automatically manages the specificity of CSS selectors to guarantee that
there are no collisions between the generated rules. StyleX gives developers a
system that reliably applies styles, and ensures that "the last style applied
always wins"

### Composable

StyleX styles are easy to compose. Not only can multiple local styles be applied
conditionally, styles can also be passed across files and components. Styles
always merge with predictable results.

### Type-Safe

You can constrain the styles a component accepts by using TypeScript or Flow
types. Every style property and variable is fully typed.

### Colocation

StyleX allows and encourages authoring styles in the same file as the component
that uses them. This co-location helps make styles more readable and
maintainable in the long run. StyleX is able to use static analysis and
build-time tools to de-duplicate styles across components and to remove unused
styles.

### Testable

StyleX can be configured to output debug class names _instead_ of functional
atomic class names. This can be used to generate snapshots that don't change as
often in response to minor design changes.

## How does StyleX work?

StyleX is a collection of tools that work together.

- A Babel plugin
- A small runtime library
- An ESlint plugin
- A growing collection of integrations with bundlers and frameworks.

The most important part of StyleX is the Babel plugin. It finds and extracts all
the styles defined within your source code and converts them to atomic class
names at compile time. A helper function deduplicates, sorts, and writes the
collected styles to a CSS file. These tools are used to implement bundler
plugins.

To make using StyleX feel as natural as possible, StyleX supports various static
patterns to define your styles by using local constants and expressions.
Additionally, in order to give you the best performance possible, the Babel
plugin also pre-computes the final class names when possible to remove any
runtime cost — even merging class names — from a given file. If a component is
defining and using styles within the same file statically, the runtime cost will
be **ZERO**.

When using more powerful patterns such as style composition, a tiny runtime
merges objects of class names dynamically. This runtime has been optimized to be
extremely fast and the results are then memoized.

## The origins of StyleX

The previous Facebook website used something akin to CSS modules and suffered
from various problems that inspired
[the initial idea for CSS-in-JS](https://blog.vjeux.com/2014/javascript/react-css-in-js-nationjs.html).
The average visitor to [facebook.com](https://www.facebook.com/) would download
tens of megabytes of CSS. Much of it unused. In order to optimize the initial
load, we would lazy load our CSS which would, in turn, lead to slow update (or
"Interaction to Next Paint") times. Usage of complex selectors would lead to
conflicts or "specificity wars". Engineers would often resort to using
`!important` or more complex selectors to solve their problems, making the
entire system progressively worse.

A few years ago, when we were rebuilding
[facebook.com](https://www.facebook.com/) from the ground up using React, we
knew we needed something better and built StyleX.

StyleX was designed to scale, and the design has proven itself in our years of
experience using it. We've added new features to StyleX without regressing on
performance or scalability while making StyleX more of a joy to use.

Using StyleX has been a massive improvement in both scalability and expressivity
for us at Meta. On `facebook.com` we were able to bring down our CSS bundle from
tens of megabytes of lazy-loaded CSS to a single bundle of a couple hundred
kilobytes.

We created StyleX not only to meet the styling needs of React developers on the
web, but to unify styling for React across web and native.

## How does Meta use StyleX?

StyleX has become the preferred way to style components for every web surface
within Meta. StyleX is used to style React components for every major external
and internal product at Meta including Facebook, WhatsApp, Instagram, Workplace,
and Threads. It has changed the way we author components, and resolved the
issues our teams previously had with not being able to encapsulate and scale
their styled components.

We expanded the original capabilities of StyleX so that engineers at Meta can
use StyleX to author both static and dynamic styles. Our teams are using StyleX
theming APIs to develop "universal" components that are themed to take on the
appearance of different design systems used within different Meta products. And
we're gradually expanding support for cross-platform styling, thanks to StyleX
being aligned with the principles of encapsulation introduced by React Native's
styling system.

## Open Source

What we're open sourcing is what we use internally. We develop on Github first
and sync it back to Meta. Although StyleX was originally created at Meta for
Meta, it is not specific to Meta.

That said, this is still just the beginning. We look forward to working with the
community to introduce further optimizations and more integrations.

We hope you love using StyleX as much as we do. ❤️

# Why JS Objects and not a CSS string

When looking at the various CSS-in-JS (or similar) solutions that exist there are two common patterns when it comes to the API:
1. JS objects like we do in Stylex
2. Tagged Template strings that let you write normal CSS syntax in a string

Sometimes, after getting tired of wrapping your CSS values in quotes, you may start to wonder why Stylex doesn't use CSS syntax in a tagged template string like GraphQL and Relay do? 
This is a valid question. After all, CSS syntax is familiar, easier to write and easier to copy existing styles over.
However, if you think deeply into what that would entail, and more importantly, the benefits of JS Object syntax the choice becomes clear.

## Implementation Burden
While it would be a little more work to support CSS syntax and add tooling for it, it's actually not that big a task.
We could use a post-css parser in our existing tooling and support template strings quite easily in both Babel and ESLint.

## Loss of Types
A big benefit of using function calls and plain JS Objects is that we can get very good static typing without a build step. Stylex allows you  to set `Prop` types that is able to constrain what styles (and what values for your styles) a component accepts.
Want a component that is fully customisable, just accept a prop with the type `XStyle<>` and it'll work!
Want to accept only a custom background color and nothing else? No problem just change the type to: `XStyle<{backgroundColor: StyleXClassname}>`.
Want to limit the values that the background color can have? You can do that too!

**Strings Don't have Types**
Switching to CSS strings will mean we lose all type information when you define styles. This is why Relay needs a build-step and development time to generate a file with Flow types that you then need to import and use. We could of course do that too, but I think considering the tradeoffs, using Object Syntax is simpler.

## Incorrect Expectations
StyleX uses "Atomic Styles". i.e It creates a separate className for each unique style key-value pair. When you define a single group of styles within `stylex.create`, it's actually creating a one className per key in the object.
Generally, you shouldn't need to know how StyleX works behind the scenes, but it can be useful to under stand that you're getting Objects back from `stylex.create` calls and know what the structure of those objects looks like.
Using CSS strings would give engineers the incorrect impression that they're simply writing CSS Rules (with selectors) within a Javascript string. They'll try complicated, unsupported selectors more often. They're try to use unsupported properties more often.
Eventually, our ESlint rules and Compilers will need to disallow *all* the patterns that work in CSS but are not supported in StyleX. This will make stylex an unpleasant experience as the API implies one thing but it does the other.

## Conclusion
Could we support an additional syntax for CSS strings? Sure! Should we? I don't think so.
Instead, there might be ways to improve the API and make it easier to read and write by using additional Javascript functions.
We could introduce additional function within *javascript* that makes CSS easier to write.

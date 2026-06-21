load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("//:defs.bzl", "stylex_lib")

npm_package(
    name = "stylex",
    package = "@stylexjs/stylex",
    srcs = ["lib/**/*"],
    deps = [
        ":stylex_deps",
    ],
)

stylex_lib(
    name = "stylex_deps",
    srcs = ["src/**/*.js"],
    deps = [
        "//packages/babel-plugin:babel-plugin",
    ],
)

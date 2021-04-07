# Dark Blue Uploader

This is a desktop application for packaging and uploading artifacts. It is
still very young and does not implement everything. It provides a desktop
front-end to the classic `chipmunk-client` features.

## Using the app

There are two main components that must be set up separately: the desktop
application and Docker, to run the containerized command-line client.

To install Docker, follow the
[instructions](https://docs.docker.com/get-docker/) on the community site.

To install the Uploader, (...download the release of built .app or whatever, under Releases...)

## Development Setup

The application is built using Electron, which requires Node.js. We currently
depend on v14.16 (and the included npm 6). If you do not have a preferred way
to manage your Node environment, consider using [Volta](https://volta.sh/).

Setting up Volta and getting Node 14 is simple:

```
curl https://get.volta.sh | bash
volta install node@14
```

If you use Volta, the node and npm versions will be selected when you are in
this directory.

Just as with simply using the application, Docker is required. If you are using
Linux, you may need to add your user to the `docker` group or manage another
way such that `docker run` can be used with no special paths or flags. This may
be configurable later. On a Mac, plain Docker Desktop 3.0+ should work with no
special settings. Just launch "Docker".

Once the basics are in place, you will need to do a regular `npm install` to
download all of the packages.

There are two separate test suites and a linter included:

* Acceptance tests, using Cucumber-js, under [features](./features)
* Unit tests, using Mocha, Chai, and Sinon, under [test](./test)
* Syntax / style checking, using [standard](https://standardjs.com)

There are generically named "scripts" for linting, running units tests, and
running acceptance/feature tests. To run all three in order, you can use:

```
npm run lint
npm run units
npm run features
```

To make running the unit tests as familiar and convenient as possible, they are
set up for `npm test`. Using the "test" shortcut also runs the linter before
the unit tests to help keep things tidy as you work. The tests can be run
without the linter with `npx mocha` or simply `mocha`, if you have it installed
globally.

One handy trick is to have two terminals open and run `mocha -w` in one, to
watch for changes and rerun the unit tests. In the other, you can use a file
watcher to run `standard` (or `npx standard` or `npm run lint`) upon changes.
You can also pass `--verbose` or `--fix` flags to get more detailed messages or
make any available automatic corrections, respectively.

As an example, `fd | entr -c npx standard --verbose` gives very quick feedback.
See [fd](https://github.com/sharkdp/fd) and
[entr](http://eradman.com/entrproject/) for more info on those tools.

The acceptance tests require a build of the full client, so they are best run
as `npm run cukes`. You can run `cucumber-js`, but you might end up with
something stale in the UI and waste time chasing false failures or miss real
problems.

Likewise, an autorunner _can_ be useful here, but the acceptance tests run for
quite a while and pop up and focus the client window, so it might not be
desirable to have them run on every change.

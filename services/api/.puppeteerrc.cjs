// Pins Puppeteer's Chrome download to a path relative to this package,
// instead of the default `$HOME/.cache/puppeteer`.
//
// Root cause this fixes: on Render, `npm install`'s build phase and the
// running server process don't reliably agree on `$HOME` (a known
// Puppeteer + Render gotcha — https://pptr.dev/guides/configuration),
// so the browser gets downloaded during build but can't be found at
// runtime ("Could not find Chrome ... check your cache path"). Puppeteer
// reads this config file at both install-time and launch-time, so pinning
// the path here makes the two phases agree regardless of how `$HOME`
// resolves in either one. `.cache/` is already gitignored at the repo root.
const { join } = require('path');

module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};

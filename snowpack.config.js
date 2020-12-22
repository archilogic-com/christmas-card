/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: {url: '/', static: true},
    js: {url: '/dist'},
    model: {url: '/model'},
    island: {url: '/island'},
    skymap: {url: '/skymap'},
  },
  plugins: [
    /* ... */
  ],
  install: [
    /* ... */
  ],
  installOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  }, 
  alias: {
    /* ... */
  },
};
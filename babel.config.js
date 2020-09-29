const presets = [
  [
    '@babel/preset-env',
    {
      targets: {
        firefox: '60',
        chrome: '70',
        ie: '11',
        edge: '44',
        safari: '11',
        opera: '50',
      },
      modules: false,
    }
  ],
];

const plugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-private-methods',
  '@babel/plugin-proposal-optional-chaining',
  '@babel/plugin-proposal-object-rest-spread',
];

module.exports = {
  presets,
  plugins,
  ignore: [ 'node_modules/**' ],
};

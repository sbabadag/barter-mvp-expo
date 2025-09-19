const { getDefaultConfig } = require('@expo/metro-config');
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add path mapping support for TypeScript aliases
config.resolver.alias = {
  "@": path.resolve(__dirname, "."),
  "@/src": path.resolve(__dirname, "src"),
};

// Enable hot reloading and fast refresh always
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    if (!url.endsWith('.bundle')) {
      return url;
    }
    return url + '?platform=ios&dev=true&hot=true&minify=false';
  },
};

// Force development mode settings for hot reload
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;

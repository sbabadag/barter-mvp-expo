const { getDefaultConfig } = require('@expo/metro-config');
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add path mapping support for TypeScript aliases
config.resolver.alias = {
  "@": path.resolve(__dirname, "."),
  "@/src": path.resolve(__dirname, "src"),
};

module.exports = config;

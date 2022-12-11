import pluginCommonjs from "@rollup/plugin-commonjs";
import pluginJson from "@rollup/plugin-json";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import pluginTypescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  plugins: [pluginTypescript(), pluginNodeResolve(), pluginCommonjs(), pluginJson()],
};

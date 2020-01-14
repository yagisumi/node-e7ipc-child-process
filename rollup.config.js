import typescript from 'rollup-plugin-typescript2'

export default {
  input: './src/e7ipc-child-process.ts',
  output: {
    file: './lib/e7ipc-child-process.js',
    format: 'cjs',
    sourcemap: true,
    sourcemapExcludeSources: true,
  },
  external: ['child_process', 'events', '@yagisumi/e7ipc-types'],

  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          module: 'es2015',
          sourceMap: true,
          declaration: false,
        },
      },
    }),
  ],
}

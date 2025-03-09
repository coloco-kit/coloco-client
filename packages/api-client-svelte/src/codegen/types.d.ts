export interface Config {
  /**
   * Plugin name. Must be unique.
   */
  name: 'coloco-codegen';
  /**
   * Name of the generated file.
   *
   * @default 'coloco-codegen'
   */
  output?: string;
  /**
   * Name of the generated file.
   *
   * @default 'coloco-codegen'
   */
  paramStyle?: 'rest' | 'flat';
  /**
   * Path to the output directory.
   *
   * @default './api'
   */
  outputPath?: string;
}
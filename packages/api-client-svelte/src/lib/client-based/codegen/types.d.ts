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


  // Override the default function names
  functionName?: (name: string) => string;
}
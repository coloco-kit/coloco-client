import type { Plugin } from '@hey-api/openapi-ts';
import type { Config } from './types';
import fs from 'fs';
import path from 'path';
import process from 'node:process';
export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const operationsByPath: Record<string, string[]> = {};
  const mappingsByOperation: Record<string, Record<string, "body" | "query" | "path">> = {};
  const baseFunctionName = plugin.baseFunctionName ? plugin.baseFunctionName : (name: string) => `_${name}Request`;
  const functionName = plugin.functionName ? plugin.functionName : (name: string) => name;

  // Collect all reference types
  const refs: any = {};
  context.subscribe('schema', (data) => {
    refs[data.$ref] = data.schema;
  });

  function addMappings(mappings: Record<string, "body" | "query" | "path">, data: any, param: "body" | "query" | "path") {
    if (!data){
      return;
    } else if (data["$ref"]) {
      const ref = refs[data["$ref"]];
      if (ref.type === "object") {
        addMappings(mappings, ref.properties, param);
      } else {
        console.error("Non-object ref", ref);
      }
    } else {
      for (const key of Object.keys(data)) {
        mappings[key] = param;
      }
    }
  }

  // Map operations
  context.subscribe('operation', ({ operation }) => {
    // Create mappings for arguments for flat calls
    if (plugin.paramStyle === "flat") {
      const mappings = {};
      mappingsByOperation[operation.id] = mappings;
      addMappings(mappings, operation.parameters?.path, 'path');
      addMappings(mappings, operation.parameters?.query, 'query');
      addMappings(mappings, operation.body?.schema, 'body');
    }

    const module = operation.summary?.match(/\((.+?)\)$/)?.[1];
    if (module) {
      const outputPath = path.join(context.config.output.path, `${plugin.outputPath}/${module.replace('.', '/')}.ts`);
      if (!operationsByPath[outputPath]) {
        operationsByPath[outputPath] = [];
      }
      operationsByPath[outputPath].push(operation.id);
    }
  });

  // Save files on all finished
  context.subscribe('after', () => {
    for (const [outputPath, operations] of Object.entries(operationsByPath)) {
      const importRelative = path.relative(path.dirname(outputPath), context.config.output.path);
      // ensure the directory exists
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(
        outputPath,
        `import { ${operations.map(baseFunctionName).join(', ')} } from "${importRelative}/sdk.gen";\n` +
        `import { ${plugin.paramStyle === "flat" ? 'apiCallFlat' : 'apiCallRest'} } from "@coloco/api-client-svelte";\n\n` +
        operations.map(operation => plugin.paramStyle === "flat" ? 
            `export const ${functionName(operation)} = apiCallFlat(${baseFunctionName(operation)}, ${JSON.stringify(mappingsByOperation[operation])});\n` : 
            `export const ${functionName(operation)} = apiCallRest(${baseFunctionName(operation)}));\n`
        ).join('')
      );
    }
  });
  // Super hacky way to rename the generated functions
  process.on('beforeExit', (code: any) => {
    // Update the sdk.gen file
    const sdkPath = path.join(context.config.output.path, 'sdk.gen.ts');
    const sdk = fs.readFileSync(sdkPath, 'utf8');
    fs.writeFileSync(sdkPath, sdk.replace(/export const (.+?) =/g, (_, match) => `export const ${baseFunctionName(match)} =`));
  });
};
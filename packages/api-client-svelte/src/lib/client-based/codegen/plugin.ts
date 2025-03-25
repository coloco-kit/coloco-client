import type { IR, Plugin } from '@hey-api/openapi-ts';
import type { Config } from './types';

type Mappings = Record<string, "body" | "query" | "path">;

function sortByKey<T>(array: T[], keyFn: (item: T) => any): T[] {
  return [...array].sort((a, b) => {
    const keyA = keyFn(a);
    const keyB = keyFn(b);
    if (keyA < keyB) {
      return -1;
    }
    if (keyA > keyB) {
      return 1;
    }
    return 0;
  });
}
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const functionName = plugin.functionName ? plugin.functionName : (name: string) => name;

  const file = context.createFile({
    id: plugin.name,
    path: plugin.output,
  });

  // Collect all reference types
  const refs: any = {};
  context.subscribe('schema', (data) => {
    refs[data.$ref] = data.schema;
  });

  function addMappings(mappings: Mappings, data: any, param: "body" | "query" | "path") {
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
  const operations: {operation: IR.OperationObject, mappings: Mappings, module: string}[] = [];
  context.subscribe('operation', ({ operation }) => {
    // Create mappings for arguments for flat calls
    const mappings = {};
    if (plugin.paramStyle === "flat") {
      addMappings(mappings, operation.parameters?.path, 'path');
      addMappings(mappings, operation.parameters?.query, 'query');
      addMappings(mappings, operation.body?.schema, 'body');
    }

    const module = operation.summary?.match(/\((.+?)\)$/)?.[1];
    if (module) {
      operations.push({
        operation,
        mappings,
        module
      });
    }
  });

  // Save files on all finished
  context.subscribe('after', () => {
    // Build out operation tree
    const operationTree = {};
    for (const { mappings, module, operation } of operations) {
      let treePart: any = operationTree;
      const parts = module.split(".");
      
      // Cut out api.operation from XXX.api.operation
      //parts.splice(parts.length-2, 2);

      for (const part of parts) {
        if (!treePart.hasOwnProperty(part)) {
          treePart[part] = {};
        }
        treePart = treePart[part];
      }
      treePart[operation.id] = {__isOperation: true, operation, mappings};
    }
    // Traverse operation tree into string

    function stringify(treePart: Record<string, any>, depth = 1) {
      let output = "";
      const padding = Array(depth+1).join("  ");
      for (const [key, value] of sortByKey(Object.entries(treePart), ([key, _]) => key)) {
        output += "";
        // Operation
        if (value.__isOperation) {
          const operation: IR.OperationObject = value.operation;
          const baseCall = plugin.paramStyle === "flat" ? 
            `apiCallFlat(${functionName(operation.id)}, ${JSON.stringify(value.mappings)})` : 
            `apiCallRest(${functionName(operation.id)})`;
          output += `${padding}${functionName(operation.id)}: ${baseCall},\n`;
        } 
        // Tree
        else {
          output += `${padding}${key}: {\n`;
          output += stringify(value, depth+1);
          output += `${padding}},\n`;
        }
      }
      return output;
    }
    const code = "export const makeClient = defineClient({\n" + stringify(operationTree) + "});";

    const output = `import { ${operations.map(({ operation }) => operation.id).join(', ')} } from "./sdk.gen";\n` +
      `import { ${plugin.paramStyle === "flat" ? 'apiCallFlat' : 'apiCallRest'}, defineClient, makeSvelteRequest } from "@coloco/api-client-svelte";\n\n` +
      code;
    file.add(output);
  });
};
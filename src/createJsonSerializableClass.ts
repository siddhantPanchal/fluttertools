import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from "quicktype-core";
import * as vscode from "vscode";
import { getWorkspaceFolder, pascalToSnakeCase } from "./utils/utils";
import path from "path";
import * as fs from "fs";

async function convertJsonToClass(jsonSchemaString: string, typeName: string) {
  const jsonInput = jsonInputForTargetLanguage("dart");

  await jsonInput.addSource({
    name: typeName,
    samples: [jsonSchemaString],
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  const result = await quicktype({
    inputData,
    lang: "dart",
    rendererOptions: {
      "coders-in-class": true,
      "use-freezed": false,
      "null-safety": true,
      "use-json-annotation": true,
      "copy-with": true,
    },
  });
  return result.lines.join("\n");
}

export async function createJsonSerializableClass(uri: vscode.Uri) {
  const folderPath = uri
    ? uri.fsPath
    : (await getWorkspaceFolder())?.uri.fsPath;
  if (!folderPath) {
    return;
  }

  const className = await vscode.window.showInputBox({
    prompt: "Enter the class name (e.g., Person)",
    validateInput: (value) => {
      if (!value) {
        return "Class name is required";
      }
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Class name must start with an uppercase letter and contain only letters and numbers";
      }
      return null;
    },
  });
  if (!className) {
    return;
  }

  let schemaString = await vscode.env.clipboard.readText();
  if (validateJsonSchemaInput(schemaString) !== null) {
    const temp = await vscode.window.showInputBox({
      prompt: "Enter the json schema",
      validateInput: validateJsonSchemaInput,
    });
    if (!temp) {
      return;
    }
    schemaString = temp;
  }

  const classString = await convertJsonToClass(schemaString, className);

  await generateFile(folderPath, className, classString);
}

async function generateFile(
  folderPath: string,
  className: string,
  content: string
) {
  const fileName = pascalToSnakeCase(className);
  const filePath = path.join(folderPath, `${fileName}.dart`);

  if (fs.existsSync(filePath)) {
    const overwrite = await vscode.window.showWarningMessage(
      `File ${fileName}.dart already exists. Overwrite?`,
      "Yes",
      "No"
    );
    if (overwrite !== "Yes") {
      return;
    }
  }

  try {
    fs.writeFileSync(filePath, content);

    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(
      `Model \"${className}\" created successfully!`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error creating file: ${error}`);
  }
}

function validateJsonSchemaInput(
  value: string | undefined | null
): string | null {
  if (!value) {
    return "Schema is required";
  }
  try {
    JSON.parse(value);
  } catch (error) {
    return "Invalid JSON schema";
  }
  return null;
}

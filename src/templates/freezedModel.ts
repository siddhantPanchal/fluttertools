import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  JSONSchemaInput,
  FetchingJSONSchemaStore,
} from "quicktype-core";
import * as vscode from "vscode";
import {
  camelCaseToSnakeCase,
  getWorkspaceFolder,
  pascalToSnakeCase,
} from "../utils/utils";
import path from "path";
import * as fs from "fs";

async function convertJsonToClass(jsonSchemaString: string, typeName: string) {
  const jsonInput = jsonInputForTargetLanguage("dart");

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
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
      "use-freezed": true,
      "null-safety": true,
      "use-json-annotation": true,
    },
  });
  return result.lines.join("\n");
}

export default async function generateFreezedClass(uri: vscode.Uri) {
  const folderPath = uri ? uri.fsPath : await getWorkspaceFolder();
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
        return "Class name must start with uppercase letter and contain only letters and numbers";
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

  await generatePage(folderPath, className, classString);
}

async function generatePage(
  folderPath: string,
  className: string,
  content: string
) {
  const fileName = pascalToSnakeCase(className);
  const filePath = path.join(folderPath, `${fileName}.dart`);

  // Check if file already exists
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
    // Write main file
    fs.writeFileSync(filePath, content);

    // Generate test file if enabled and template has test content
    //   const config = vscode.workspace.getConfiguration("flutterPageGenerator");

    // Open the created file
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(
      `Model "${className}" created successfully!`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error creating page: ${error}`);
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

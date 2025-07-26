import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
  camelToSnake,
  camelToTitleCase,
  findTestDirectory,
  getImportPath,
  getWorkspaceFolder,
} from "./utils/utils";
import getAvailableTemplates, { PageTemplate } from "./templates";

export default async function createFlutterPage(uri: vscode.Uri) {
  const folderPath = uri
    ? uri.fsPath
    : (await getWorkspaceFolder())?.uri.fsPath;
  if (!folderPath) {
    return;
  }
  const templates = getAvailableTemplates();

  const selectedTemplate = await vscode.window.showQuickPick(
    templates.map((t) => ({ label: t.name, value: t.name })),
    { placeHolder: "Select a template" }
  );

  if (!selectedTemplate) {
    return;
  }

  const pageName = await vscode.window.showInputBox({
    prompt: "Enter the page name (e.g., HomePage)",
    validateInput: (value) => {
      if (!value) {
        return "Page name is required";
      }
      if (!/^[A-Z][a-zA-Z]*$/.test(value)) {
        return "Page name must start with uppercase letter and contain only letters";
      }
      return null;
    },
  });

  if (!pageName) {
    return;
  }

  await generatePage(folderPath, pageName, selectedTemplate.value);
}

async function generatePage(
  folderPath: string,
  pageName: string,
  templateName: string
) {
  const template = getTemplate(templateName);
  if (!template) {
    vscode.window.showErrorMessage(`Template "${templateName}" not found`);
    return;
  }

  const fileName = camelToSnake(pageName);
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

  // Generate page content
  const content = template.content
    .replace(/\$\{pageName\}/g, pageName)
    .replace(/\$\{title\}/g, camelToTitleCase(pageName))
    .replace(/\$\{fileName\}/g, fileName)
    .replace(/\$\{description\}/g, `${pageName} page`);

  try {
    // Write main file
    fs.writeFileSync(filePath, content);

    // Generate test file if enabled and template has test content
    const config = vscode.workspace.getConfiguration("flutterPageGenerator");

    // Open the created file
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(
      `Flutter page "${pageName}" created successfully!`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error creating page: ${error}`);
  }
}

function getTemplate(name: string): PageTemplate | null {
  const templates = getAvailableTemplates();
  return templates.find((t) => t.name === name) || null;
}

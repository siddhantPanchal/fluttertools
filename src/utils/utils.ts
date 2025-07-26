import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

function getImportPath(mainFilePath: string, testFilePath: string): string {
  const relativePath = path.relative(path.dirname(testFilePath), mainFilePath);
  return relativePath.replace(/\\/g, "/");
}

function findTestDirectory(startPath: string): string | null {
  let currentPath = startPath;
  const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  while (currentPath && currentPath !== rootPath) {
    const testPath = path.join(currentPath, "test");
    if (fs.existsSync(testPath)) {
      // Create nested directory structure in test folder
      const relativePath = path.relative(
        path.join(rootPath!, "lib"),
        startPath
      );
      const targetTestPath = path.join(testPath, relativePath);

      if (!fs.existsSync(targetTestPath)) {
        fs.mkdirSync(targetTestPath, { recursive: true });
      }

      return targetTestPath;
    }
    currentPath = path.dirname(currentPath);
  }

  return null;
}

function camelToSnake(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .substring(1);
}

function camelCaseToSnakeCase(camelCaseString: string): string {
  // Use a regular expression to find uppercase letters (except the first one)
  // and replace them with an underscore followed by the lowercase version of the letter.
  const snakeCaseString = camelCaseString.replace(/[A-Z]/g, (match) => {
    return "_" + match.toLowerCase();
  });

  // Ensure the first character is lowercase and handle cases where the string might
  // already start with an uppercase letter (e.g., "PascalCase").
  return snakeCaseString.toLowerCase();
}

function pascalToSnakeCase(pascalCaseString: string): string {
  // Use a regular expression to find uppercase letters that are not at the beginning of the string,
  // and replace them with an underscore followed by the lowercase version of the letter.
  const snakeCaseString = pascalCaseString
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase();

  // Remove any leading underscore that might have been added if the original string started with an uppercase letter.
  return snakeCaseString.startsWith("_")
    ? snakeCaseString.substring(1)
    : snakeCaseString;
}

async function getWorkspaceFolder(): Promise<string | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folder found");
    return undefined;
  }

  if (workspaceFolders.length === 1) {
    return workspaceFolders[0].uri.fsPath;
  }

  const selectedFolder = await vscode.window.showQuickPick(
    workspaceFolders.map((folder) => ({
      label: folder.name,
      value: folder.uri.fsPath,
    })),
    { placeHolder: "Select workspace folder" }
  );

  return selectedFolder?.value;
}

function camelToTitleCase(camelCaseString: string) {
  // Add a space before each uppercase letter (except the first character)
  // and convert the first letter of the string to uppercase.
  const spacedString = camelCaseString.replace(/([A-Z])/g, " $1");

  // Capitalize the first letter of the entire string and trim leading/trailing spaces.
  const titleCaseString =
    spacedString.charAt(0).toUpperCase() + spacedString.slice(1).trim();

  return titleCaseString.trim();
}

export {
  getImportPath,
  findTestDirectory,
  camelToSnake,
  getWorkspaceFolder,
  camelToTitleCase,
  camelCaseToSnakeCase,
  pascalToSnakeCase,
};

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
// import { parse } from "yaml";

import createFlutterPage from "./createFlutterPage";
import { getWorkspaceFolder } from "./utils/utils";
import installDependencies from "./installDependencies";
import generateFreezedClass from "./templates/freezedModel";

export function activate(context: vscode.ExtensionContext) {
  const createPageCommand = vscode.commands.registerCommand(
    "fluttertools.createPage",
    (uri: vscode.Uri) => createFlutterPage(uri)
  );

  const installDependenciesCommand = vscode.commands.registerCommand(
    "fluttertools.installDependencies",
    async (uri: vscode.Uri) => installDependencies(uri)
  );

  const generateFreezedClassCommand = vscode.commands.registerCommand(
    "fluttertools.freezedModel",
    async (uri: vscode.Uri) => generateFreezedClass(uri)
  );

  context.subscriptions.push(
    createPageCommand,
    installDependenciesCommand,
    generateFreezedClassCommand
  );

  // Register workspace detection
  vscode.commands.executeCommand(
    "setContext",
    "workspaceHasFlutterProject",
    hasFlutterProject()
  );
}

function hasFlutterProject(): boolean {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return false;
  }

  return workspaceFolders.some((folder) => {
    const pubspecPath = path.join(folder.uri.fsPath, "pubspec.yaml");
    return fs.existsSync(pubspecPath);
  });
}

export function deactivate() {}

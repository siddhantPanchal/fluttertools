import * as vscode from "vscode";

import createFlutterPage from "./createFlutterPage";
import { getWorkspaceFolder } from "./utils/utils";
import installDependencies from "./installDependencies";
import generateFreezedClass from "./templates/freezedModel";
import addFlavorizrSupport, {
  addFlavor,
  hasFlutterProject,
  runFlavors,
} from "./addFlavorizrSupport";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fluttertools.createPage",
      (uri: vscode.Uri) => createFlutterPage(uri)
    ),
    vscode.commands.registerCommand(
      "fluttertools.installDependencies",
      async (uri: vscode.Uri) => installDependencies(uri)
    ),
    vscode.commands.registerCommand(
      "fluttertools.freezedModel",
      async (uri: vscode.Uri) => generateFreezedClass(uri)
    ),
    vscode.commands.registerCommand(
      "fluttertools.flavorizrSupport",
      async (uri: vscode.Uri) => addFlavorizrSupport(uri)
    ),
    vscode.commands.registerCommand(
      "fluttertools.addFlavor",
      async (uri: vscode.Uri) => addFlavor(uri)
    ),
    vscode.commands.registerCommand(
      "fluttertools.buildFlavors",
      async (uri: vscode.Uri) => runFlavors()
    )
  );

  // Register workspace detection
  vscode.commands.executeCommand(
    "setContext",
    "workspaceHasFlutterProject",
    hasFlutterProject()
  );
}

export function deactivate() {}

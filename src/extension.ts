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
import { AssetManager } from "./assetManager";

export async function activate(context: vscode.ExtensionContext) {
  const workspaceFolder = await getWorkspaceFolder();
  if (!workspaceFolder) {
    vscode.window.showErrorMessage(
      "No workspace folder found. Please open a folder to use Flutter Tools."
    );
    return;
  }

  const assetManager = new AssetManager(workspaceFolder.uri.fsPath);
  let assetWatcher: vscode.FileSystemWatcher | undefined;
  let debounceTimer: NodeJS.Timeout | undefined;

  function startAssetWatcher(folder: vscode.WorkspaceFolder) {
    if (assetWatcher) {
      assetWatcher.dispose();
    }
    assetWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(folder.uri.fsPath, "assets/**")
    );

    const debouncedUpdate = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(async () => {
        await assetManager.updatePubspecAssets();
        await assetManager.generateAssetPaths();
        debounceTimer = undefined;
      }, 3000); // 3 seconds debounce
    };

    assetWatcher.onDidChange(debouncedUpdate);
    assetWatcher.onDidCreate(debouncedUpdate);
    assetWatcher.onDidDelete(debouncedUpdate);

    context.subscriptions.push(assetWatcher);
    vscode.window.showInformationMessage("Asset watcher started.");
  }

  function stopAssetWatcher() {
    if (assetWatcher) {
      assetWatcher.dispose();
      assetWatcher = undefined;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
      }
      vscode.window.showInformationMessage("Asset watcher stopped.");
    }
  }

  // Start the watcher initially
  startAssetWatcher(workspaceFolder);

  context.subscriptions.push(
    vscode.commands.registerCommand("fluttertools.stopAssetWatcher", () =>
      stopAssetWatcher()
    ),
    vscode.commands.registerCommand("fluttertools.startAssetWatcher", () =>
      startAssetWatcher(workspaceFolder)
    ),
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
    ),
    vscode.commands.registerCommand(
      "fluttertools.updatePubspecAssets",
      async () => assetManager.updatePubspecAssets()
    ),
    vscode.commands.registerCommand(
      "fluttertools.generateAssetPaths",
      async () => assetManager.generateAssetPaths()
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

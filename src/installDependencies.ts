import * as vscode from "vscode";
import { getWorkspaceFolder } from "./utils/utils";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async function installDependencies(uri: vscode.Uri) {
  const workspaceFolder = uri ? uri.fsPath : await getWorkspaceFolder();
  if (!workspaceFolder) {
    return;
  }

  const progress = vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Installing Flutter Dependencies",
      cancellable: false,
    },
    async (progress) => {
      let totalSteps = dependencies.length;
      let completedSteps = 0;

      progress.report({ increment: 0 });

      for (const dep of dependencies) {
        progress.report({
          message: `Installing ${dep.name}...`,
          increment: (completedSteps / totalSteps) * 100,
        });

        try {
          const command = dep.dev
            ? `flutter pub add dev:${dep.name}`
            : `flutter pub add ${dep.name}`;

          await execAsync(command, { cwd: workspaceFolder });
          completedSteps++;
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to install ${dep}`);
        }
      }

      progress.report({ message: "Running flutter pub get...", increment: 95 });

      try {
        await execAsync("flutter pub get", { cwd: workspaceFolder });
      } catch (error) {
        vscode.window.showWarningMessage(
          "flutter pub get failed. You may need to run it manually."
        );
      } finally {
        progress.report({
          message: "Flutter dependencies installed!",
          increment: 100,
        });
      }
    }
  );
}

interface Dependency {
  name: string;
  dev: boolean;
}

const dependencies: Dependency[] = [
  { name: "equatable", dev: false },

  // State Management
  { name: "hooks_riverpod", dev: false },
  { name: "riverpod_generator", dev: true },
  { name: "flutter_hooks", dev: false },
  { name: "riverpod_annotation", dev: false },
  { name: "custom_lint", dev: true },
  { name: "riverpod_lint", dev: true },

  // HTTP & Networking
  { name: "dio", dev: false },
  { name: "retrofit", dev: false },
  { name: "retrofit_generator", dev: true },

  { name: "json_annotation", dev: false },
  { name: "json_serializable", dev: true },

  { name: "freezed", dev: true },
  { name: "freezed_annotation", dev: false },

  // Storage
  { name: "shared_preferences", dev: false },

  // Utils
  { name: "recase", dev: false },
  { name: "fpdart", dev: false },
  { name: "fast_immutable_collections", dev: false },
  { name: "logger", dev: false },
  { name: "path_provider", dev: false },
  { name: "bot_toast", dev: false },
  { name: "collection", dev: false },
  { name: "dropdown_search", dev: false },
  { name: "file_picker", dev: false },
  { name: "flutter_animate", dev: false },
  { name: "rxdart", dev: false },
  { name: "settings_ui", dev: false },
  { name: "url_launcher", dev: false },
  { name: "intl", dev: false },
  { name: "get_it", dev: false },
  { name: "injectable", dev: false },
  { name: "injectable_generator", dev: true },

  { name: "flutter_gen_runner ", dev: true },

  // Testing
  { name: "mocktail", dev: false },

  // Navigation
  { name: "auto_route", dev: false },
  { name: "auto_route_generator", dev: true },

  { name: "build_runner", dev: true },
];

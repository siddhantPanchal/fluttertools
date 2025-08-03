import * as vscode from "vscode";
import { getWorkspaceFolder } from "./utils/utils";

export default async function installDependencies(uri: vscode.Uri) {
  const workspaceFolder = uri
    ? uri.fsPath
    : (await getWorkspaceFolder())?.uri.fsPath;
  if (!workspaceFolder) {
    return;
  }

  const terminal = vscode.window.createTerminal({
    name: "Flutter Tools",
    cwd: workspaceFolder,
  });
  terminal.show();

  let fullCommand = "flutter pub add ";
  for (const dep of dependencies.filter((d) => !d.dev)) {
    const command = ` ${dep.name} `;
    fullCommand += command;
  }
  fullCommand += "&& flutter pub add --dev ";
  for (const dep of dependencies.filter((d) => d.dev)) {
    const command = ` ${dep.name} `;
    fullCommand += command;
  }

  fullCommand += "&& flutter pub get --no-example";
  terminal.sendText(fullCommand);
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
  { name: "envied", dev: false },
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

  { name: "google_fonts", dev: false },

  { name: "flutter_gen_runner ", dev: true },

  // Testing
  { name: "mocktail", dev: false },

  // Navigation
  { name: "auto_route", dev: false },
  { name: "auto_route_generator", dev: true },

  { name: "build_runner", dev: true },
  { name: "flutter_flavorizr", dev: true },
];

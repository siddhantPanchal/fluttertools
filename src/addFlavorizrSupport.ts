import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import { camelToTitleCase, getWorkspaceFolder } from "./utils/utils";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async function addFlavorizrSupport(uri: vscode.Uri) {
  const folder = await getWorkspaceFolder();
  if (!folder) {
    return;
  }

  const pubspecPath = path.join(folder.uri.fsPath, "pubspec.yaml");
  if (!fs.existsSync(pubspecPath)) {
    vscode.window.showErrorMessage("Flutter project not found in workspace");
    return;
  }

  await buildFlavorizr(await supportFirebase(), folder);
}

export async function addFlavor(uri: vscode.Uri) {
  const folder = await getWorkspaceFolder();
  if (!folder) {
    return;
  }
  const pubspecPath = path.join(folder.uri.fsPath, "pubspec.yaml");
  if (!fs.existsSync(pubspecPath)) {
    vscode.window.showErrorMessage("Flutter project not found in workspace");
    return;
  }

  const flavorizrPath = path.join(folder.uri.fsPath, "flavorizr.yaml");
  if (!fs.existsSync(flavorizrPath)) {
    vscode.window.showErrorMessage("flavorizr.yaml not found in workspace");
    return;
  }
  let isSupportFirebase = await supportFirebase();
  let content = await getDefaultContent(isSupportFirebase, folder);
  let flavorName = await vscode.window.showInputBox({
    prompt: "Enter the flavor name (e.g., dev, staging, prod)",
  });
  if (!flavorName) {
    return;
  }

  const newFlavor = await createFlavor(
    flavorName,
    supportedPlatformsForFlutter(folder),
    isSupportFirebase
  );
  if (content.flavors === null) {
    content.flavors = {
      [flavorName]: newFlavor,
    };
  } else {
    content.flavors = {
      ...content.flavors,
      [flavorName]: newFlavor,
    };
  }
  fs.writeFileSync(flavorizrPath, yaml.stringify(content));
}

export async function runFlavors() {
  try {
    const folder = await getWorkspaceFolder();
    if (!folder) {
      return;
    }
    const workspaceFolder = folder.uri.fsPath;

    const command = "flutter pub run flutter_flavorizr";

    await execAsync(command, { cwd: workspaceFolder });
  } catch (error) {
    vscode.window.showErrorMessage(`Error running command: ${error}`);
  }
}

export function hasFlutterProject(): boolean {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return false;
  }

  return workspaceFolders.some((folder) => {
    const pubspecPath = path.join(folder.uri.fsPath, "pubspec.yaml");
    return fs.existsSync(pubspecPath);
  });
}

function supportedPlatformsForFlutter(
  folder: vscode.WorkspaceFolder
): string[] {
  let supportedPlatforms = [];
  if (fs.existsSync(path.join(folder.uri.fsPath, "android"))) {
    supportedPlatforms.push("android");
  }
  if (fs.existsSync(path.join(folder.uri.fsPath, "ios"))) {
    supportedPlatforms.push("ios");
  }
  if (fs.existsSync(path.join(folder.uri.fsPath, "windows"))) {
    supportedPlatforms.push("windows");
  }
  if (fs.existsSync(path.join(folder.uri.fsPath, "linux"))) {
    supportedPlatforms.push("linux");
  }
  if (fs.existsSync(path.join(folder.uri.fsPath, "macos"))) {
    supportedPlatforms.push("macos");
  }
  if (fs.existsSync(path.join(folder.uri.fsPath, "web"))) {
    supportedPlatforms.push("web");
  }
  return supportedPlatforms;
}

function androidInstructions() {
  return [
    "android:flavorizrGradle",
    "android:buildGradle",
    "android:androidManifest",
    "android:dummyAssets",
    "android:icons",
  ];
}

function iosInstructions() {
  return [
    "ios:podfile",
    "ios:xcconfig",
    "ios:buildTargets",
    "ios:schema",
    "ios:dummyAssets",
    "ios:icons",
    "ios:plist",
    "ios:launchScreen",
  ];
}

function macosInstructions() {
  return [
    "macos:podfile",
    "macos:xcconfig",
    "macos:configs",
    "macos:buildTargets",
    "macos:schema",
    "macos:dummyAssets",
    "macos:icons",
    "macos:plist",
  ];
}

async function supportFirebase() {
  let pubspecPaths = (await pubspecPath())!;

  let pubspec = yaml.parse(fs.readFileSync(pubspecPaths, "utf8"));
  let deps = pubspec.dependencies;
  // console.log(deps);
  // console.log(typeof deps);

  let result = Object.keys(deps).some((dep) => {
    if (dep.startsWith("firebase")) {
      return true;
    }
    return false;
  });

  if (!result) {
    let supportFirebase = await vscode.window.showWarningMessage(
      `Do you want to support firebase?`,
      "YES",
      "NO"
    );
    return supportFirebase === "YES";
  }
  return result;
}

async function buildFlavorizr(
  supportFirebase: boolean,
  folder: vscode.WorkspaceFolder
) {
  let supportedPlatforms = supportedPlatformsForFlutter(folder);
  let content = await getDefaultContent(supportFirebase, folder);

  const flavorizrPath = path.join(folder.uri.fsPath, "flavorizr.yaml");
  if (!fs.existsSync(flavorizrPath)) {
    fs.writeFileSync(flavorizrPath, yaml.stringify(content));
  } else {
    let flavorizr = yaml.parse(fs.readFileSync(flavorizrPath, "utf8"));
    let flavors = Object.keys(flavorizr.flavors);
    if (!flavors.includes("dev")) {
      flavorizr.flavors["dev"] = await createFlavor(
        "dev",
        supportedPlatforms,
        supportFirebase
      );
    }
    if (!flavors.includes("staging")) {
      flavorizr.flavors["staging"] = await createFlavor(
        "staging",
        supportedPlatforms,
        supportFirebase
      );
    }
    if (!flavors.includes("prod")) {
      flavorizr.flavors["prod"] = await createFlavor(
        "prod",
        supportedPlatforms,
        supportFirebase
      );
    }
    fs.writeFileSync(flavorizrPath, yaml.stringify(flavorizr));
  }
}

interface Flavor {
  app: { name: string };
  android:
    | {
        applicationId: string;
        firebase: { config: string };
        icon: string;
      }
    | undefined
    | null;
  ios:
    | {
        bundleId: string;
        firebase: { config: string };
        icon: string;
      }
    | undefined
    | null;
}

async function createFlavor(
  name: string,
  supportedPlatforms: string[],
  supportFirebase: boolean
) {
  const folder = await getWorkspaceFolder();
  if (!folder) {
    vscode.window.showErrorMessage("No workspace folder found");
    return;
  }
  let flavor: Flavor = {
    app: { name: name },
    android: null,
    ios: null,
  };
  if (supportedPlatforms.includes("android")) {
    flavor.android = {
      applicationId: `YOUR_APPLICATION_ID.${name}`,
      firebase: { config: `.firebase/${name}/google-services.json` },
      icon: `assets/icons/${name}/ic_launcher.png`,
    };
  }
  if (supportedPlatforms.includes("ios")) {
    flavor.ios = {
      bundleId: `YOUR_BUNDLE_ID.${name}`,
      firebase: { config: `.firebase/${name}/GoogleService-Info.plist` },
      icon: `assets/icons/${name}/ic_launcher.png`,
    };
  }
  if (supportFirebase) {
    createFirebaseFolder(folder, name);
  }

  return flavor;
}

async function getDefaultContent(
  supportFirebase: boolean,
  folder: vscode.WorkspaceFolder,
  withFlavors: boolean = true
) {
  let app: {
    android: { flavorDimensions: string } | undefined | null;
    ios:
      | {
          buildSettings: {
            DEVELOPMENT_TEAM: string;
          };
        }
      | undefined
      | null;
    macos:
      | {
          buildSettings: {
            DEVELOPMENT_TEAM: string;
          };
        }
      | undefined
      | null;
  } = {
    android: null,
    ios: null,
    macos: null,
  };

  let instructions: string[] = [
    "assets:download",
    "assets:extract",
    "ide:config",
  ];

  if (supportFirebase) {
    const firebasePath = path.join(folder.uri.fsPath, ".firebase");
    if (!fs.existsSync(firebasePath)) {
      fs.mkdirSync(firebasePath);
    }

    instructions.push("firebase:config");
  }

  let supportedPlatforms = supportedPlatformsForFlutter(folder);
  if (supportedPlatforms.includes("android")) {
    app.android = {
      flavorDimensions: "app",
    };
    instructions = instructions.concat(androidInstructions());
  }
  if (supportedPlatforms.includes("ios")) {
    app.ios = {
      buildSettings: {
        DEVELOPMENT_TEAM: "YOUR DEVELOPMENT TEAM ID",
      },
    };
    instructions = instructions.concat(iosInstructions());
  }
  if (supportedPlatforms.includes("macos")) {
    app.macos = {
      buildSettings: {
        DEVELOPMENT_TEAM: "YOUR DEVELOPMENT TEAM ID",
      },
    };
    instructions = instructions.concat(macosInstructions());
  }

  instructions = instructions.concat(["assets:clean"]);

  let content: {
    app: {};
    ide: string;
    instructions: string[];
    flavors: {} | null;
  } = {
    app: app,
    ide: "vscode",
    instructions,
    flavors: null,
  };

  if (withFlavors) {
    content.flavors = {
      dev: await createFlavor("dev", supportedPlatforms, supportFirebase),
      staging: await createFlavor(
        "staging",
        supportedPlatforms,
        supportFirebase
      ),
      prod: await createFlavor("prod", supportedPlatforms, supportFirebase),
    };
  }

  return content;
}

function createFirebaseFolder(folder: vscode.WorkspaceFolder, name: string) {
  if (!fs.existsSync(path.join(folder.uri.fsPath, `.firebase/${name}`))) {
    fs.mkdirSync(path.join(folder.uri.fsPath, `.firebase/${name}`));
  }
}

async function pubspecPath() {
  const folder = await getWorkspaceFolder();
  if (!folder) {
    return;
  }
  return path.join(folder.uri.fsPath, "pubspec.yaml");
}

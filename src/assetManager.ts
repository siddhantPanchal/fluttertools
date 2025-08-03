import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";

export class AssetManager {
  private pubspecPath: string;

  constructor(workspaceRoot: string) {
    this.pubspecPath = path.join(workspaceRoot, "pubspec.yaml");
  }

  public async updatePubspecAssets(): Promise<void> {
    if (!fs.existsSync(this.pubspecPath)) {
      vscode.window.showErrorMessage(
        "pubspec.yaml not found in the workspace root."
      );
      return;
    }

    const pubspecContent = fs.readFileSync(this.pubspecPath, "utf8");
    const doc = yaml.parseDocument(pubspecContent);

    const assetsDir = path.join(path.dirname(this.pubspecPath), "assets");
    const newAssets: string[] = [];

    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory()) {
          newAssets.push(`assets/${file.name}/`);
        } else {
          newAssets.push(`assets/${file.name}`);
        }
      }
    }

    let flutterNode = doc.getIn(["flutter"]);
    if (!flutterNode) {
      doc.setIn(["flutter"], new yaml.YAMLMap());
      flutterNode = doc.getIn(["flutter"]);
    }

    if (flutterNode && yaml.isMap(flutterNode)) {
      flutterNode.set("assets", newAssets);
    } else {
      vscode.window.showErrorMessage(
        "Could not find or create flutter section in pubspec.yaml."
      );
      return;
    }

    const updatedPubspecContent = String(doc);
    fs.writeFileSync(this.pubspecPath, updatedPubspecContent, "utf8");
    vscode.window.showInformationMessage("pubspec.yaml updated successfully!");
  }

  public async generateAssetPaths(): Promise<void> {
    const terminal = vscode.window.createTerminal({ name: "Flutter Tools" });
    terminal.show();
    terminal.sendText(
      "flutter pub run build_runner build --delete-conflicting-outputs"
    );
    vscode.window.showInformationMessage("Asset paths generated successfully!");
  }
}

# Product Requirements Document: Flutter Tools VS Code Extension

## 1. Overview

**Flutter Tools** is a VS Code extension designed to accelerate Flutter development by automating common, repetitive tasks. It provides a set of commands accessible through the VS Code command palette and the file explorer context menu, streamlining workflows such as creating new pages, managing dependencies, and configuring application flavors.

## 2. Target Audience

This extension is for Flutter developers of all levels who use Visual Studio Code as their primary editor. It aims to reduce boilerplate code and simplify project setup, allowing developers to focus on building features.

## 3. User Problems & Goals

Flutter development often involves writing repetitive code for widgets, pages, and models. Managing project setup, such as installing dependencies or configuring build flavors, can be tedious and error-prone.

**User Goals:**

- Quickly scaffold new Flutter pages/widgets from templates.
- Simplify the process of adding and installing dependencies.
- Easily generate data models, particularly for use with code-generation libraries like `freezed`.
- Automate the setup and management of build flavors (`dev`, `staging`, `prod`).

## 4. Features

### 4.1. Page & Widget Creation

- **Command:** `fluttertools.createPage`
- **Description:** Creates a new Flutter page from a set of predefined or custom templates. The command will prompt the user for a page name and template choice.
- **Templates:**
  - Stateless Widget
  - Stateful Widget
  - (Future support for BLoC, Provider, etc.)
- **Configuration:** Users can define a default template and add their own custom templates via VS Code settings.

### 4.2. Dependency Management

- **Command:** `fluttertools.installDependencies`
- **Description:** Installs all dependencies listed in the `pubspec.yaml` file by running `flutter pub get`. This provides a convenient shortcut within the editor.

### 4.3. Freezed Model Generation

- **Command:** `fluttertools.freezedModel`
- **Description:** Generates a boilerplate file for a `freezed` data model. The user will be prompted for a model name, and the extension will create a `.dart` file with the necessary imports and class structure.

### 4.4. Flavor Management (via Flavorizr)

- **Command:** `fluttertools.flavorizrSupport`
- **Description:** Adds initial support for `flutter_flavorizr` to the project.
- **Command:** `fluttertools.addFlavor`
- **Description:** Prompts the user for a new flavor name and adds it to the project's flavor configuration.
- **Command:** `fluttertools.buildFlavors`
- **Description:** Triggers the build process for all configured flavors.

### 4.5. Asset Management Helper

- **Description:** Automates tasks related to managing assets in a Flutter project.
- **Sub-Features:**
  - **Automated `pubspec.yaml` Updates:**
    - **Trigger:** Watches the `assets/` directory (and its subdirectories) for file changes (creation, deletion, rename).
    - **Action:** Automatically updates the `flutter:` -> `assets:` section in `pubspec.yaml` to reflect the current file structure. This removes the need for manual updates.
  - **Asset Path Class Generation:**
    - **Command:** `fluttertools.generateAssetPaths`
    - **Action:** Scans the `assets/` directory and generates a `lib/constants/app_assets.dart` file containing static constants for all asset paths. This allows for type-safe, autocompletable asset access in code (e.g., `AppAssets.myImage` instead of `'assets/images/my_image.png'`).

## 5. User Experience (UX)

- **Integration:** The extension's commands are primarily accessed via a "Flutter Tools" submenu in the file explorer's right-click context menu when a folder is selected.
- **Configuration:** The extension is configurable through the standard VS Code `settings.json` file, allowing users to customize templates and default behaviors.

## 6. Technical Requirements

- **Environment:** Visual Studio Code v1.102.0 or higher.
- **Language:** TypeScript
- **Build System:** esbuild

# Flutter Tools VS Code Extension: Implementation Plan

This document outlines the development plan for the Flutter Tools extension.

## Phase 1: Core Functionality (Completed)

- [x] **Page & Widget Creation** (`fluttertools.createPage`)
- [x] **Dependency Management** (`fluttertools.installDependencies`)
- [x] **Freezed Model Generation** (`fluttertools.freezedModel`)
- [ ] **Testing**
  - [ ] Write unit tests for core functionalities.
  - [ ] Write integration tests for page creation, dependency installation, and Freezed model generation.

## Phase 2: Flavor Management (Completed)

- [x] **Add Flavorizr Support** (`fluttertools.flavorizrSupport`)
- [x] **Add New Flavor** (`fluttertools.addFlavor`)
- [x] **Build Flavors** (`fluttertools.buildFlavors`)
- [ ] **Testing**
  - [ ] Write unit tests for flavor management functionalities.
  - [ ] Write integration tests for flavorizr support, adding new flavors, and building flavors.

## Phase 3: Asset Management (In Progress)

  - [ ] **Asset Management Helper**
    - [x] **Asset Watcher Control**
      - [x] Implement `fluttertools.stopAssetWatcher` command.
      - [x] Implement `fluttertools.startAssetWatcher` command.
      - [x] Add testing for watcher control.
  - [x] **Automated `pubspec.yaml` Updates**
- [x] **Automated `pubspec.yaml` Updates**
  - [ ] Implement a file watcher for the `assets/` directory.
  - [ ] On file change (add, delete, rename), read the `assets/` directory structure.
  - [ ] Parse the `pubspec.yaml` file to locate the `flutter.assets` section.
  - [ ] Update the `assets` list with the new directory contents.
  - [ ] Ensure `pubspec.yaml` formatting and comments are preserved.
- [x] **Integrate `flutter_gen` for Asset Path Generation**
  - [ ] Ensure `flutter_gen` is a dev dependency in `pubspec.yaml` (or prompt user to add/install).
  - [ ] After `pubspec.yaml` is updated (or on a manual command), run `flutter pub run build_runner build` to generate asset paths.
  - [ ] **Testing**
    - [ ] Write unit tests for `AssetManager`.
    - [ ] Write integration tests for file watcher and `pubspec.yaml` updates.
    - [ ] Verify `flutter_gen` integration.

---

_When a phase is completed, its section will be moved under a "Completed Features" heading and all checkboxes will be marked as `[x]`._

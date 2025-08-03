# Gemini Context: Flutter Tools VS Code Extension

This document provides a summary of the project's goals, status, and plans to ensure I have the necessary context to assist effectively.

## 1. Project Overview

- **Project:** Flutter Tools VS Code Extension.
- **Goal:** Accelerate Flutter development by automating common tasks like creating pages, managing dependencies, and handling assets.
- **Target Audience:** Flutter developers using VS Code.
- **Primary Interaction:** Commands accessed via the VS Code command palette and a "Flutter Tools" submenu in the explorer context menu.

## 2. Current Development Status

- **Completed Features:**
    - Phase 1: Core functionality (Page Creation, Dependency Installation, Freezed Model Generation).
    - Phase 2: Flavor Management (Flavorizr integration).

- **Current Focus: Phase 3 - Asset Management**
    - The immediate goal is to implement the **Asset Management Helper** feature.

## 3. Development Plan: Asset Management Helper

This is the active development phase. The plan consists of two main sub-features:

1.  **Automated `pubspec.yaml` Updates:**
    - **Goal:** Watch the `assets/` directory and automatically update the `pubspec.yaml` file when assets are added, removed, or renamed.
    - **Key Steps:** Implement a file watcher, parse `pubspec.yaml`, and write the updated asset list while preserving formatting.

2.  **Asset Path Class Generation:**
    - **Goal:** Create a command (`fluttertools.generateAssetPaths`) that generates a Dart class with static constants for all asset paths.
    - **Key Steps:** Register the new command, scan the `assets/` directory, convert file names to valid Dart variable names, and generate the `app_assets.dart` file.

## 4. Key Project Files

- **`PRD.md`**: The single source of truth for product requirements and features.
- **`PLAN.md`**: The implementation plan with progress tracking (checkboxes).
- **`package.json`**: Defines the extension's commands, contributions, and dependencies.
- **`src/extension.ts`**: The main entry point for the extension where commands are registered.

## 5. My Role

My role is to act as a software engineering assistant to help implement the features outlined in the `PLAN.md` file. I will use the information in this document and the other key files to understand the project's context, write code, and modify files as requested, ensuring that all changes align with the project's established goals and structure.

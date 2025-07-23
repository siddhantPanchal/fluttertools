import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface Template {
  name: string;
  content: string;
  testContent?: string;
}

export function activate(context: vscode.ExtensionContext) {
  const createPageCommand = vscode.commands.registerCommand(
    "fluttertools.createPage",
    (uri: vscode.Uri) => createFlutterPage(uri)
  );

  const createPageWithTemplateCommand = vscode.commands.registerCommand(
    "fluttertools.createPageWithTemplate",
    (uri: vscode.Uri) => createFlutterPageWithTemplate(uri)
  );

  context.subscriptions.push(createPageCommand, createPageWithTemplateCommand);

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

async function createFlutterPage(uri?: vscode.Uri) {
  const config = vscode.workspace.getConfiguration("flutterPageGenerator");
  const defaultTemplate = config.get<string>("defaultTemplate", "stateless");

  const folderPath = uri ? uri.fsPath : await getWorkspaceFolder();
  if (!folderPath) {
    return;
  }

  const pageName = await vscode.window.showInputBox({
    prompt: "Enter the page name (e.g., HomePage)",
    validateInput: (value) => {
      if (!value) {
        return "Page name is required";
      }
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Page name must start with uppercase letter and contain only letters and numbers";
      }
      return null;
    },
  });

  if (!pageName) {
    return;
  }

  await generatePage(folderPath, pageName, defaultTemplate);
}

async function createFlutterPageWithTemplate(uri?: vscode.Uri) {
  const folderPath = uri ? uri.fsPath : await getWorkspaceFolder();
  if (!folderPath) {
    return;
  }

  const templates = getAvailableTemplates();
  const selectedTemplate = await vscode.window.showQuickPick(
    templates.map((t) => ({ label: t.name, value: t.name })),
    { placeHolder: "Select a template" }
  );

  if (!selectedTemplate) {
    return;
  }

  const pageName = await vscode.window.showInputBox({
    prompt: "Enter the page name (e.g., HomePage)",
    validateInput: (value) => {
      if (!value) {
        return "Page name is required";
      }
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Page name must start with uppercase letter and contain only letters and numbers";
      }
      return null;
    },
  });

  if (!pageName) {
    return;
  }

  await generatePage(folderPath, pageName, selectedTemplate.value);
}

async function generatePage(
  folderPath: string,
  pageName: string,
  templateName: string
) {
  const template = getTemplate(templateName);
  if (!template) {
    vscode.window.showErrorMessage(`Template "${templateName}" not found`);
    return;
  }

  const fileName = camelToSnake(pageName);
  const filePath = path.join(folderPath, `${fileName}.dart`);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    const overwrite = await vscode.window.showWarningMessage(
      `File ${fileName}.dart already exists. Overwrite?`,
      "Yes",
      "No"
    );
    if (overwrite !== "Yes") {
      return;
    }
  }

  // Generate page content
  const content = template.content
    .replace(/\$\{pageName\}/g, pageName)
    .replace(/\$\{fileName\}/g, fileName)
    .replace(/\$\{description\}/g, `${pageName} page`);

  try {
    // Write main file
    fs.writeFileSync(filePath, content);

    // Generate test file if enabled and template has test content
    const config = vscode.workspace.getConfiguration("flutterPageGenerator");
    const includeTests = config.get<boolean>("includeTests", true);

    if (includeTests && template.testContent) {
      const testDir = findTestDirectory(folderPath);
      if (testDir) {
        const testFilePath = path.join(testDir, `${fileName}_test.dart`);
        const testContent = template.testContent
          .replace(/\$\{pageName\}/g, pageName)
          .replace(/\$\{fileName\}/g, fileName)
          .replace(/\$\{importPath\}/g, getImportPath(filePath, testFilePath));

        fs.writeFileSync(testFilePath, testContent);
      }
    }

    // Open the created file
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(
      `Flutter page "${pageName}" created successfully!`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error creating page: ${error}`);
  }
}

function getAvailableTemplates(): Template[] {
  const config = vscode.workspace.getConfiguration("flutterPageGenerator");
  const customTemplates = config.get<Record<string, any>>(
    "customTemplates",
    {}
  );

  const builtInTemplates = getBuiltInTemplates();
  const customTemplatesList = Object.entries(customTemplates).map(
    ([name, template]) => ({
      name,
      content: template.content || "",
      testContent: template.testContent,
    })
  );

  return [...builtInTemplates, ...customTemplatesList];
}

function getTemplate(name: string): Template | null {
  const templates = getAvailableTemplates();
  return templates.find((t) => t.name === name) || null;
}

function getBuiltInTemplates(): Template[] {
  return [
    {
      name: "stateless",
      content: `import 'package:flutter/material.dart';

class \${pageName} extends StatelessWidget {
  const \${pageName}({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('\${pageName}'),
      ),
      body: const Center(
        child: Text(
          '\${pageName}',
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}`,
      testContent: `import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '\${importPath}';

void main() {
  group('\${pageName}', () {
    testWidgets('should display page title', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: \${pageName}(),
        ),
      );

      expect(find.text('\${pageName}'), findsOneWidget);
    });
  });
}`,
    },
    {
      name: "stateful",
      content: `import 'package:flutter/material.dart';

class \${pageName} extends StatefulWidget {
  const \${pageName}({super.key});

  @override
  State<\${pageName}> createState() => _\${pageName}State();
}

class _\${pageName}State extends State<\${pageName}> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('\${pageName}'),
      ),
      body: const Center(
        child: Text(
          '\${pageName}',
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}`,
      testContent: `import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '\${importPath}';

void main() {
  group('\${pageName}', () {
    testWidgets('should display page title', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: \${pageName}(),
        ),
      );

      expect(find.text('\${pageName}'), findsOneWidget);
    });
  });
}`,
    },
    {
      name: "bloc",
      content: `import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// Events
abstract class \${pageName}Event {}

class Load\${pageName}Event extends \${pageName}Event {}

// States
abstract class \${pageName}State {}

class \${pageName}InitialState extends \${pageName}State {}

class \${pageName}LoadingState extends \${pageName}State {}

class \${pageName}LoadedState extends \${pageName}State {}

class \${pageName}ErrorState extends \${pageName}State {
  final String message;
  \${pageName}ErrorState(this.message);
}

// Bloc
class \${pageName}Bloc extends Bloc<\${pageName}Event, \${pageName}State> {
  \${pageName}Bloc() : super(\${pageName}InitialState()) {
    on<Load\${pageName}Event>(_onLoad);
  }

  void _onLoad(Load\${pageName}Event event, Emitter<\${pageName}State> emit) async {
    emit(\${pageName}LoadingState());
    try {
      // Add your logic here
      emit(\${pageName}LoadedState());
    } catch (e) {
      emit(\${pageName}ErrorState(e.toString()));
    }
  }
}

// Page
class \${pageName} extends StatelessWidget {
  const \${pageName}({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => \${pageName}Bloc()..add(Load\${pageName}Event()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('\${pageName}'),
        ),
        body: BlocBuilder<\${pageName}Bloc, \${pageName}State>(
          builder: (context, state) {
            if (state is \${pageName}LoadingState) {
              return const Center(child: CircularProgressIndicator());
            } else if (state is \${pageName}ErrorState) {
              return Center(child: Text('Error: \${state.message}'));
            } else if (state is \${pageName}LoadedState) {
              return const Center(
                child: Text(
                  '\${pageName} Loaded',
                  style: TextStyle(fontSize: 24),
                ),
              );
            }
            return const Center(child: Text('Initial State'));
          },
        ),
      ),
    );
  }
}`,
    },
  ];
}

function camelToSnake(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .substring(1);
}

async function getWorkspaceFolder(): Promise<string | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folder found");
    return undefined;
  }

  if (workspaceFolders.length === 1) {
    return workspaceFolders[0].uri.fsPath;
  }

  const selectedFolder = await vscode.window.showQuickPick(
    workspaceFolders.map((folder) => ({
      label: folder.name,
      value: folder.uri.fsPath,
    })),
    { placeHolder: "Select workspace folder" }
  );

  return selectedFolder?.value;
}

function findTestDirectory(startPath: string): string | null {
  let currentPath = startPath;
  const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  while (currentPath && currentPath !== rootPath) {
    const testPath = path.join(currentPath, "test");
    if (fs.existsSync(testPath)) {
      // Create nested directory structure in test folder
      const relativePath = path.relative(
        path.join(rootPath!, "lib"),
        startPath
      );
      const targetTestPath = path.join(testPath, relativePath);

      if (!fs.existsSync(targetTestPath)) {
        fs.mkdirSync(targetTestPath, { recursive: true });
      }

      return targetTestPath;
    }
    currentPath = path.dirname(currentPath);
  }

  return null;
}

function getImportPath(mainFilePath: string, testFilePath: string): string {
  const relativePath = path.relative(path.dirname(testFilePath), mainFilePath);
  return relativePath.replace(/\\/g, "/");
}

export function deactivate() {}

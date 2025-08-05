
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { templates } from './templates';
import { pascalToSnakeCase } from './utils/utils';

export function createProvider() {
    const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!folderPath) {
        vscode.window.showErrorMessage('No folder or workspace opened');
        return;
    }

    vscode.window.showQuickPick(['Provider (function)', 'Provider (class)'], {
        placeHolder: 'Select provider type'
    }).then(providerType => {
        if (!providerType) {
            return;
        }

        vscode.window.showInputBox({
            prompt: `Enter provider name`
        }).then(providerName => {
            if (!providerName) {
                return;
            }

            const providerContent = templates.provider(providerName, providerType);
            const fileName = pascalToSnakeCase(providerName);
            const filePath = path.join(folderPath, 'lib', `${fileName}.dart`);

            fs.writeFile(filePath, providerContent, err => {
                if (err) {
                    vscode.window.showErrorMessage(`Failed to create provider: ${err.message}`);
                } else {
                    vscode.window.showInformationMessage(`Provider created successfully`);
                    vscode.workspace.openTextDocument(filePath).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                }
            });
        });
    });
}

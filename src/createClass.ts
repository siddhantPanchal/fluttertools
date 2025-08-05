
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { templates } from './templates';
import { pascalToSnakeCase } from './utils/utils';

export function createClass() {
    const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!folderPath) {
        vscode.window.showErrorMessage('No folder or workspace opened');
        return;
    }

    vscode.window.showQuickPick(['Class', 'Sealed Class', 'Abstract Class', 'Interface', 'Abstract Interface'], {
        placeHolder: 'Select class type'
    }).then(classType => {
        if (!classType) {
            return;
        }

        vscode.window.showInputBox({
            prompt: `Enter ${classType} name`
        }).then(className => {
            if (!className) {
                return;
            }

            const classContent = templates.class(className, classType);
            const fileName = pascalToSnakeCase(className);
            const filePath = path.join(folderPath, 'lib', `${fileName}.dart`);

            fs.writeFile(filePath, classContent, err => {
                if (err) {
                    vscode.window.showErrorMessage(`Failed to create ${classType}: ${err.message}`);
                } else {
                    vscode.window.showInformationMessage(`${classType} created successfully`);
                    vscode.workspace.openTextDocument(filePath).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                }
            });
        });
    });
}


import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import { createClass } from '../createClass';
import { templates } from '../templates';

suite('createClass', () => {
    let showQuickPickStub: sinon.SinonStub;
    let showInputBoxStub: sinon.SinonStub;
    let writeFileStub: sinon.SinonStub;

    setup(() => {
        showQuickPickStub = sinon.stub(vscode.window, 'showQuickPick');
        showInputBoxStub = sinon.stub(vscode.window, 'showInputBox');
        writeFileStub = sinon.stub(fs, 'writeFile');
    });

    teardown(() => {
        sinon.restore();
    });

    test('should create a class when all inputs are provided', async () => {
        const classType = 'Class';
        const className = 'MyClass';
        const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        const filePath = path.join(folderPath!, 'lib', `${className.toLowerCase()}.dart`);
        const classContent = templates.class(className, classType);

        showQuickPickStub.resolves(classType);
        showInputBoxStub.resolves(className);
        writeFileStub.yields(null);

        await createClass();

        sinon.assert.calledOnce(showQuickPickStub);
        sinon.assert.calledOnce(showInputBoxStub);
        sinon.assert.calledOnceWithExactly(writeFileStub, filePath, classContent, sinon.match.func);
    });
});

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import createFlutterPage from '../createFlutterPage';
import * as utils from '../utils/utils';

suite('createFlutterPage', () => {
    let showInputBoxStub: sinon.SinonStub;
    let showQuickPickStub: sinon.SinonStub;
    let applyEditStub: sinon.SinonStub;
    let getWorkspaceFolderStub: sinon.SinonStub;

    setup(() => {
        showInputBoxStub = sinon.stub(vscode.window, 'showInputBox');
        showQuickPickStub = sinon.stub(vscode.window, 'showQuickPick');
        applyEditStub = sinon.stub(vscode.workspace, 'applyEdit');
        getWorkspaceFolderStub = sinon.stub(utils, 'getWorkspaceFolder').returns(Promise.resolve({
            uri: vscode.Uri.file('/tmp/test_workspace'),
            name: 'test_workspace',
            index: 0
        }));
    });

    teardown(() => {
        showInputBoxStub.restore();
        showQuickPickStub.restore();
        applyEditStub.restore();
        getWorkspaceFolderStub.restore();
    });

    test('should create a stateless page with default template', async () => {
        showInputBoxStub.returns(Promise.resolve('MyTestPage'));
        showQuickPickStub.returns(Promise.resolve('Stateless'));
        applyEditStub.returns(Promise.resolve(true));

        await createFlutterPage(vscode.Uri.file('/tmp/test_workspace/lib'));

        assert.ok(showInputBoxStub.calledOnceWithExactly({
            prompt: 'Enter page name',
            placeHolder: 'home_page'
        }));
        assert.ok(showQuickPickStub.calledOnce);
        assert.ok(applyEditStub.calledOnce);
    });
});
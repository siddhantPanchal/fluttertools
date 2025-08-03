import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import generateFreezedClass from '../templates/freezedModel';
import * as utils from '../utils/utils';

suite('generateFreezedClass', () => {
    let showInputBoxStub: sinon.SinonStub;
    let applyEditStub: sinon.SinonStub;
    let getWorkspaceFolderStub: sinon.SinonStub;

    setup(() => {
        showInputBoxStub = sinon.stub(vscode.window, 'showInputBox');
        applyEditStub = sinon.stub(vscode.workspace, 'applyEdit');
        getWorkspaceFolderStub = sinon.stub(utils, 'getWorkspaceFolder').returns(Promise.resolve({
            uri: vscode.Uri.file('/tmp/test_workspace'),
            name: 'test_workspace',
            index: 0
        }));
    });

    teardown(() => {
        showInputBoxStub.restore();
        applyEditStub.restore();
        getWorkspaceFolderStub.restore();
    });

    test('should generate a freezed class', async () => {
        showInputBoxStub.returns(Promise.resolve('MyFreezedModel'));
        applyEditStub.returns(Promise.resolve(true));

        await generateFreezedClass(vscode.Uri.file('/tmp/test_workspace/lib/models'));

        assert.ok(showInputBoxStub.calledOnceWithExactly({
            prompt: 'Enter Freezed model name',
            placeHolder: 'user_model'
        }));
        assert.ok(applyEditStub.calledOnce);
    });
});
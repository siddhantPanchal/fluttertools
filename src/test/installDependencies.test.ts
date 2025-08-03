import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import installDependencies from '../installDependencies';
import * as utils from '../utils/utils';

suite('installDependencies', () => {
    let createTerminalStub: sinon.SinonStub;
    let sendTextStub: sinon.SinonStub;
    let showTerminalStub: sinon.SinonStub;
    let getWorkspaceFolderStub: sinon.SinonStub;

    setup(() => {
        sendTextStub = sinon.stub();
        showTerminalStub = sinon.stub();
        createTerminalStub = sinon.stub(vscode.window, 'createTerminal').returns({
            sendText: sendTextStub,
            show: showTerminalStub,
            name: 'test_terminal',
            processId: Promise.resolve(123),
            creationOptions: {},
            exitStatus: undefined,
            dispose: sinon.stub(),
            hide: sinon.stub(),
            state: { isInteractedWith: false, shell: undefined },
            shellIntegration: undefined
        });
        getWorkspaceFolderStub = sinon.stub(utils, 'getWorkspaceFolder').returns(Promise.resolve({
            uri: vscode.Uri.file('/tmp/test_workspace'),
            name: 'test_workspace',
            index: 0
        }));
    });

    teardown(() => {
        createTerminalStub.restore();
        getWorkspaceFolderStub.restore();
    });

    test('should send commands to terminal', async () => {
        await installDependencies(vscode.Uri.file('/tmp/test_workspace'));

        assert.ok(createTerminalStub.calledOnce);
        assert.ok(sendTextStub.calledOnce);
        assert.ok(showTerminalStub.calledOnce);
        assert.ok(sendTextStub.calledWithMatch(/flutter pub add/));
        assert.ok(sendTextStub.calledWithMatch(/flutter pub get/));
    });
});
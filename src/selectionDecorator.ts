import * as vscode from 'vscode';
import { TestExplorer } from "./testExplorer";
import { TestNode } from "./tree/testNode";

export class SelectionDecorator implements vscode.FileDecorationProvider {
	private _eventEmiter: vscode.EventEmitter<vscode.Uri | vscode.Uri[]>;
	public onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[] | undefined>;

	constructor( context: vscode.ExtensionContext, private readonly testExplorer: TestExplorer) {
		this._eventEmiter = new vscode.EventEmitter();
		this.onDidChangeFileDecorations = this._eventEmiter.event;
		const provider = vscode.window.registerFileDecorationProvider(this);
		context.subscriptions.push(provider);
	}

	public updateDecorationsForSource(uri: vscode.Uri): void {
        this._eventEmiter.fire(uri);
    }
	
	provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
		const children = this.testExplorer.getChildren();
		const found = children.find(e => {
			const node = (e as TestNode);
			if (uri.query && node.info.file) {
				return uri.query.includes(node.info.file) && node.selected;
			}
			return false;
		});
		console.log(uri);
		if (found) {
			return {
				badge: "\u2705",
				tooltip: 'Has Uncommitted Changes',
			};
		}
		return;
	}
}
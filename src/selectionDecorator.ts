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
		if (uri.scheme !== 'test-explorer') {
			return;
		}
		const children = this.testExplorer.getChildren();
		const found = children.find(e => {
			const node = (e as TestNode);
			return node.uniqueId === uri.query;
		});
		if (found && this.isSelected(found)) {
			return {
				badge: '\u2714',
				tooltip: 'Selected test',
			};
		} else {
			return {
				badge: '　',
			}
		}
	}

	private isSelected(node: TestNode): boolean {
		if (node.selected) {
			return true;
		}
		if (node.children) {
			return node.children.find(e => {
				const testNode = (e as TestNode);
				return this.isSelected(testNode);
			}) ? true : false;
		}
		return false;
	}
}
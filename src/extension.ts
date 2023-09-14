// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import TemplatesManager from './templatesManager';
import BrowseTemplatesCommand = require("./commands/openTemplatesFolderCommand");
import RefreshListCommand = require("./commands/refreshTemplatesListCommand");
import NewFileFromTemplateCommand = require("./commands/newFileFromTemplateCommand");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "custom-file-templates-appleneko2001" is now active!');

	const manager = new TemplatesManager(vscode.workspace.getConfiguration("customFileTemplates"));
	manager.prepareConfigDirIfNotExists();
	manager.refreshTemplateListing();

	context.subscriptions.push(vscode.commands.registerCommand("custom-file-templates-appleneko2001.refreshList", () => {
		RefreshListCommand.run(manager, undefined);
		vscode.window.showInformationMessage('The template list have been refreshed.');
	}));

	context.subscriptions.push(vscode.commands.registerCommand("custom-file-templates-appleneko2001.browseTemplates", () => {
		BrowseTemplatesCommand.run(manager, undefined);
	}));

	vscode.commands.registerCommand("custom-file-templates-appleneko2001.newFileFromTemplate",async (path) => {
		await NewFileFromTemplateCommand.run(manager, path);
	});

}

// This method is called when your extension is deactivated
export function deactivate() {}

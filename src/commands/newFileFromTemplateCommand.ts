import vscode = require("vscode");
import TemplatesManager from "../templatesManager";
import { FileTemplateQuickPickItem } from "../ui/templateQuickPickItem";
import { CreateFilesOptions } from "../options/createFilesOptions";
import * as utils from "../utils";

export function getWorkspaceFolder() : string {
    const folders = vscode.workspace.workspaceFolders;
    const count = folders?.length ?? 0;

    if(count < 0 || folders === undefined){
        throw Error("Wait wtf why the array length is negative?!");
    }

    switch(count){
        case 0:
            throw Error("Please open a workspace first at least!");

        case 1:
            return folders[0].uri.fsPath;

        default:
            throw Error("Select a workspace!");
    }
}

export async function run (templatesManager: TemplatesManager, args: any) {
    const workspaceFolder = getWorkspaceFolder();
    const targetFolder = args ? args.fsPath : workspaceFolder;
    const templates = templatesManager.getTemplates();
    const namespace = utils.getNamespacePath(workspaceFolder, targetFolder);

    if(templates.length === 0){
        let buttons = <vscode.MessageItem> {
            title: "Open Templates Folder"
        };
        const result = await vscode.window.showErrorMessage("No templates available", buttons);
        if(!result){
            return;
        }

        templatesManager.browseTemplateDir();
    }

    const selection = await vscode.window
        .showQuickPick(templates.map(i => new FileTemplateQuickPickItem(i)),
            {
                title: "Please select a template",
                canPickMany: false
            }
        );

    if(!selection) {
        return;
    }

    let inputOptions = <vscode.InputBoxOptions> {
        title: `New object at: ${targetFolder}`,
        prompt: "Please enter the object name",
        value: "MyObject"
    };

    const objectName = await vscode.window.showInputBox(inputOptions);

    if(!objectName) {
        return;
        //throw Error("Object name shouldn't be empty!")
    }

    templatesManager.createFilesFromTemplateToDir(new CreateFilesOptions(targetFolder, objectName, selection.getModel(), namespace));
}

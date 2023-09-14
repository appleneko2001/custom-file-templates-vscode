import { QuickPickItem } from "vscode";
import { MetadataModel } from "../models/metadataModel";

export class FileTemplateQuickPickItem implements QuickPickItem {
    label: string;

    private model: MetadataModel;

    constructor(model: MetadataModel){
        this.model = model;
        this.label = model.title;
    }

    public getModel() : MetadataModel {
        return this.model;
    }
}
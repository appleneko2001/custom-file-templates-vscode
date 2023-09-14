import { MetadataModel } from "../models/metadataModel";

export class CreateFilesOptions {
    toFolder: string = "";
    objectName: string = "";
    template: MetadataModel;
    namespace?: string;

    constructor(toFolder: string, objectName: string, template: MetadataModel, namespace?: string){
        this.toFolder = toFolder;
        this.objectName = objectName;
        this.template = template;
        this.namespace = namespace;
    }
}
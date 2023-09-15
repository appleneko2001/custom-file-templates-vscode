import {WorkspaceConfiguration} from 'vscode';
import fs = require('fs');
import path = require('path');
import os = require('os');
import * as utils from './utils';
import { MetadataModel } from './models/metadataModel';
import { CreateFilesOptions } from './options/createFilesOptions';

export default class TemplatesManager {
    private templates: MetadataModel[] = [];
    config: WorkspaceConfiguration;

    propRegex = new RegExp(/{{(\w+)}}/, "g");

    constructor(config: WorkspaceConfiguration){
        this.config = config;
    }

    public refreshTemplateListing() {
        const source = this.getTemplatesDir();

        this.templates = utils.getDirectories(source)
            .map(p => this.readMetadataJsonModel(p))
            .filter(a => a !== undefined)
            .map(a => <MetadataModel>a);
    }

    public getTemplates() : MetadataModel[] {
        return this.templates;
    }

    public getTemplateNames() : string[] {
        return this.templates.map(a => a.title);
    }

    public browseTemplateDir() {
        utils.openFolderInExplorer(this.getTemplatesDir());
    }

    public getTemplatesDir() : string {
        return this.config.get("templates_dir", this.getDefaultTemplatesDir());
    }

    public prepareConfigDirIfNotExists() {
        let templatesDir = this.getTemplatesDir();

        fs.mkdir(templatesDir, '0755', (err) => {
            if(err && err.code !== 'EEXIST') {
                throw Error("Unable to init a custom templates folder!");
            }
        });
    }

    /*
     * This method should be called from NewFileFromTemplateCommand.
     */
    public createFilesFromTemplateToDir(options: CreateFilesOptions){
        const template = options.template;
        const templatePath = (template as any).path;

        options.namespace = this.detectAndModifyNamespaceOption(template, options.namespace);

        template.adds.forEach(async element => {
            const refFilePath = path.join(templatePath, element.refFile);
            fs.readFile(refFilePath, (error, data) => {
                if(error) {
                    throw error;
                }

                let sourceData = this.detectAndPutTextToPlaceholder(data.toString("utf-8"), options);
                const fileName = this.detectAndPutTextToPlaceholder(element.newFileName, options);
                const finalFilePath = path.join(options.toFolder, fileName);

                fs.writeFile(finalFilePath, sourceData, {flag: "w+", encoding: "utf-8",}, error => {
                    if(error){
                        throw error;
                    }
                });
            });
        });
    }

    private detectAndModifyNamespaceOption(metadata: MetadataModel, source?:string) : string | undefined{
        if(!source) {
            return undefined;
        }

        let newNamespace = source;
        const mods = metadata.namespaceModifer;

        if(!mods){
            return newNamespace;
        }

        for (const rule of mods)
        {
            // not sure why string.replace does only once to replace some texts
            // gonna use loop to repeat if the thing still exists.
            while(newNamespace.indexOf(rule.replace!) > -1)
            {
                newNamespace = newNamespace.replace(rule.replace!, rule.to!);
            }
        }

        return newNamespace;
    }

    private detectAndPutTextToPlaceholder(source: string, options: CreateFilesOptions) : string {
        const propRegexPat = /\{\{(\w+)\}\}/g;

        let result = source;
        let searchResult;
        while((searchResult = propRegexPat.exec(result)) !== null)
        {
            const startIndex = searchResult.index;
            const endIndex = startIndex + searchResult[0].length;
            const propName = result
                .substring(startIndex, endIndex)
                .replace("{{", "")
                .replace("}}", "");
            
            result = `${result.slice(0, startIndex)}${this.tryReplacePlaceholderAsValue(propName, options.objectName, options.namespace)}${result.slice(endIndex)}`;
        }

        return result;
    }

    // Used for replacing placeholder as value. it is incomplete.
    private tryReplacePlaceholderAsValue(placeholder: string, name: string, namespace?: string) : string | undefined {

        switch(placeholder.toLowerCase()){
            case "name":
                return name;

            case "namespace":
                return namespace;
        }

        return undefined;
    }

    private getDefaultTemplatesDir(): string {
        let userDataDir = null;

        // There is exist not only one variant of VSCode (from micro$oft), 
        // probably we need to put some supports for OSS VSCode variants, too.
        const vscodeVariant = "Code";

        switch (process.platform) {
            case 'linux':
                userDataDir = path.join(os.homedir(), '.config');
                break;
            case 'darwin':
                userDataDir = path.join(os.homedir(), 'Library', 'Application Support');
                break;
            case 'win32':
                userDataDir = process.env.APPDATA;
                break;
            default:
                console.log(`Platform \"${process.platform}\" is unsupported os!!! ` + 
                `please submit a issue to my GitHub repository and tell me about that!!!`);
                throw Error("Unrecognizable operative system");
        }

        if(userDataDir === undefined) {
            throw Error("why its undefined lol?");
        }

        return path.join(userDataDir, vscodeVariant, 'User', 'customTemplates');
    }

    private readMetadataJsonModel(folder: string) : MetadataModel | undefined {
        const p = path.join(folder, "metadata.json");
        const json = fs.readFileSync(p, { encoding: "utf-8" });
        
        const result = <MetadataModel>JSON.parse(json);
        (result as any).path = folder;
        
        return result;
    }
}
import { AddFileRuleModel } from "./addFileRuleModel";
import { NamespaceModiferModel } from "./namespaceModiferModel";

export class MetadataModel {
    title: string = "";
    adds: AddFileRuleModel[] = [];
    namespaceModifer?: NamespaceModiferModel[];
}
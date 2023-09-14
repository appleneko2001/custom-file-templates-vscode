import child_process = require("child_process");
import * as path from 'path';
import fs = require('fs');

export function openFolderInExplorer (path : string) {
    let command = null;
    switch (process.platform) {
        case "linux":
            command = `xdg-open ${path}`;
            break;

        case "darwin":
            command = `open ${path}`;
            break;
        
        case "win32":
            command = `start ${path}`;
            break;
        
        default:
            throw Error("Unsupported OS, yet.");
    }

    if (command === null) {
        throw Error("Command shouldn't be null or empty!!!");
    }

    child_process.exec(command);
}

// only csharp project yet. its came from
// https://github.com/jchannon/csharpextensions/blob/master/src/extension.ts
export function getNamespacePath(workspace: string, target: string) {

    const regex = /(\.sln)$/g;
    
    let dir = target;
    do
    {
        if (getFiles(dir).some(p => {
            const filename = path.basename(p);
            return regex.test(filename);
        }))
        {
            break;
        }
    }
    while(((dir = path.dirname(dir)).length > workspace.length));
    const dest = path.relative(dir, target);

    return dest;
}

export const isDirectory = (source: string) => 
    fs.lstatSync(source).isDirectory();

export const getDirectories = (source: string) =>
    fs.readdirSync(source)
        .map(name => path.join(source, name))
        .filter(isDirectory);

export const getFiles = (source: string) =>
    fs.readdirSync(source)
        .map(name => path.join(source, name))
        .filter(a => fs.lstatSync(a).isFile);
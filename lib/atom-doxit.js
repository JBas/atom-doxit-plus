"use babel";

import {CompositeDisposable} from "atom";

// Helper function for inserting parameters into function string.
function appendParameter(function_comment, parameters) {
    for (let param of parameters) {
        function_comment += " * @param ";
        function_comment += param.name;
        function_comment += " ";
        function_comment += param.desc;
        function_comment += "\r\n";
    }
    return function_comment;
}

function setGitHubName() {

    // taking little peeks over at https://github.com/rododo-meow/github-plus/blob/master/lib/github.coffee

    let path = atom.workspace.getActiveTextEditor().getPath();
    let directory = atom.project.getDirectories()[0];

    let github_name = "";
    atom.project.repositoryForDirectory(directory).then((repo) => {
        let username = repo.getOriginURL().match(/git@github.com:(.+)\/.+\.git/)[1]
        fetch("https://api.github.com/users/" + username).then((resp) => resp.json()).then((data) => {
            atom.config.set("atom-doxit.author_name", data.name)
            atom.config.set("atom-doxit.copyright_holder_name", data.name)
        })
    });
}

export default {
    modalPanel: null,
    subscriptions: null,

    config: {
        author_name: {
            type: "string",
            default: "Joe Bloggs"
        },
        copyright_holder_name: {
            type: "string",
            default: "Joe Bloggs"
        }
    },

    activate(state) {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add("atom-workspace", {
            "atom-doxit:insert_header": () => this.insert_header(),
            "atom-doxit:insert_function": () => this.insert_function()
        }));

        setGitHubName();
    },

    deactivate(state) {
        this.subscriptions.dispose();
    },

    insert_header() {
        // Get the current date in "10/10/2020" format
        let now = new Date();
        let month = now.getMonth()+1;
        let day = now.getDate();
        let year = now.getFullYear();

        let editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }

        // Get the filename of the current pane
        let filepath = editor.getBuffer().getPath();
        if (filepath) {
            filename = filepath.substring(filepath.lastIndexOf('/')+1, filepath.length);
        } else {
            filename = "<filename>";
        }

        // Get author and copyright holder from package settings
        let author = atom.config.get("atom-doxit.author_name");
        let copyright_holder = atom.config.get("atom-doxit.copyright_holder_name");

        // Set the header comment string, inserting date ,filename, etc
        let comment = "/**\r\n" +
                      " * @file " + filename + "\r\n" +
                      " * @author " + author + "\r\n" +
                      " * @date " + month + "/" + day + "/" + year + "\r\n" +
                      " * @copyright " + year + " " + copyright_holder + "\r\n" +
                      " *\r\n" +
                      " * @section <> <>\r\n" +
                      " *\r\n" +
                      " * @brief <brief>\r\n" +
                      " */\r\n";

        // Insert the header comment at the current cursor position.
        editor.insertText(comment);

    },

    insert_function() {
        let editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return
        }

        let cpos = editor.getCursorBufferPosition();
        let crow = cpos.row;
        let text = editor.lineTextForBufferRow(crow);
        let re = /(.+)\s+(.+)\((.*?)\)/;
        let matches = Array.from(text.matchAll(re))[0];

        let ret_type = matches[1];
        let func_name = matches[2];
        let func_params = matches[3];
        func_params = func_params.split(",").map(x => x.trim());

        let parameters = func_params.map(p => {
            return {name:p, desc:"<parameter_description>"}
        });

        let comment = "/**\r\n" +
                      " * @brief <brief>\r\n";
        // Add parameters to function
        comment = appendParameter(comment, parameters);
        comment += " * @return " + ret_type;

        if (ret_type != "void"){
            comment += ": <return_description>\r\n";
        } else {
            comment += "\r\n";
        }
        comment += " * @details <details>\r\n" +
                   " */\r\n";
        // Add the function comment at the current cursor position
        editor.insertText(comment);
    }
};

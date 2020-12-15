"use babel";

import {CompositeDisposable} from "atom";

const fs = require("fs");

// let peg = require("pegjs");

let COMMENT = {
    START_TOK: {
        type: "",
        default: "/**"
    },
    TOK: {
        type: "",
        default: " * "
    },
    END_TOK: {
        type: "",
        default: " */"
    }
};


// Helper function for inserting parameters into function string.
function appendParameter(function_comment, parameters) {
    for (let param of parameters) {
        function_comment += `${COMMENT.TOK.type}@param `;
        function_comment += param.name;
        function_comment += " ";
        function_comment += param.desc;
        function_comment += "\r\n";
    }
    return function_comment;
}

function setGitHubName() {

    // taking little peeks over at https://github.com/rododo-meow/github-plus/blob/master/lib/github.coffee
    let directory = atom.project.getDirectories()[0];

    atom.project.repositoryForDirectory(directory).then((repo) => {

        if (!repo) {
            return
        }

        let username = repo.getOriginURL().match(/git@github.com:(.+)\/.+\.git/)[1]
        fetch("https://api.github.com/users/" + username).then((resp) => resp.json()).then((data) => {
            atom.config.set("atom-doxit-plus.author_name", data.name)
            atom.config.set("atom-doxit-plus.author_email", data.email)
            atom.config.set("atom-doxit-plus.copyright_holder_name", data.name)
        })
    });
}

function setCommentToken(filepath) {
    let ext = filepath.substring(filepath.lastIndexOf("."), filepath.length);
    switch (ext) {
        case ".py":
            COMMENT.START_TOK.type = `"""`;
            COMMENT.TOK.type = "";
            COMMENT.END_TOK.type = `"""`;
            break
        case ".cpp":
        case ".h":
        case ".c":
        default:
            COMMENT.START_TOK.type = COMMENT.START_TOK.default;
            COMMENT.TOK.type = COMMENT.TOK.default;
            COMMENT.END_TOK.type = COMMENT.END_TOK.default;

    }
}

export default {
    modalPanel: null,
    subscriptions: null,

    config: {
        author_name: {
            type: "string",
            default: "Joe Bloggs"
        },
        author_email: {
            type: "string"
        },
        copyright_holder_name: {
            type: "string",
            default: "Joe Bloggs"
        }
    },

    activate(state) {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add("atom-workspace", {
            "atom-doxit-plus:insert_header": () => this.insert_header(),
            "atom-doxit-plus:insert_function": () => this.insert_function()
        }));

        setGitHubName();
    },

    deactivate(state) {
        this.subscriptions.dispose();
    },

    insert_header() {
        // Get the current date in "10/10/2020" format
        let month;
        let day;
        let year;

        let editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }

        let stat = fs.statSync(editor.getPath());
        if (!stat) {
            let now = new Date();
            month = now.getMonth()+1;
            day = now.getDate();
            year = now.getFullYear();
        } else {
            let months = {
                "Jan" : "1",
                "Feb" : "2",
                "Mar" : "3",
                "Apr" : "4",
                "May" : "5",
                "Jun" : "6",
                "Jul" : "7",
                "Aug" : "8",
                "Sep" : "9",
                "Oct" : "10",
                "Nov" : "11",
                "Dec" : "12"
            };


            let re = /(.+?)\s+(.+?)\s+(.+?)\s+(.+?)\s+/;
            let matches = Array.from(stat.birthtime.toString().matchAll(re))[0];

            month = months[matches[2]];
            day = matches[3];
            year = matches[4];
        }

        // Get the filename of the current pane
        let filename = editor.getTitle();
        if (!filename) {
            filename = "<filename>";
        }

        setCommentToken(editor.getBuffer().getPath());

        // Get author and copyright holder from package settings
        let author = atom.config.get("atom-doxit-plus.author_name");
        let email = atom.config.get("atom-doxit-plus.author_email");
        let copyright_holder = atom.config.get("atom-doxit-plus.copyright_holder_name");

        // Set the header comment string, inserting date ,filename, etc
        let comment = `${COMMENT.START_TOK.type}\r\n` +
                      `${COMMENT.TOK.type}@file ` + filename + "\r\n";
        if (email) {
            comment += `${COMMENT.TOK.type}@author ` + author + ` (${email})` + "\r\n";
        } else {
            comment += `${COMMENT.TOK.type}@author ` + author + "\r\n";
        }
        comment +=  `${COMMENT.TOK.type}@date ${month}/${day}/${year}\r\n` +
                    `${COMMENT.TOK.type}@brief <brief>\r\n` +
                    `${COMMENT.TOK.type}@details <details>\r\n` +
                    `${COMMENT.TOK.type}@bug No known bugs\r\n` +
                    `${COMMENT.TOK.type}@version <version number>\r\n` +
                    `${COMMENT.TOK.type}@copyright ${year} ${copyright_holder}\r\n` +
                    `${COMMENT.END_TOK.type}\r\n`;

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
                   " * @todo <what's left todo>\r\n" +
                   " */\r\n";
        // Add the function comment at the current cursor position
        editor.insertText(comment);
    }
};

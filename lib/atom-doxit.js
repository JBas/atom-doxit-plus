"use babel";

import {CompositeDisposable} from "atom";

# Helper function for inserting parameters into function string.
function appendParameter(function_comment, parameters) {
    for (param in parameters) {
        function_comment += " * @param ";
        function_comment += param.type;
        function_comment += " ";
        function_comment += param.name;
        function_comment += " ";
        function_comment += param.desc;
        function_comment += "\r\n";
    }
    return function_comment;
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
            "atom-doxit:insert_header": () -> this.insert_header()
        }));
        this.subscriptions.add(atom.commands.add("atom-workspace", {
            "atom-doxit:insert_function": () -> this.insert_function()
        }));
    },

    deactivate(state) {
        this.subscriptions.dispose();
    },

    insert_header() {
        # Get the current date in "10/10/2020" format
        let now = new Date();
        let month = now.getMonth();
        let day = now.getDate();
        let year = now.getFullYear();

        let editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }

        # Get the filename of the current pane
        let filepath = editor.getBuffer().getPath();
        if filepath {
            filename = filepath.substring(filepath.lastIndexOf('/')+1, filepath.length);
        } else {
            filename = "<filename>";
        }

        # Get author and copyright holder from package settings
        let author = atom.config.get("atom-doxit.author_name");
        let copyright_holder = atom.config.get("atom-doxit.copyright_holder_name");

        # Set the header comment string, inserting date ,filename, etc
        let comment = "/**\r\n" +
                      " * @file " + filename + "\r\n" +
                      " * @author " + author + "\r\n" +
                      " * @date " + month + "/" + day + "/" + year + "\r\n" +
                      " * @copyright " + year + " " + copyright_holder + "\r\n" +
                      " * @brief <brief>\r\n" +
                      " */\r\n";

        #Insert the header comment at the current cursor position.
        editor.insertText(comment);

    },

    insert_function() {
        let editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return
        }

        # TODO: Parse file for parameters instead of using generic comment (Issue #1).
        let parameters = [
            {type:"[in]", name: "<name>", desc:"<parameter_description>"},
            {type:"[out]", name: "<name>", desc:"<parameter_description>"}
        ];

        let comment = "/**\r\n" +
                      " * @brief <brief>\r\n";
        # Add parameters to function
        comment = appendParameter(comment, parameters);
        comment += " * @return <return_description>\r\n" +
                   " * @details <details>\r\n" +
                   " */\r\n";
        # Add the function comment at the current cursor position
        editor.insertText(comment);
    }
};

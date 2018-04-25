{CompositeDisposable} = require 'atom'

# Helper function for inserting parameters into function string.
appendParameter = (function_comment, parameters, i) ->
  function_comment += "* @param "
  function_comment += parameters[i].type
  function_comment += " "
  function_comment += parameters[i].name
  function_comment += " "
  function_comment += parameters[i].desc
  function_comment += "\r\n"
  return function_comment

module.exports = AtomDoxit =
  modalPanel: null
  subscriptions: null

  # Configuration schema
  config:
    author_name:
      type: 'string'
      default: 'Joe Bloggs'
    copyright_holder_name:
      type: 'string'
      default: 'Joe Bloggs'

  activate: (state) ->

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-doxit:insert_function': => @insert_function()
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-doxit:insert_header': => @insert_header()

  deactivate: ->
    @subscriptions.dispose()

  insert_function: ->
    editor = atom.workspace.getActiveTextEditor()

    #TODO: Parse file for parameters instead of using generic comment (Issue #1).
    parameters = [
      {type:"[in]", name: "<name>", desc:"<parameter_description>"},
      {type:"[out]", name: "<name>", desc:"<parameter_description>"},
    ]

    function_comment = "/**\r\n" +
                      "* @brief <brief>\r\n"

    #Add parameters to function
    function_comment = appendParameter(function_comment, parameters, 0)

    #Add remainder of function comment
    function_comment += "* @return <return_description>\r\n" +
                        "* @details <details>\r\n" +
                        "*/\r\n"

    #Add the function comment at the current cursor position
    editor.insertText(function_comment)

  insert_header: ->
    #Get the current date in "1 Aug 2016" format
    now = new Date
    day = now.getDate()
    year = now.getFullYear()
    month_text = [
      'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
    ]
    month = month_text[now.getMonth()]

    # Get the editor, so we can use some of its properties
    editor = atom.workspace.getActiveTextEditor()

    # Get the filename of the current pane
    file = editor?.buffer.file
    filepath = file?.path
    if filepath
      filename = filepath.substring(filepath.lastIndexOf('/')+1, filepath.length);
    else
      filename = '<filename>'

    # Get author and copyright holder from package settings
    author = atom.config.get('atom-doxit.author_name')
    copyright_holder = atom.config.get('atom-doxit.copyright_holder_name')

    # Set the header comment string, inserting date ,filename, etc
    header_comment = "/**\r\n" +
                    "* @file " + filename + "\r\n" +
                    "* @author " + author + "\r\n" +
                    "* @date " + day + " " + month + " " + year + "\r\n" +
                    "* @copyright " + year + " " + copyright_holder + "\r\n" +
                    "* @brief <brief>\r\n" +
                    "*/\r\n"

    #Insert the header comment at the current cursor position.
    editor.insertText(header_comment)

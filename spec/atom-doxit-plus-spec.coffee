AtomDoxit = require '../lib/atom-doxit-plus'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "AtomDoxit", ->
  describe "when the atom-doxit-plus:insert_function event is triggered", ->
    it "the atom-doxit-plus package should be active", ->
      waitsForPromise ->
        atom.packages.activatePackage('atom-doxit-plus')
      runs ->
        expect(atom.packages.isPackageActive('atom-doxit-plus')).toBe true

    it "inserts a @brief comment", ->
      waitsForPromise ->
        atom.packages.activatePackage('atom-doxit-plus')
        atom.views.getView(atom.workspace)
        atom.workspace.open('brieftest.txt')
      runs ->
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'atom-doxit-plus:insert_function')
        editor = atom.workspace.getActiveTextEditor()
        brief_comment = "* @brief <brief>\r\n"
        expect(editor.getText()).toContain(brief_comment)

    it "inserts a @return comment", ->
      waitsForPromise ->
        atom.packages.activatePackage('atom-doxit-plus')
        atom.views.getView(atom.workspace)
        atom.workspace.open('returntest.txt')
      runs ->
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'atom-doxit-plus:insert_function')
        editor = atom.workspace.getActiveTextEditor()
        return_comment = "* @return <return_description>\r\n"
        expect(editor.getText()).toContain(return_comment)

    it "inserts a @details comment", ->
      waitsForPromise ->
        atom.packages.activatePackage('atom-doxit-plus')
        atom.views.getView(atom.workspace)
        atom.workspace.open('detailstest.txt')
      runs ->
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'atom-doxit-plus:insert_function')
        editor = atom.workspace.getActiveTextEditor()
        details_comment = "* @details <details>\r\n"
        expect(editor.getText()).toContain(details_comment)

  describe "when the atom-doxit-plus:insert_header event is triggered", ->
    it "the atom-doxit-plus package should be active", ->
      waitsForPromise ->
        atom.packages.activatePackage('atom-doxit-plus')
      runs ->
        expect(atom.packages.isPackageActive('atom-doxit-plus')).toBe true

    it "inserts a @file comment", ->
      waitsForPromise ->
        atom.packages.activatePackage('atom-doxit-plus')
        atom.views.getView(atom.workspace)
        atom.workspace.open('brieftest.txt')
      runs ->
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'atom-doxit-plus:insert_header')
        editor = atom.workspace.getActiveTextEditor()
        file_comment = "* @file brieftest.txt\r\n"
        expect(editor.getText()).toContain(file_comment)

  it "inserts a @author comment", ->
    waitsForPromise ->
      atom.packages.activatePackage('atom-doxit-plus')
      atom.views.getView(atom.workspace)
      atom.workspace.open('brieftest.txt')
    runs ->
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'atom-doxit-plus:insert_header')
      editor = atom.workspace.getActiveTextEditor()
      author = atom.config.get('atom-doxit-plus.author_name')
      author_comment = "* @author " + author + "\r\n"
      expect(editor.getText()).toContain(author_comment)

  it "inserts a @date comment", ->
    waitsForPromise ->
      atom.packages.activatePackage('atom-doxit-plus')
      atom.views.getView(atom.workspace)
      atom.workspace.open('brieftest.txt')
    runs ->
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'atom-doxit-plus:insert_header')
      editor = atom.workspace.getActiveTextEditor()

      #Generate the date
      now = new Date
      day = now.getDate()
      year = now.getFullYear()
      month_text = [
        'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
      ]
      month = month_text[now.getMonth()]
      date = day + " " + month + " " + year
      date_comment = "* @date " + date + "\r\n"

      #Check the date
      expect(editor.getText()).toContain(date_comment)

  it "inserts a @copyright comment", ->
    waitsForPromise ->
      atom.packages.activatePackage('atom-doxit-plus')
      atom.views.getView(atom.workspace)
      atom.workspace.open('brieftest.txt')
    runs ->
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'atom-doxit-plus:insert_header')
      editor = atom.workspace.getActiveTextEditor()

      #Get the year
      now = new Date
      year = now.getFullYear()

      #Get the author
      author = atom.config.get('atom-doxit-plus.author_name')

      #Check the copyright comment
      copyright_comment = "* @copyright " + year + " " + author + "\r\n"
      expect(editor.getText()).toContain(copyright_comment)

  it "inserts a @brief comment", ->
    waitsForPromise ->
      atom.packages.activatePackage('atom-doxit-plus')
      atom.views.getView(atom.workspace)
      atom.workspace.open('brieftest.txt')
    runs ->
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'atom-doxit-plus:insert_header')
      editor = atom.workspace.getActiveTextEditor()
      brief_comment = "* @brief <brief>\r\n"
      expect(editor.getText()).toContain(brief_comment)

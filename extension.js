// extension.js
const vscode = require('vscode');
const CommandHandler = require('./handlers/commandHandler');

function activate(context) {
  console.log('Congratulations, your extension "mydevelopper" is now active!');

  const apiKey = vscode.workspace.getConfiguration('mydevelopper').get('openaiApiKey');
  const commandHandler = new CommandHandler(apiKey);

  let disposable = vscode.commands.registerCommand('mydevelopper.addCode', () => commandHandler.handleAddCodeCommand());
  let disposable2 = vscode.commands.registerCommand('mydevelopper.commit', () => commandHandler.handleCommitCommand());

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};

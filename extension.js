const vscode = require('vscode');
const { Configuration, OpenAIApi } = require('openai');

function activate(context) {
  console.log('Congratulations, your extension "mydevelopper" is now active!');

  let disposable = vscode.commands.registerCommand('mydevelopper.addCode', async function () {
    const userInput = await vscode.window.showInputBox({ prompt: 'Enter the code you want to generate' });

    if (userInput) {
      const apiKey = vscode.workspace.getConfiguration('mydevelopper').get('openaiApiKey');
      const configuration = new Configuration({
        apiKey: apiKey,
      });
      const openai = new OpenAIApi(configuration);

      try {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: userInput,
          max_tokens: 1000, 
          n: 1, 
        });

        const options = completion.data.choices.map((choice, index) => ({
          label: `Option ${index + 1}`,
          detail: choice.text,
        }));

        const selectedOption = await vscode.window.showQuickPick(options, {
          placeHolder: 'Select the code you want to insert',
        });

        if (selectedOption) {
          vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.insert(vscode.window.activeTextEditor.selection.active, selectedOption.detail);
          });
        } else {
          vscode.window.showInformationMessage('No code was selected.');
        }
      } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
        vscode.window.showErrorMessage('An error occurred while generating code.');
      }
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};

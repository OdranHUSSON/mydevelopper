const vscode = require('vscode');
const OpenAIService = require('../services/openaiService');

class CommandHandler {
  constructor(apiKey) {
    this.openaiService = new OpenAIService(apiKey);
  }



async handleCommitCommand(){
	const userInput = await vscode.window.showInputBox({ prompt: 'Explain the changes you made in this commit' });
	const prompt = `\nAs an expert developer generate a short commit message with emoji for this changes: ${userInput}.`;

	// Add the document text to the prompt

	if (userInput) {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Generating commit message...",
			cancellable: false
		}, async (progress) => {
			try {
				const commitMessage = await this.openaiService.generateCompletions(prompt, 100, 1);
        
        const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
        const git = gitExtension.getAPI(1);
        const repo = git.repositories[0];

        try {
          await repo.add(".");
          await repo.commit(commitMessage);
        } catch (gitError) {
          vscode.window.showErrorMessage('An error occurred while committing. Here is the generated commit message: ' + commitMessage);
          console.error(gitError);
        }
        
			} catch (error) {
				vscode.window.showErrorMessage('An error occurred while generating code.');
				console.error(error);
			}
		});
	}
}

  /**
   *  Add a code where your custor is placed in a file, provides the file as additional context for LLM
   * @returns 
   */
  async handleAddCodeCommand() {
    const userInput = await vscode.window.showInputBox({ prompt: 'Enter the code you want to generate' });
    const prompt = `\nAs an expert developer provide the code for the following task: ${userInput}.\nOutput only the code, nothing else.`;
  
    // Get the currently opened file
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No editor is active');
      return;
    }
  
    // Get the document text
    const documentText = editor.document.getText();
  
    // Add the document text to the prompt
    const fullPrompt = `${documentText}\n${prompt}`;
  
    if (userInput) {
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating code...",
        cancellable: false
      }, async (progress) => {
        try {
          const completions = await this.openaiService.generateCompletions(fullPrompt);
  
          const options = completions.map((completion, index) => ({
            label: `Option ${index + 1}`,
            detail: completion,
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
          vscode.window.showErrorMessage('An error occurred while generating code.');
          console.error(error);
        }
      });
    }
  }  
}

module.exports = CommandHandler;

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "c-cpp-function-call-generator" is now active!');

	let disposable = vscode.commands.registerCommand('c-cpp-function-call-generator.generateFunctionCall', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) { return; }

		let functionSignature = getFunctionSignature(editor);
		if (!functionSignature) { return; }

		functionSignature = functionSignature.replace(/[\r\n]/gm, ""); // remove line breaks

		const functionRegex = /(\w+)\s*\((.*?)\)/;
		const match = functionSignature.match(functionRegex);
		if (!match) { return; }

  		let [, functionName, parameters] = match;

		parameters += ','; // add comma to the end to match with
		const parameterRegex = /\b(\w+)(?:\[.*?\])*,/g;
		const argNames = [...parameters.matchAll(parameterRegex)].map(match => match[1]);

		const functionCall = `${functionName}(${argNames.join(', ')});`;

		const currentLine = editor.selection.start.line;
		editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(currentLine, 0), functionCall + '\n');
        });
	});

	// Returns text from the start of the current selected line to the first closing parathesis found.
	function getFunctionSignature(editor: vscode.TextEditor): string | undefined {
		const cursorPosition = editor.selection.anchor;
		const document = editor.document;
	
		// Find the line containing the closing parenthesis
		let closingParenLine = cursorPosition.line;
		let closingParenIndex = -1;
		while (closingParenLine < document.lineCount) {
			const line = document.lineAt(closingParenLine);
			const lineText = line.text;
			const lineClosingParenIndex = lineText.indexOf(')');
			if (lineClosingParenIndex !== -1) {
				closingParenIndex = lineClosingParenIndex;
				break;
			}
			closingParenLine++;
		}
	
		if (closingParenIndex === -1) {
			return undefined;
		}
	
		// Build up the text from the start of the cursor line to the closing parenthesis
		let text = editor.document.getText(new vscode.Range(cursorPosition.line, 0, closingParenLine, closingParenIndex + 1));
		return text;
	}

	context.subscriptions.push(disposable);
}

export function deactivate() {}

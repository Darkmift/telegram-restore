import fs from 'fs-extra';
import path from 'path';
import extractMessagesAndMediaFromHtml from './extractMessagesFromHtml';

export async function analyzeChatFolder(folderPath: string): Promise<void> {
  try {
    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
      console.error(`The folder ${folderPath} does not exist.`);
      return;
    }

    // Look for the messages.html file in the folder
    const messagesFile = path.join(folderPath, 'messages.html');
    if (!fs.existsSync(messagesFile)) {
      console.error(`No messages.html file found in the folder: ${folderPath}`);
      return;
    }

    console.log(`Analyzing chat folder: ${folderPath}`);

    // Extract messages and media from the HTML file (pass the file path)
    const extractedMessages = extractMessagesAndMediaFromHtml(messagesFile);

    // Format the messages for WhatsApp import
    const formattedMessages = extractedMessages.join('\n');

    // Write the result to chat.txt
    const outputFilePath = path.join(folderPath, 'chat.txt');
    await fs.writeFile(outputFilePath, formattedMessages);
    console.log(`Chat analysis complete. Output written to: ${outputFilePath}`);
  } catch (error) {
    console.error('Error analyzing the chat folder:', error);
  }
}

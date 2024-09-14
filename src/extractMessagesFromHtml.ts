import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// Function to extract messages and media from HTML
export default function extractMessagesAndMediaFromHtml(htmlFilePath: string): string[] {
  const html = fs.readFileSync(htmlFilePath, 'utf-8');
  const $ = cheerio.load(html);
  const messages: string[] = [];
  let lastFromName = ''; // Keep track of the last sender's name
  let mediaCounter = 1;   // Counter for naming media files

  // Get the directory where the HTML file resides
  const htmlDirectory = path.dirname(htmlFilePath);

  // Create a media folder if it doesn't exist
  const mediaFolderPath = path.join(htmlDirectory, 'media');
  if (!fs.existsSync(mediaFolderPath)) {
    fs.mkdirSync(mediaFolderPath);
  }

  // Loop through each message div
  $('.message.default.clearfix, .message.default.clearfix.joined').each((i, element) => {
    const fromName = $(element).find('.from_name').text().trim();
    const messageText = $(element).find('.text').text().trim();
    const messageDate = $(element).find('.pull_right.date.details').attr('title') || $(element).find('.pull_right.date.details').text().trim();
    
    // If we find a new "from_name", update the lastFromName variable
    if (fromName) {
      lastFromName = fromName;
    }

    const finalFromName = lastFromName || 'Unknown';

    // Check for media files (images, voice messages, videos, etc.)
    const mediaLink = $(element).find('a').attr('href');
    if (mediaLink) {
      const mediaType = $(element).find('.media_video, .media_voice_message').length > 0 ? 'Voice message' : 'Media';
      const mediaExtension = path.extname(mediaLink); // Extract the file extension
      const mediaFileName = `MEDIA-${mediaCounter}${mediaExtension}`; // Naming convention for media files
      mediaCounter++;

      // Assume the media file is located relative to the HTML file, not the script
      const mediaFilePath = path.join(htmlDirectory, mediaLink);
      const targetMediaFilePath = path.join(mediaFolderPath, mediaFileName);
      console.log("🚀 ~ $ ~ targetMediaFilePath:", targetMediaFilePath)

      try {
        fs.copyFileSync(mediaFilePath, targetMediaFilePath); // Copy the media file
        messages.push(`${messageDate} - ${finalFromName}: [${mediaType}] (${mediaFileName})`);
      } catch (error) {
        console.error(`Error copying media file: ${mediaLink} - ${(error as Error).message}`);
        messages.push(`${messageDate} - ${finalFromName}: [Missing ${mediaType}] (Could not find: ${mediaLink})`);
      }
    } else if (messageText && messageDate) {
      // Add normal text messages
      messages.push(`${messageDate} - ${finalFromName}: ${messageText}`);
    }
  });

  return messages;
}

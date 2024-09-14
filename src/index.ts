import { Command } from 'commander';
import path from 'path';
import { analyzeChatFolder } from './chatAnalyzer';

const program = new Command();

program
  .name('telegram-to-whatsapp-converter')
  .description('CLI to convert Telegram chats into WhatsApp format.')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert a Telegram chat folder to WhatsApp format.')
  .argument('<folder>', 'Path to the Telegram chat folder')
  .action((folder: string) => {
    const folderPath = path.resolve(folder);
    analyzeChatFolder(folderPath);
  });

program.parse(process.argv);

import { Command } from 'commander';
import chalk from 'chalk';
import { taskCommand } from './commands/task.js';
import { attachCommand } from './commands/attach.js';
import { resumeCommand } from './commands/resume.js';
import { statusCommand } from './commands/status.js';

const program = new Command();

program
  .name('xandrix')
  .description(chalk.bold('XandriX Terminal Agent') + ' — autonomous AI coding and automation CLI')
  .version('0.0.1');

program.addCommand(taskCommand);
program.addCommand(attachCommand);
program.addCommand(resumeCommand);
program.addCommand(statusCommand);

program.parse(process.argv);

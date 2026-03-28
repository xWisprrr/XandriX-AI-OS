import { Command } from 'commander';
import chalk from 'chalk';

export const attachCommand = new Command('attach')
  .description('Attach a repository to an active XandriX session')
  .option('-r, --repo <path>', 'Path to the repository', process.cwd())
  .option('--endpoint <url>', 'Orchestrator endpoint URL', 'http://localhost:3003')
  .action((opts: { repo: string; endpoint: string }) => {
    console.log();
    console.log(chalk.bold.magenta('◈ XandriX — Attach Repository'));
    console.log(chalk.dim(`  Repo: ${opts.repo}`));
    console.log(chalk.dim(`  Endpoint: ${opts.endpoint}`));
    console.log();
    // TODO: resolve git remote, create or update workspace via API
    console.log(chalk.yellow('⚠  Repository attachment is not yet implemented — coming in Phase 1.'));
    console.log();
  });

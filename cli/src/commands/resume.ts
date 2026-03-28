import { Command } from 'commander';
import chalk from 'chalk';

export const resumeCommand = new Command('resume')
  .description('Resume a paused XandriX task session')
  .argument('<session-id>', 'Session or task ID to resume')
  .option('--endpoint <url>', 'Orchestrator endpoint URL', 'http://localhost:3003')
  .action(async (sessionId: string, opts: { endpoint: string }) => {
    console.log();
    console.log(chalk.bold.magenta('◈ XandriX — Resume Session'));
    console.log(chalk.dim(`  Session: ${sessionId}`));
    console.log();
    try {
      const response = await fetch(`${opts.endpoint}/tasks/${sessionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'running' }),
      });
      if (!response.ok) {
        console.error(chalk.red(`Failed to resume: ${response.status}`));
        process.exit(1);
      }
      const json = (await response.json()) as { data: { status: string } };
      console.log(chalk.green(`✓ Session resumed — status: ${json.data.status}`));
    } catch (err) {
      console.error(chalk.red(`Could not reach orchestrator at ${opts.endpoint}`));
      if (err instanceof Error) console.error(chalk.dim(`  ${err.message}`));
      process.exit(1);
    }
  });

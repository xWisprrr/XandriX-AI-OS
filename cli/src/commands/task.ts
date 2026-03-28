import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

export const taskCommand = new Command('task')
  .description('Delegate a task to the XandriX Orchestrator')
  .argument('<goal>', 'Natural language goal description')
  .option('-r, --repo <path>', 'Path to the repository to attach', process.cwd())
  .option('-p, --priority <level>', 'Task priority: low | normal | high | critical', 'normal')
  .option('--approval <mode>', 'Approval mode: always | high_risk_only | auto_safe', 'high_risk_only')
  .option('--endpoint <url>', 'Orchestrator endpoint URL', 'http://localhost:3003')
  .action(async (goal: string, opts: { repo: string; priority: string; approval: string; endpoint: string }) => {
    console.log();
    console.log(chalk.bold.magenta('◈ XandriX Terminal Agent'));
    console.log(chalk.dim(`  Repo:     ${opts.repo}`));
    console.log(chalk.dim(`  Priority: ${opts.priority}`));
    console.log(chalk.dim(`  Approval: ${opts.approval}`));
    console.log();

    const spinner = ora({ text: chalk.cyan('Sending task to orchestrator…'), color: 'magenta' }).start();

    try {
      const sessionId = crypto.randomUUID();
      const response = await fetch(`${opts.endpoint}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, sessionId, priority: opts.priority }),
      });

      if (!response.ok) {
        const body = await response.text();
        spinner.fail(chalk.red(`Orchestrator error (${response.status}): ${body}`));
        process.exit(1);
      }

      const json = (await response.json()) as { data: { id: string; status: string } };
      spinner.succeed(chalk.green('Task created successfully'));
      console.log();
      console.log(chalk.bold('  Task ID:') + chalk.cyan(`  ${json.data.id}`));
      console.log(chalk.bold('  Status: ') + chalk.yellow(`  ${json.data.status}`));
      console.log();
      console.log(chalk.dim(`  Run ${chalk.white('xandrix status ' + json.data.id)} to monitor progress`));
      console.log();
    } catch (err) {
      spinner.fail(chalk.red(`Failed to reach orchestrator at ${opts.endpoint}`));
      if (err instanceof Error) {
        console.error(chalk.dim(`  ${err.message}`));
      }
      process.exit(1);
    }
  });

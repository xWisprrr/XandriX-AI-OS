import { Command } from 'commander';
import chalk from 'chalk';

export const statusCommand = new Command('status')
  .description('Show the status of a task or session')
  .argument('[task-id]', 'Task ID to inspect (omit for all tasks)')
  .option('--endpoint <url>', 'Orchestrator endpoint URL', 'http://localhost:3003')
  .action(async (taskId: string | undefined, opts: { endpoint: string }) => {
    console.log();
    console.log(chalk.bold.magenta('◈ XandriX — Task Status'));
    console.log();
    try {
      const url = taskId ? `${opts.endpoint}/tasks/${taskId}` : `${opts.endpoint}/tasks`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error(chalk.red(`Error ${response.status}: ${await response.text()}`));
        process.exit(1);
      }
      const json = (await response.json()) as { data: unknown };

      if (taskId) {
        const task = json.data as Record<string, unknown>;
        console.log(chalk.bold('  ID:     ') + chalk.cyan(String(task['id'])));
        console.log(chalk.bold('  Goal:   ') + String(task['goal']));
        console.log(chalk.bold('  Status: ') + formatStatus(String(task['status'])));
        console.log(chalk.bold('  Prio:   ') + String(task['priority']));
        console.log();
      } else {
        const tasks = json.data as Array<Record<string, unknown>>;
        if (tasks.length === 0) {
          console.log(chalk.dim('  No tasks found.'));
        } else {
          tasks.forEach((t) => {
            console.log(
              `  ${chalk.cyan(String(t['id']).slice(0, 8))}…  ${formatStatus(String(t['status']))}  ${chalk.dim(String(t['goal']).slice(0, 60))}`,
            );
          });
        }
        console.log();
      }
    } catch (err) {
      console.error(chalk.red(`Could not reach orchestrator at ${opts.endpoint}`));
      if (err instanceof Error) console.error(chalk.dim(`  ${err.message}`));
      process.exit(1);
    }
  });

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    pending: chalk.yellow('pending'),
    planning: chalk.blue('planning'),
    running: chalk.green('running'),
    awaiting_approval: chalk.magenta('awaiting_approval'),
    paused: chalk.yellow('paused'),
    completed: chalk.green.bold('completed'),
    failed: chalk.red.bold('failed'),
    cancelled: chalk.dim('cancelled'),
  };
  return map[status] ?? status;
}

import { describe, it, expect } from 'vitest';
import { taskCommand } from '../commands/task.js';
import { attachCommand } from '../commands/attach.js';
import { resumeCommand } from '../commands/resume.js';
import { statusCommand } from '../commands/status.js';

describe('CLI commands', () => {
  describe('task command', () => {
    it('has name "task"', () => {
      expect(taskCommand.name()).toBe('task');
    });

    it('has a non-empty description', () => {
      expect(taskCommand.description().length).toBeGreaterThan(0);
    });

    it('has a <goal> argument', () => {
      const args = taskCommand.registeredArguments;
      expect(args.some((a) => a.name() === 'goal')).toBe(true);
    });

    it('has --priority option with default "normal"', () => {
      const opt = taskCommand.options.find((o) => o.long === '--priority');
      expect(opt).toBeDefined();
      expect(opt?.defaultValue).toBe('normal');
    });

    it('has --approval option with default "high_risk_only"', () => {
      const opt = taskCommand.options.find((o) => o.long === '--approval');
      expect(opt).toBeDefined();
      expect(opt?.defaultValue).toBe('high_risk_only');
    });

    it('has --endpoint option pointing to localhost orchestrator', () => {
      const opt = taskCommand.options.find((o) => o.long === '--endpoint');
      expect(opt).toBeDefined();
      expect(opt?.defaultValue).toContain('localhost:3003');
    });
  });

  describe('attach command', () => {
    it('has name "attach"', () => {
      expect(attachCommand.name()).toBe('attach');
    });

    it('has a non-empty description', () => {
      expect(attachCommand.description().length).toBeGreaterThan(0);
    });

    it('has --repo option', () => {
      const opt = attachCommand.options.find((o) => o.long === '--repo');
      expect(opt).toBeDefined();
    });
  });

  describe('resume command', () => {
    it('has name "resume"', () => {
      expect(resumeCommand.name()).toBe('resume');
    });

    it('has a non-empty description', () => {
      expect(resumeCommand.description().length).toBeGreaterThan(0);
    });

    it('has a <session-id> argument', () => {
      const args = resumeCommand.registeredArguments;
      expect(args.some((a) => a.name() === 'session-id')).toBe(true);
    });
  });

  describe('status command', () => {
    it('has name "status"', () => {
      expect(statusCommand.name()).toBe('status');
    });

    it('has a non-empty description', () => {
      expect(statusCommand.description().length).toBeGreaterThan(0);
    });

    it('has an optional [task-id] argument', () => {
      const args = statusCommand.registeredArguments;
      expect(args.some((a) => a.name() === 'task-id')).toBe(true);
    });

    it('has --endpoint option', () => {
      const opt = statusCommand.options.find((o) => o.long === '--endpoint');
      expect(opt).toBeDefined();
    });
  });
});

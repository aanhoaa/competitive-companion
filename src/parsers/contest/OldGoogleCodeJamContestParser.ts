import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';
import { Contest } from '../../models/Contest';
import { Task } from '../../models/Task';
import { Test } from '../../models/Test';
import { TestType } from '../../models/TestType';

export class OldGoogleCodeJamContestParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://code.google.com/codejam/contest/*/dashboard*',
      'https://codejam.withgoogle.com/codejam/contest/*/dashboard*',
    ];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const tasks: Task[] = [];

      const group = 'Google Code Jam ' + elem.querySelector('#dsb-contest-title').textContent;

      const problemCount = elem.querySelectorAll('#dsb-problem-pages > div').length;
      for (let i = 0; i < problemCount; i++) {
        const task = new TaskBuilder().setUrl(url);

        task.setName(elem.querySelector('#dsb-problem-title' + i).textContent.trim().replace('. ', ' - '));
        task.setGroup(group);

        const blocks = elem.querySelectorAll(`#dsb-problem-page${i} .problem-io-wrapper pre.io-content`);
        const input = blocks[0].textContent.trim();
        const output = blocks[1].textContent.trim();
        task.addTest(new Test(input, output));

        task.setInput({
          type: 'regex',
          pattern: task.name[0] + '-(small|large).*[.]in',
        });

        task.setOutput({
          type: 'file',
          fileName: task.name[0].toLowerCase() + '.out',
        });

        task.setTestType(TestType.MultiNumber);

        task.setTimeLimit(180000);
        task.setMemoryLimit(512);

        tasks.push(task.build());
      }

      resolve(new Contest(tasks));
    });
  }
}

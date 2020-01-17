import { cd, exec, mkdir } from 'shelljs';
import { writeFile, readFile } from 'fs';
import { info, error } from 'console';
import { healthData } from '../utils/templates/resources/health.template';
import { healthTest } from '../utils/templates/tests/health.template';
import { handleQuestion, writeFileByData, createFileInPath } from '../utils/file-utils.cli';
import { PACKAGE_JSON } from '../utils/constants-backend';

const chalk = require('chalk');

export async function newCli(args) {
  const commands = args._;
  const start = new Date();
  exec('clear');

  let nameProject;
  if (commands.length < 2) {
    nameProject = await handleQuestion('Project name?').catch(() => process.exit());
  } else {
    nameProject = commands[1];
  }
  let pathProject;
  if (args.path) {
    pathProject = args.path;
    cd(pathProject);
  } else {
    pathProject = `./${nameProject}`;
  }
  info(chalk.green(`\n----------------------------------------------------\n`));
  info(chalk.green(` Init hectorjs ...\n`));
  info(chalk.green(` -> Project name  : ${nameProject}`));
  info(chalk.green(` -> Root path     : ${pathProject}\n`));
  info(chalk.green(`- - - - - - - - - - - - - - - - - - - - - - - - - - \n`));

  mkdir(nameProject);
  cd(nameProject);

  exec('npm init -y --silent');
  exec('npm install @hectorjs/stub-backend --silent');
  exec('npm install chai mocha supertest nodemon --save-dev --silent');

  readFile(PACKAGE_JSON, 'utf8', (err, data) => {
    if (err) return error('Error while package.json was opening!');

    const startScript = `"start":"hjs start",`;
    const testScript = `\n    "test": "env KEY=local mocha --recursive --exit",`;
    const startDevScript = `\n    "start-dev": "hjs start --dev"`;
    const replacement = `${startScript}${testScript}${startDevScript}`;
    const result = data.replace('\"test\"\: \"echo \\\"Error\: no test specified\\\" \&\& exit 1\"', replacement);

    writeFile(PACKAGE_JSON, result, 'utf8', (err) => {
      if (err) return error(err);
    });
  });

  createFileInPath('health.json', 'resources');
  writeFileByData('health.json', healthData);
  cd('..');
  createFileInPath('health.test.js', 'test');
  writeFileByData('health.test.js', healthTest);
  cd('..');

  checkIDE(args['vs'], 'code');
  checkIDE(args['idea'], 'idea');

  info(chalk.green('The mock has been set successfully (run hjs start)'));
  const end = new Date() - start;
  info(chalk.grey('\nExecution time: %dms \n'), end);
}

const checkIDE = (argsCLI, shortCliIDE) => {
  if (argsCLI && argsCLI == true) {
    exec(`${shortCliIDE} .`);
  }
};


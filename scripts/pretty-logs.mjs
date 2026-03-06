import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  terminal: false,
});

rl.on('line', (line) => {
  const jsonStart = line.indexOf('{');
  if (jsonStart !== -1) {
    try {
      const prefix = line.slice(0, jsonStart);
      const parsed = JSON.parse(line.slice(jsonStart));
      process.stdout.write(
        prefix + JSON.stringify(parsed, null, 2) + '\n'
      );
      return;
    } catch {
      /* empty */
    }
  }
  process.stdout.write(line + '\n');
});

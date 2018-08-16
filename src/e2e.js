import util from 'util';
import { RpdeValidator } from './index';

const urls = [
  // 'https://activenewham-openactive.herokuapp.com/',
  // 'https://www.better.org.uk/odi/sessions.json',
  'http://google.com',
];

for (const url of urls) {
  RpdeValidator(
    url,
    (log) => {
      console.log(`[${log.verbosity}] ${log.message} (${Math.round(log.percentage)}%)`);
    },
  ).then((log) => {
    console.log(
      util.inspect(
        log,
        {
          showHidden: false,
          depth: null,
        },
      ),
    );
  });
}

import util from 'util';
import { RpdeValidator } from './index';

const urls = [
  // 'https://activenewham-openactive.herokuapp.com/',
  // 'https://www.better.org.uk/odi/sessions.json',
  // 'http://google.com',
  // 'https://online.activelifeltd.co.uk/openactive/api/sessions',
  // 'http://lr-api.staging.phoenixdigital.agency/public/v1/rides?afterTimestamp=1490517651&afterId=87988',
  // Duplicates
  // 'https://api.clubspark.uk/odi/public/courses',
  // Bad page 2
  // 'http://46.101.27.39/eventslive/api/openactive/events',
  // No items
  // 'https://playwaze.com/Webservices/Playwazeservice.svc/Groupplay/GetOpenActiveData',
  // 500 items
  // 'https://bookwhen.com/api/openactive/event_types',
  // invalid JSON
  // 'https://www.classfinder.org.uk/api/public/classes',
  // string
  // 'http://api.letsride.co.uk/public/v1/rides',
];

for (const url of urls) {
  RpdeValidator(
    url,
    {
      logCallback: (log) => {
        console.log(`[${log.verbosity}] ${log.message} (${Math.round(log.percentage)}%)`);
      },
      // requestDelayMs: 5000,
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

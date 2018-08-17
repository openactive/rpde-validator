import util from 'util';
import { RpdeValidator } from './index';

const urls = [
  // 'https://activenewham-openactive.herokuapp.com/',
  // 'https://www.better.org.uk/odi/sessions.json',
  // 'http://google.com',
  // 'https://online.activelifeltd.co.uk/openactive/api/sessions',
  // 'http://lr-api.staging.phoenixdigital.agency/public/v1/rides?afterTimestamp=1490517651&afterId=87988',
  // 'https://api.clubspark.uk/odi/public/courses',
  // 'http://46.101.27.39/eventslive/api/openactive/events',
  // 'https://playwaze.com/Webservices/Playwazeservice.svc/Groupplay/GetOpenActiveData',
  'https://bookwhen.com/api/openactive/event_types',
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

import util from 'util';
import FeedChecker from './feed-checker';

function RpdeValidator(url) {
  const loader = new FeedChecker(url);
  return loader.walk()
    .then(() => loader.log);
}

const urls = [
  'https://activenewham-openactive.herokuapp.com/',
  // 'https://www.better.org.uk/odi/sessions.json',
  // 'http://google.com',
];

for (const url of urls) {
  RpdeValidator(url).then((log) => {
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

export default RpdeValidator;

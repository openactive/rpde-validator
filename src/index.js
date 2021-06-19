import defaultRules from './rules';
import FeedChecker from './feed-checker';
import FeedPageChecker from './feed-page-checker';

function RpdeValidator(url, options) {
  const loader = new FeedChecker(url, options);
  return loader.walk()
    .then(() => loader.log);
}

export {
  defaultRules,
  RpdeValidator,
  FeedPageChecker,
};
export default RpdeValidator;

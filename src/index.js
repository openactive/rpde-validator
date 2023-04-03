import defaultRules from './rules/index.js';
import FeedChecker from './feed-checker.js';
import FeedPageChecker from './feed-page-checker.js';

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

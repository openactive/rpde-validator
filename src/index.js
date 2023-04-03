const defaultRules = require('./rules');
const FeedChecker = require('./feed-checker');
const FeedPageChecker = require('./feed-page-checker');

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

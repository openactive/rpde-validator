import defaultRules from './rules';
import FeedChecker from './feed-checker';

function RpdeValidator(url, options) {
  const loader = new FeedChecker(url, options);
  return loader.walk()
    .then(() => loader.log);
}

export {
  defaultRules,
  RpdeValidator,
};
export default RpdeValidator;

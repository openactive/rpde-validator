import FeedChecker from './feed-checker';

function RpdeValidator(url, logCallback) {
  const loader = new FeedChecker(url, logCallback);
  return loader.walk()
    .then(() => loader.log);
}

export { RpdeValidator };
export default RpdeValidator;

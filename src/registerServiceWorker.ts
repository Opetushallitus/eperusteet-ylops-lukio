import { register } from 'register-service-worker';
import { createLogger } from '@/stores/logger';

const logger = createLogger('ServiceWorker');

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      logger.log(
        'App is being served from cache by a service worker.\n'
        + 'For more details, visit https://goo.gl/AFskqB',
      );
    },
    registered() {
      logger.log('Service worker has been registered.');
    },
    cached() {
      logger.log('Content has been cached for offline use.');
    },
    updatefound() {
      logger.log('New content is downloading.');
    },
    updated() {
      logger.log('New content is available; please refresh.');
    },
    offline() {
      logger.log('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      logger.error('Error during service worker registration:', error);
    },
  });
}

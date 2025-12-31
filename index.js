import { appsOut } from './robot/index.js';
const apps = await appsOut('apps').then(req => {
  logger.info(`zhutianxiuxian start ~`);
  return req;
});
export { apps };

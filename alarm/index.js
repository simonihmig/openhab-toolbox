import OpenhabXStateMachine from '@openhab-toolbox/xstate';

export default function createAlarm(config) {
  const { service } = new OpenhabXStateMachine('openhab-alarm', config);

  service.start();

  return service;
}

import OpenhabXStateMachine from '@openhab-toolbox/xstate';
import machine from './machine';

export default function createAlarm(config) {
  const { service } = new OpenhabXStateMachine(
    'openhab-alarm',
    machine,
    config
  );

  service.start();

  return service;
}

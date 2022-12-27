import OpenhabXStateMachine from '@openhab-toolbox/xstate';
import type { InterpreterFrom } from 'xstate';
import machine from './machine';

interface OpenhabAlarmConfig {}

export default function createAlarm(
  config: OpenhabAlarmConfig
): InterpreterFrom<typeof machine> {
  const { service } = new OpenhabXStateMachine(
    'openhab-alarm',
    // @ts-ignore @todo why?
    machine,
    config
  );

  service.start();

  // @ts-ignore @todo why?
  return service;
}

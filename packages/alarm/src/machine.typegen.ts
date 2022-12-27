// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    '': { type: '' };
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions:
      | 'idle'
      | 'arming'
      | 'arming.pending'
      | 'arming.waiting'
      | 'arming.pending.disarm'
      | 'arming.pending.sensor'
      | 'armed'
      | 'alarm'
      | 'entry'
      | 'entry.waiting';
    services: never;
    guards: 'noDisarn';
    delays: never;
  };
  eventsCausingActions: {
    alarm: 'done.state.alarm.entry' | 'sensor';
    armed: 'done.state.alarm.arming';
    arming: 'arm';
    'arming.pending': 'arm';
    'arming.pending.disarm': '';
    'arming.pending.sensor': '' | 'sensor';
    'arming.waiting': 'done.state.alarm.arming.pending';
    entry: 'entry';
    'entry.waiting': 'entry';
    idle: 'disarm' | 'xstate.init';
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    hasDisarm: '';
    hasSensor: '';
    noDisarm: '';
    noDisarn: 'disarmChanged';
    noSensor: '' | 'sensorChanged';
  };
  eventsCausingDelays: {};
  matchesStates:
    | 'alarm'
    | 'armed'
    | 'arming'
    | 'arming.pending'
    | 'arming.pending.disarm'
    | 'arming.pending.disarm.blocked'
    | 'arming.pending.disarm.check'
    | 'arming.pending.disarm.ready'
    | 'arming.pending.sensor'
    | 'arming.pending.sensor.blocked'
    | 'arming.pending.sensor.check'
    | 'arming.pending.sensor.ready'
    | 'arming.ready'
    | 'arming.waiting'
    | 'entry'
    | 'entry.timeout'
    | 'entry.waiting'
    | 'entry.warning'
    | 'idle'
    | {
        arming?:
          | 'pending'
          | 'ready'
          | 'waiting'
          | {
              pending?:
                | 'disarm'
                | 'sensor'
                | {
                    disarm?: 'blocked' | 'check' | 'ready';
                    sensor?: 'blocked' | 'check' | 'ready';
                  };
            };
        entry?: 'timeout' | 'waiting' | 'warning';
      };
  tags: never;
}

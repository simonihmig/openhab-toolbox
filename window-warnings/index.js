const OpenhabXStateMachine = require('@openhab-toolbox/xstate');
const machineFactory = require('./machine');
const {
  items,
  triggers: { ItemStateChangeTrigger },
  rules: { JSRule },
} = require('openhab');

module.exports = function createWindowWarning(
  { windowContacts, temperatureItem, temperatureLimit = 16, timeFactor = 1 },
  machineConfig = {}
) {
  if (!windowContacts) {
    throw new Error('No windowContacts defined in config');
  }

  if (!temperatureItem) {
    throw new Error('No temperatureItem defined in config');
  }

  const context = {
    temperature: parseFloat(items.getItem(temperatureItem).state, 10),
  };

  const services = windowContacts.map((sensor) => {
    const machine = machineFactory(temperatureLimit, timeFactor);

    const service = new OpenhabXStateMachine(
      `openhab-window-warning-${sensor}`,
      machine,
      {
        events: {
          open: {
            items: {
              [sensor]: 'OPEN',
            },
          },
          close: {
            items: {
              [sensor]: 'CLOSED',
            },
          },
        },
        ...machineConfig,
      },
      context
    ).service;

    service.start();

    if (items.getItem(sensor).state === 'OPEN') {
      service.send('open');
    }

    return service;
  });

  JSRule({
    name: `openhab-window-warning setTemperature`,
    triggers: [ItemStateChangeTrigger(temperatureItem)],
    execute: ({ state }) => {
      // this.logger.info(`Sending "${event}" event to state machine.`);
      services.forEach((service) => {
        service.send({
          type: 'setTemperature',
          value: parseFloat(state, 10),
        });
      });
    },
  });
};

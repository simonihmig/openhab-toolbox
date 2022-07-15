const {
  triggers: { ItemStateUpdateTrigger, ItemStateChangeTrigger },
  rules: { JSRule },
  items,
  log,
} = require('openhab');
const { interpret } = require('xstate');
const { normalizeConfig, prefixCamelCased } = require('./utils');

class OpenhabXStateMachine {
  constructor(name, machine, xstateConfig, context = {}) {
    this.xstateConfig = xstateConfig;

    this.name = name;
    this.logger = log(name);
    const { events, ...machineConfig } = xstateConfig;

    this.service = interpret(
      machine
        .withConfig({
          guards: this.createGuards(events),
          ...normalizeConfig(machineConfig, this.logger),
        })
        .withContext(context)
    );

    this.service.onTransition((state) => {
      this.logger.info(`Transitioned to ${JSON.stringify(state.value)}`);
    });

    this.setupRules(events);
  }

  createGuards(events) {
    const guards = {};

    for (const [key, config] of Object.entries(events)) {
      guards[prefixCamelCased('has', key)] = this.createGuard(config.items);
      guards[prefixCamelCased('no', key)] = this.createGuard(
        config.items,
        true
      );
    }

    return guards;
  }

  createGuard(itemHash, negate = false) {
    return () => {
      const item = Object.entries(itemHash).find(
        ([itemName, state]) => items.getItem(itemName).state === state
      );
      if (item) {
        this.logger.info(
          `Aborting transition as item "${item[0]}" is in state "${item[1]}.`
        );
      }
      return negate ? !item : !!item;
    };
  }

  setupRules(events) {
    Object.entries(events).forEach(([event, config]) => {
      this.setupRule(event, config);
      this.setupRule(`${event}Changed`, config, true);
    });
  }

  setupRule(event, eventConfig, anyChange = false) {
    const itemConfig = eventConfig.items || {};
    const triggers = Object.entries(itemConfig).map(([itemName, state]) =>
      anyChange
        ? ItemStateChangeTrigger(itemName)
        : ItemStateUpdateTrigger(itemName, state)
    );

    const rule = JSRule({
      name: `${this.name} - event "${event}"`,
      triggers,
      execute: (args) => {
        this.logger.info(`Sending "${event}" event to state machine.`);
        this.service.send(event);
      },
    });
  }
}

module.exports = OpenhabXStateMachine;
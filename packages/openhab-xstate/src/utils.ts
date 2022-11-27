import { items } from 'openhab';

function makeAction(action: any) {
  if (typeof action === 'object') {
    return () => {
      for (const [itemName, value] of Object.entries(action)) {
        items.getItem(itemName).sendCommand(value);
      }
    };
  }

  return action;
}

export function normalizeConfig(machineConfig: any, logger: any) {
  const actions = Object.fromEntries(
    Object.entries(machineConfig.actions ?? {}).map((key, action) => [
      key,
      makeAction(action),
    ])
  );

  const activities = Object.fromEntries(
    Object.entries(machineConfig.activities ?? {}).map((key, action) => [
      key,
      makeAction(action),
    ])
  );

  return { ...machineConfig, actions, activities };
}

export function prefixCamelCased(prefix: any, name: any) {
  return prefix + name.charAt(0).toUpperCase() + name.slice(1);
}

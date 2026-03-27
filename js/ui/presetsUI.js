export function applyPresetToInstrument(instrument, preset) {
  const paramGroupToName = { volumes: "volume", decays: "decay" };
  Object.entries(preset).forEach(([key, value]) => {
    if (typeof value === "object") {
      const paramName = paramGroupToName[key] ?? key;
      Object.entries(value).forEach(([subKey, subValue]) => {
        instrument.setParam(`${paramName}.${subKey}`, subValue);
      });
    } else {
      instrument.setParam(key, value);
    }
  });
}

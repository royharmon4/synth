export function applyPresetToInstrument(instrument, preset) {
  Object.entries(preset).forEach(([key, value]) => {
    if (typeof value === "object") {
      Object.entries(value).forEach(([subKey, subValue]) => {
        instrument.setParam(`${key.slice(0, -1)}.${subKey}`, subValue);
      });
    } else {
      instrument.setParam(key, value);
    }
  });
}

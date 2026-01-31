// -------------------------
// 1. Localization dictionary
// -------------------------
const i18n = {
  en: {
    title: "Web Bluetooth PWA",
    connect: "Connect to Bluetooth Device",
    status_idle: "Status: Not connected",
    status_scanning: "Status: Scanning…",
    status_selected: name => `Status: Selected device ${name}`,
    status_connected: name => `Status: Connected to ${name}`,
    battery: level => `Battery: ${level}%`,
    no_battery: "Device does not support battery service",
    failed: err => `Connection failed: ${err}`
  },

  zh: {
    title: "Web 蓝牙 PWA",
    connect: "连接蓝牙设备",
    status_idle: "状态：未连接",
    status_scanning: "状态：扫描中…",
    status_selected: name => `状态：已选择设备 ${name}`,
    status_connected: name => `状态：已连接到 ${name}`,
    battery: level => `电量：${level}%`,
    no_battery: "设备不支持电量服务",
    failed: err => `连接失败：${err}`
  }
};

// -------------------------
// 2. Detect language
// -------------------------
function getLang() {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("zh")) return "zh";
  return "en";
}

const lang = getLang();
const t = i18n[lang];

// -------------------------
// 3. Apply localization
// -------------------------
document.getElementById("title").textContent = t.title;
document.getElementById("connectBtn").textContent = t.connect;
document.getElementById("status").textContent = t.status_idle;

// -------------------------
// 4. BLE logic
// -------------------------
const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const batteryEl = document.getElementById("battery");

connectBtn.onclick = async () => {
  try {
    statusEl.textContent = t.status_scanning;

    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["battery_service"]
    });

    statusEl.textContent = t.status_selected(device.name);

    const server = await device.gatt.connect();
    statusEl.textContent = t.status_connected(device.name);

    // Try reading battery level
    try {
      const service = await server.getPrimaryService("battery_service");
      const characteristic = await service.getCharacteristic("battery_level");
      const value = await characteristic.readValue();
      const battery = value.getUint8(0);
      batteryEl.textContent = t.battery(battery);
    } catch (e) {
      batteryEl.textContent = t.no_battery;
    }

  } catch (err) {
    statusEl.textContent = t.failed(err);
  }
};

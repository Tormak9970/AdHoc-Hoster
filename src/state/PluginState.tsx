// * All of your state property types go here.
export interface PublicPluginState {
  isNetworkRunning: boolean,
  networkName: string,
  networkPassword: string,
  showNotifications: boolean,
  showGameSupport: boolean,
  connectedDevices: string[]
}

// * All of your state setter types go here.
export interface PublicPluginContext extends PublicPluginState {
  setIsNetworkRunning(isRunning: boolean): void,
  setNetworkName(name: string): void,
  setNetworkPassword(password: string): void,
  setConnectedDevices(connectedDevices: string[]): void
}

// * Define your property defaults and setter logic here.
export class PluginState {
  private isNetworkRunning = false;
  private networkName = "";
  private networkPassword = "";
  private connectedDevices: string[] = [];

  public eventBus = new EventTarget();

  getPublicState() {
    return {
      "isNetworkRunning": this.isNetworkRunning,
      "networkName": this.networkName,
      "networkPassword": this.networkPassword,
      "connectedDevices": this.connectedDevices
    }
  }

  setIsNetworkRunning(isRunning: boolean): void {
    this.isNetworkRunning = isRunning;
    this.forceUpdate();
  }

  setNetworkName(name: string): void {
    this.networkName = name;
    this.forceUpdate();
  }

  setNetworkPassword(password: string): void {
    this.networkPassword = password;
    this.forceUpdate();
  }

  setConnectedDevices(devices: string[]): void {
    this.connectedDevices = devices;
    this.forceUpdate();
  }

  private forceUpdate(): void {
    this.eventBus.dispatchEvent(new Event("stateUpdate"));
  }
}

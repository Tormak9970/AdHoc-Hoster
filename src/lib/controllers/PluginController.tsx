import { PythonInterop } from "./PythonInterop";
import { SteamController } from "./SteamController";
import { LogController } from "./LogController";
import { PluginState } from "../../state/PluginState";
import { getCurrentUserId } from "../Utils";

/**
 * Main controller class for the plugin.
 */
export class PluginController {
  // * This gives you access to the plugin state from your main controller class.
  private static pluginState: PluginState;

  private static steamController: SteamController;

  private static websocket: WebSocket;

  /**
   * Sets the plugin's serverAPI and pluginState.
   * @param pluginState The pluginState instance.
   */
  static setup(pluginState: PluginState): void {
    LogController.setup("Deck P2P", "9683db");

    this.pluginState = pluginState;
    this.steamController = new SteamController();
  }

  /**
   * Sets the plugin to initialize once the user logs in.
   * @returns The unregister function for the login hook.
   */
  static initOnLogin(onMount: () => Promise<void>): Unregisterer {
    return this.steamController.registerForAuthStateChange(
      // * This function will get passed the current user's username as its first argument.
      async () => {
        if (await this.steamController.waitForServicesToInitialize()) {
          await PluginController.init();
          onMount();
        } else {
          PythonInterop.toast("Error", "Failed to initialize, try restarting.");
        }
      },
      // * This function will get passed the current user's username as its first argument.
      async () => { },
      true,
      true
    );
  }

  /**
   * Initializes the Plugin.
   */
  static async init(): Promise<void> {
    LogController.log("PluginController initialized.");
    await PythonInterop.setActiveSteamId(getCurrentUserId());

    const networkName = await PythonInterop.getNetworkName();
    if (typeof networkName !== "string") {
      // TODO: handle error
    } else {
      this.pluginState.setNetworkName(networkName);
    }

    const networkPassword = await PythonInterop.getNetworkPassword();
    if (typeof networkPassword !== "string") {
      // TODO: handle error
    } else {
      this.pluginState.setNetworkPassword(networkPassword);
    }

    PluginController.listenForNetworkUpdates();
  }

  /**
   * Listen for network updates.
   */
  private static async listenForNetworkUpdates(): Promise<void> {
    PluginController.websocket = new WebSocket("ws://localhost:9395");
    PluginController.websocket.addEventListener('message', (event: MessageEvent) => {
      const update = event.data;
      // LogController.log(update);
      console.log(event)

      // TODO: handle message here
    });

    LogController.log("Started listening on port 9395");
  }

  /**
   * Function to run when the plugin dismounts.
   */
  static dismount(): void {
    PluginController.websocket.close(0);

    LogController.log("PluginController dismounted.");
  }
}

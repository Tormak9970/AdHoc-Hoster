import { ServerAPI } from "decky-frontend-lib";
import { PythonInterop } from "./PythonInterop";
import { SteamController } from "./SteamController";
import { LogController } from "./LogController";
import { PluginState } from "../../state/PluginState";
import { getCurrentUserId } from "../Utils";

/**
 * Main controller class for the plugin.
 */
export class PluginController {
  // * This gives you access to the server api from your main controller class.
  private static server: ServerAPI;

  // * This gives you access to the plugin state from your main controller class.
  private static pluginState: PluginState;

  private static steamController: SteamController;

  private static onWakeSub: Unregisterer;

  /**
   * Sets the plugin's serverAPI.
   * @param server The serverAPI to use.
   */
  static setup(server: ServerAPI, pluginState: PluginState): void {
    LogController.setup("AdHoc-Hoster", "90f709");

    this.server = server;
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
    
    this.onWakeSub = this.steamController.registerForOnResumeFromSuspend(this.onWakeFromSleep.bind(this));
    // TODO: other subs here
  }

  static async onShutdown() {
    // ? May need this, not sure
  }

  static async onSleep() {
    // ? May need this, not sure
  }

  /**
   * Function to run when resuming from sleep.
   */
  static async onWakeFromSleep() {
    // TODO: check if the network was running before the device was put to sleep
  }

  /**
   * Function to run when the plugin dismounts.
   */
  static dismount(): void {
    // TODO: dispose of any listeners and perform other cleanup here.
    LogController.log("PluginController dismounted.");
  }
}

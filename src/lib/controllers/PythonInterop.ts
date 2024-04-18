import { ServerAPI } from "decky-frontend-lib";

/**
 * Class for frontend -> backend communication.
 */
export class PythonInterop {
  private static serverAPI: ServerAPI;

  /**
   * Sets the interop's severAPI.
   * @param serv The ServerAPI for the interop to use.
   */
  static setServer(serv: ServerAPI): void {
    this.serverAPI = serv;
  }

  /**
   * Gets the interop's serverAPI.
   */
  static get server(): ServerAPI { return this.serverAPI; }

  /**
   * Logs a message to the plugin's log file and the frontend console.
   * @param message The message to log.
   */
  static async log(message: String): Promise<void> {
    await this.serverAPI.callPluginMethod<{ message: string, level: number }, boolean>("logMessage", { message: `[front-end]: ${message}`, level: 0 });
  }

  /**
   * Logs a warning to the plugin's log file and the frontend console.
   * @param message The message to log.
   */
  static async warn(message: string): Promise<void> {
    await this.serverAPI.callPluginMethod<{ message: string, level: number }, boolean>("logMessage", { message: `[front-end]: ${message}`, level: 1 });
  }

  /**
   * Logs an error to the plugin's log file and the frontend console.
   * @param message The message to log.
   */
  static async error(message: string): Promise<void> {
    await this.serverAPI.callPluginMethod<{ message: string, level: number }, boolean>("logMessage", { message: `[front-end]: ${message}`, level: 2 });
  }
  
  
  /**
   * Gets the plugin's users dictionary.
   * @returns A promise resolving to the plugin's users dictionary.
   */
  static async getUsersDict(): Promise<UsersDict | Error> {
    const result = await this.serverAPI.callPluginMethod<{}, UsersDict>("get_users_dict", {});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }
  
  /**
   * Sends the active user's steamID to the backend.
   * @returns A promise resolving to the plugin's users dictionary.
   */
  static async setActiveSteamId(userId: string): Promise<boolean | Error> {
    const result = await this.serverAPI.callPluginMethod<{ user_id: string }, boolean>("set_active_user_id", { user_id: userId});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }

  
  /**
   * Gets the user's network name from the plugin settings.
   * @returns The network name, or an error if it failed
   */
  static async getNetworkName(): Promise<string | Error> {
    const result = await this.serverAPI.callPluginMethod<{}, string>("get_network_name", {});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }
  
  /**
   * Gets the user's network password from the plugin settings.
   * @returns The network password, or an error if it failed
   */
  static async getNetworkPassword(): Promise<string | Error> {
    const result = await this.serverAPI.callPluginMethod<{}, string>("get_network_password", {});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }
  
  /**
   * Gets whether the user wants to show notifications.
   * @returns Whether the user wants to show notifications, or an error if it failed
   */
  static async getShowNotifications(): Promise<boolean | Error> {
    const result = await this.serverAPI.callPluginMethod<{}, boolean>("get_show_notifications", {});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }
  
  /**
   * Gets whether the user wants to show game support.
   * @returns Whether the user wants to show notifications, or an error if it game support.
   */
  static async getShowGameSupport(): Promise<boolean | Error> {
    const result = await this.serverAPI.callPluginMethod<{}, boolean>("get_show_game_support", {});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }


  /**
   * Sets the user's network name.
   * @param networkName The user's network name.
   * @returns A promise resolving to whether or not the network name was successfully set.
   */
  static async setNetworkName(networkName: string): Promise<boolean | Error> {
    let result = await PythonInterop.serverAPI.callPluginMethod<{ net_name: string, }, boolean>("set_network_name", { net_name: networkName });

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    };
  }

  /**
   * Sets the user's network password.
   * @param networkPassword The user's network password.
   * @returns A promise resolving to whether or not the network password was successfully set.
   */
  static async setNetworkPassword(networkPassword: string): Promise<boolean | Error> {
    let result = await PythonInterop.serverAPI.callPluginMethod<{ net_password: string, }, boolean>("set_network_password", { net_password: networkPassword });

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    };
  }

  /**
   * Sets the whether the user wants to show notifications
   * @param shouldShow Whether the user wants to show notifications.
   * @returns A promise resolving to whether or not the setting was successfully set.
   */
  static async setShowNotifications(shouldShow: boolean): Promise<boolean | Error> {
    let result = await PythonInterop.serverAPI.callPluginMethod<{ should_show: boolean, }, boolean>("set_show_notifications", { should_show: shouldShow });

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    };
  }

  /**
   * Sets the whether the user wants to show game support
   * @param shouldShow Whether the user wants to show game support.
   * @returns A promise resolving to whether or not the setting was successfully set.
   */
  static async setShowGameSupport(shouldShow: boolean): Promise<boolean | Error> {
    let result = await PythonInterop.serverAPI.callPluginMethod<{ should_show: boolean, }, boolean>("set_show_game_support", { should_show: shouldShow });

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    };
  }


  /**
   * Starts the AdHoc network.
   * @returns Whether the network was successfully started, or an error if the interop request failed.
   */
  static async startNetwork(): Promise<boolean | Error> {
    const result = await this.serverAPI.callPluginMethod<{}, boolean>("start_network", {});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }

  /**
   * Kills the AdHoc network.
   * @returns Whether the network was successfully killed, or an error if the interop request failed.
   */
  static async killNetwork(): Promise<boolean | Error> {
    const result = await this.serverAPI.callPluginMethod<{}, boolean>("kill_network", {});

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    }
  }


  /**
   * Shows a toast message.
   * @param title The title of the toast.
   * @param message The message of the toast.
   */
  static toast(title: string, message: string): void {
    return (() => {
      try {
        return this.serverAPI.toaster.toast({
          title: title,
          body: message,
          duration: 8000,
        });
      } catch (e) {
        console.log("Toaster Error", e);
      }
    })();
  }
}

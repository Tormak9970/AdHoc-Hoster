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
   * Sets the user's network name.
   * @param networkName The user's network name.
   * @returns A promise resolving to whether or not the network name was successfully set.
   */
  static async setNetworkName(networkName: string): Promise<void | Error> {
    let result = await PythonInterop.serverAPI.callPluginMethod<{ network_name: string, }, void>("set_network_name", { network_name: networkName });

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
  static async setNetworkPassword(networkPassword: string): Promise<void | Error> {
    let result = await PythonInterop.serverAPI.callPluginMethod<{ network_password: string, }, void>("set_network_password", { network_password: networkPassword });

    if (result.success) {
      return result.result;
    } else {
      return new Error(result.result);
    };
  }


  static async startNetwork(): Promise<boolean> {
    return false
  }

  static async killNetwork(): Promise<boolean> {
    return false
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

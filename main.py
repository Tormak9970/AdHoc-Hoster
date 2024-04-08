import asyncio
import os
import codecs
import decky_plugin
from settings import SettingsManager
from typing import TypeVar


Initialized = False
T = TypeVar("T")


def log(txt):
  decky_plugin.logger.info(txt)

def warn(txt):
  decky_plugin.logger.warn(txt)

def error(txt):
  decky_plugin.logger.error(txt)


def obfuscate(value: str) -> str:
  return codecs.encode(value, "rot13")

def deobfuscate(obfuscated: str) -> str:
  return codecs.decode(obfuscated, "rot13")

class Plugin:
  user_id: str = None
  users_dict: dict[str, dict] = None

  network_name: str = None
  network_password: str = None

  settings: SettingsManager

  async def logMessage(self, message, level):
    if level == 0:
      log(message)
    elif level == 1:
      warn(message)
    elif level == 2:
      error(message)

  async def start_network(self) -> bool:
    return False
  
  async def kill_network(self) -> bool:
    return False

  # * Plugin settings getters
  async def get_users_dict(self) -> dict[str, dict] | None:
    """
    Waits until users_dict is loaded, then returns users_dict

    @returns The users dictionary
    """
    while Plugin.users_dict is None:
      await asyncio.sleep(0.1)
      
    return Plugin.users_dict
  
  async def get_network_name(self) -> str | None:
    """
    Waits until the users dictionary is loaded, then returns the user's network name

    @return: The network name
    """
    while Plugin.users_dict is None:
      await asyncio.sleep(0.1)
    
    Plugin.network_name = Plugin.users_dict[Plugin.user_id]["networkName"]
    
    return Plugin.network_name or ""
  
  async def get_network_password(self) -> str | None:
    """
    Waits until the users dictionary is loaded, then returns the user's network password

    @return: The network password
    """
    while Plugin.users_dict is None:
      await asyncio.sleep(0.1)
    
    Plugin.network_password = deobfuscate(Plugin.users_dict[Plugin.user_id]["networkPassword"])
    
    return Plugin.network_password or ""

  # * Plugin settings setters
  async def set_active_user_id(self, user_id: str):
    """
    Sets the active user id

    @param user_id (str): The user's id
    """

    log(f"active user id: {user_id}")
    Plugin.user_id = user_id
    
    while Plugin.users_dict is None:
      await asyncio.sleep(0.1)

    if not user_id in Plugin.users_dict.keys():
      log(f"User {user_id} had no settings.")

      Plugin.users_dict[user_id] = {
        "networkName": "",
        "networkPassword": ""
      }
      await Plugin.set_setting(self, "usersDict", Plugin.users_dict)

  async def set_network_name(self, net_name: str):
    """
    Sets the user's network name

    @param net_name (str): The user's network name
    """

    Plugin.network_name = net_name
    Plugin.users_dict[Plugin.user_id]["networkName"] = net_name
    await Plugin.set_setting(self, "usersDict", Plugin.users_dict)

  async def set_network_password(self, net_password: str):
    """
    Sets the user's network password

    @param net_password (str): The user's network password
    """

    Plugin.network_password = net_password
    Plugin.users_dict[Plugin.user_id]["networkName"] = obfuscate(net_password)
    await Plugin.set_setting(self, "usersDict", Plugin.users_dict)


  async def read(self) -> None:
    """
    Reads the json from disk
    """
    Plugin.settings.read()
    Plugin.users_dict = await Plugin.get_setting(self, "usersDict", {})


  # * Plugin settingsManager wrappers
  async def get_setting(self, key, default: T) -> T:
    """
    Gets the specified setting from the json

    @param key: The key to get
    @param default: The default value
    @return: The value, or default if not found
    """
    return Plugin.settings.getSetting(key, default)

  async def set_setting(self, key, value: T) -> T:
    """
    Sets the specified setting in the json

    @param key: The key to set
    @param value: The value to set it to
    @return: The new value
    """
    Plugin.settings.setSetting(key, value)
    return value
  
  def del_setting(self, key) -> None:
    """
    Deletes the specified setting in the json
    """
    del Plugin.settings.settings[key]
    Plugin.settings.commit()
    pass


  # * Asyncio-compatible long-running code, executed in a task when the plugin is loaded
  async def _main(self):
    global Initialized

    if Initialized:
      return

    Initialized = True

    Plugin.settings = SettingsManager(name="settings", settings_directory=os.environ["DECKY_PLUGIN_SETTINGS_DIR"])
    await Plugin.read(self)

    log("Initializing AdHoc Hoster.")


  # * Function called first during the unload process, utilize this to handle your plugin being removed
  async def _unload(self):
    decky_plugin.logger.info("Unloading AdHoc Hoster.")


  # * Migrations that should be performed before entering `_main()`.
  async def _migration(self):
    pass

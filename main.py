import asyncio
import subprocess
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
  network_updates: list[str] = [] # * Will function like a stack
  should_monitor: bool = False

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


  async def monitor_network_updates(self):
    wait_time = 0.5 # TODO: find a good time balance
    monitored_process = None

    while True:
      await asyncio.sleep(wait_time)

      if Plugin.should_monitor:
        # * start monitoring if needed
        if monitored_process is None:
          monitored_process = subprocess.Popen(["nmcli", "connection", "monitor", Plugin.network_name], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
          log(f"Started monitoring {Plugin.network_name}")
        else:
          try:
            update, err = monitored_process.communicate()
            if update != "":
              Plugin.network_updates.append(update)
              log(f"Recieved network update {update}")
          except subprocess.TimeoutExpired:
            continue
      else:
        monitored_process = None
        Plugin.network_updates = []
        log(f"Stopped monitoring {Plugin.network_name}")

  def connection_exists() -> bool:
    result = subprocess.run([f"sudo nmcli connection show \"{Plugin.network_name}\""], timeout=10, shell=True, capture_output=True, text=True)

    return not "no connection" in result.stdout
  
  def create_adhoc_hoster_connection() -> bool:
    # TODO: if ip address needed, add
    # ipv4.method manual ipv4.address DECK_IP_v4/24 ipv4.dns 8.8.8.8 ipv6.method ignore
    # ? or
    # ipv4.method manual ipv4.address DECK_IP_v4/24 ipv6.method ignore
    # ? or
    # ipv4.method shared ipv6.method ignore

    # may need wifi.band a

    result = subprocess.run([f"sudo nmcli connection add type wifi ifname wlan0 ssid \"{Plugin.network_name}\" password \"{Plugin.network_password}\" wifi.type Home wifi.mode adhoc connection.autoconnect no"], timeout=10, shell=True, capture_output=True, text=True)

    # TODO: figure out if the command succeeded

    return False


  async def get_next_network_update(self) -> str:
    """
    Waits until there is a network update available, then returns it

    @returns The network update
    """
    while Plugin.network_updates.count() == 0:
      await asyncio.sleep(0.1)
      
    update = list.pop(0)
    log(f"Sending update {update}")
    return update

  async def start_network(self) -> bool:
    success = False
    # result = subprocess.run([f"sudo nmcli dev wifi hotspot con-name \"{Plugin.network_name}\" password \"{Plugin.network_password}\""], timeout=10, shell=True, capture_output=True, text=True)
    
    if not Plugin.connection_exists():
      Plugin.create_adhoc_hoster_connection()
    
    result = subprocess.run([f"sudo nmcli connection up \"{Plugin.network_name}\""], timeout=10, shell=True, capture_output=True, text=True)
    
    log(result.stdout)

    if result.returncode == 0:
      success = True
      Plugin.should_monitor = True

    return success
  
  async def kill_network(self) -> bool:
    success = False
    # result_off = subprocess.run([f"sudo nmcli r wifi off"], timeout=10, shell=True, capture_output=True, text=True)
    # result_on = subprocess.run([f"sudo nmcli r wifi on"], timeout=10, shell=True, capture_output=True, text=True)

    # if result_off.returncode == 0 and result_on.returncode == 0:
    #   success = True
    #   Plugin.should_monitor = False
    
    result = subprocess.run([f"sudo nmcli connection down \"{Plugin.network_name}\""], timeout=10, shell=True, capture_output=True, text=True)
    
    log(result.stdout)

    if result.returncode == 0:
      success = True
      Plugin.should_monitor = False

    return success


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
  async def set_active_user_id(self, user_id: str) -> bool:
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

    return True

  async def set_network_name(self, net_name: str) -> bool:
    """
    Sets the user's network name

    @param net_name (str): The user's network name
    """

    result = None
    should_skip = False

    if Plugin.connection_exists():
      result = subprocess.run([f"sudo nmcli connection modify \"{Plugin.network_name}\" con-name \"{net_name}\""], timeout=10, shell=True, capture_output=True, text=True)
    else:
      should_skip = True
    
    if should_skip or result.returncode == 0:
      Plugin.network_name = net_name
      Plugin.users_dict[Plugin.user_id]["networkName"] = net_name
      await Plugin.set_setting(self, "usersDict", Plugin.users_dict)
      return True
    else:
      error("Failed to update connection name!")
      return False

  async def set_network_password(self, net_password: str) -> bool:
    """
    Sets the user's network password

    @param net_password (str): The user's network password
    """

    result = None
    should_skip = False

    if Plugin.connection_exists():
      result = subprocess.run([f"sudo nmcli connection modify \"{Plugin.network_name}\" password \"{net_password}\""], timeout=10, shell=True, capture_output=True, text=True)
    else:
      should_skip = True
    
    if should_skip or result.returncode == 0:
      Plugin.network_password = net_password
      Plugin.users_dict[Plugin.user_id]["networkPassword"] = obfuscate(net_password)
      await Plugin.set_setting(self, "usersDict", Plugin.users_dict)
      return True
    else:
      error("Failed to update connection password!")
      return False


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

    log("Initialized AdHoc Hoster.")

    await Plugin.monitor_network_updates(self)


  # * Function called first during the unload process, utilize this to handle your plugin being removed
  async def _unload(self):
    decky_plugin.logger.info("Unloading AdHoc Hoster.")


  # * Migrations that should be performed before entering `_main()`.
  async def _migration(self):
    pass

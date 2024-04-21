import asyncio
import subprocess
import os
import codecs
import sys
import decky_plugin
from settings import SettingsManager
from typing import TypeVar

sys.path.append(os.path.dirname(__file__))

from websocket_manager import WebsocketManager

Initialized = False
T = TypeVar("T")

# * Utility functions
def log(txt):
  decky_plugin.logger.info(txt)
  
def error(txt):
  decky_plugin.logger.error(txt)

def obfuscate(value: str) -> str:
  return codecs.encode(value, "rot13")

def deobfuscate(obfuscated: str) -> str:
  return codecs.decode(obfuscated, "rot13")

def init_pacman_key() -> bool:
  result = subprocess.run([f"sudo pacman-key --init"], timeout=10, shell=True, capture_output=True, text=True)
  return result.returncode == 0


# * FS overlay functions
def mount_overlays() -> bool:
  if not os.path.exists(os.path.join(decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, "rwfus")):
    clone_result = subprocess.run([f"sudo git clone https://github.com/ValShaped/rwfus.git"], cwd=decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, timeout=10, shell=True, capture_output=True, text=True)

    if clone_result.returncode != 0:
      error(f"Failed to clone rwfus")
      log(clone_result.stderr)
      return False

  install_result = subprocess.run([f"sudo ./rwfus/rwfus -iI"], cwd=decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, timeout=30, shell=True, capture_output=True, text=True)
    
  if install_result.returncode != 0:
    error(f"Failed to install rwfus")
    log(install_result.stderr)
    return False
  else:
    log(f"Mounted overlays using rwfus.")

  return True

def rwfus_exists() -> bool:
  return os.path.exists("/opt/rwfus")

def unmount_overlays() -> bool:
  uninstall_result = subprocess.run([f"( echo y ; echo y ) | sudo ./rwfus/rwfus -rR"], cwd=decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, timeout=30, shell=True, capture_output=True, text=True)
    
  if uninstall_result.returncode != 0:
    error(f"Failed to uninstall rwfus")
    log(uninstall_result.stderr)
    return False
  else:
    log(f"Uninstalled rwfus.")
    rm_result = subprocess.run([f"sudo rm -r ./rwfus"], cwd=decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, timeout=10, shell=True, capture_output=True, text=True)
    
    if rm_result.returncode != 0:
      error(f"Failed to remove ./rwfus")
      log(rm_result.stderr)
      return False

  return True


# * dnsmasq functions
def install_dnsmasq() -> bool:
  result = subprocess.run([f"( echo y ) | sudo pacman -Sy dnsmasq"], timeout=10, shell=True, capture_output=True, text=True)
  cp_result = subprocess.run([f"sudo cp ./dnsmasq.conf /etc/dnsmasq.conf"], cwd=decky_plugin.DECKY_PLUGIN_DIR, timeout=10, shell=True, capture_output=True, text=True)

  return result.returncode == 0 and cp_result.returncode == 0

def dnsmasq_exists() -> bool:
  result = subprocess.run([f"sudo pacman -Q dnsmasq"], timeout=10, shell=True, capture_output=True, text=True)
  return result.returncode == 0

def uninstall_dnsmasq() -> bool:
  result = subprocess.run([f"( echo y ) | sudo pacman -Rc dnsmasq"], timeout=10, shell=True, capture_output=True, text=True)
  return result.returncode == 0


class Plugin:
  websocket_manager: WebsocketManager = None
  settings: SettingsManager

  user_id: str = None
  users_dict: dict[str, dict] = None

  network_updates: list[str] = [] # * Will function like a stack
  should_monitor: bool = False

  network_name: str = None
  network_password: str = None
  start_on_wake: bool = None

  rwfus_existed_before_install: bool = False


  # * Logger
  async def logMessage(self, message, level):
    if level == 0:
      log(message)
    elif level == 1:
      decky_plugin.logger.warn(message)
    elif level == 2:
      error(message)


  # * Connection functions
  def create_connection() -> bool:
    result = subprocess.run([f"sudo nmcli connection add type wifi ifname wlan0 ssid \"{Plugin.network_name}\" con-name \"{Plugin.network_name}\" wifi-sec.key-mgmt wpa-psk wifi-sec.psk \"{Plugin.network_password}\" wifi.mode ap connection.autoconnect no ipv4.method shared ipv6.method ignore"], timeout=10, shell=True, capture_output=True, text=True)
    return result.returncode == 0

  def connection_exists() -> bool:
    result = subprocess.run([f"sudo nmcli -f connection.id connection show \"{Plugin.network_name}\""], timeout=10, shell=True, capture_output=True, text=True)
    return result.returncode == 0
  
  def delete_connection() -> bool:
    result = subprocess.run([f"sudo nmcli connection delete \"{Plugin.network_name}\""], timeout=10, shell=True, capture_output=True, text=True)
    return result.returncode == 0


  # * network functions
  async def start_network(self) -> bool:
    success = False
    
    if not Plugin.connection_exists():
      Plugin.create_connection()

    down_result = subprocess.run([f"sudo nmcli device down wlan0"], timeout=10, shell=True, capture_output=True, text=True)
    result = subprocess.run([f"sudo nmcli connection up \"{Plugin.network_name}\" ifname wlan0"], timeout=10, shell=True, capture_output=True, text=True)
    log(result.stdout)

    if down_result.returncode == 0 and result.returncode == 0:
      success = True
      Plugin.websocket_manager.start()

    return success
  
  async def kill_network(self) -> bool:
    success = False

    result = subprocess.run([f"sudo nmcli connection down \"{Plugin.network_name}\""], timeout=10, shell=True, capture_output=True, text=True)
    log(result.stdout)

    if result.returncode == 0:
      success = True
      Plugin.websocket_manager.kill()

    return success


  # * Plugin settings and getters
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
  
  async def get_show_notifications(self) -> bool | None:
    """
    Waits until the users dictionary is loaded, then returns the whether the user wants to show notifications

    @return: Whether the user wants to show notifications
    """
    while Plugin.users_dict is None:
      await asyncio.sleep(0.1)
    
    return Plugin.users_dict[Plugin.user_id]["showNotifications"] or True
  
  async def get_show_game_support(self) -> bool | None:
    """
    Waits until the users dictionary is loaded, then returns the whether the user wants to show game support

    @return: Whether the user wants to show game support
    """
    while Plugin.users_dict is None:
      await asyncio.sleep(0.1)
    
    return Plugin.users_dict[Plugin.user_id]["showGameSupport"] or True
  
  async def get_game_support_position(self) -> str | None:
    """
    Waits until the users dictionary is loaded, then returns the game support icon's position

    @return: The game support icon's position
    """
    while Plugin.users_dict is None:
      await asyncio.sleep(0.1)
    
    return Plugin.users_dict[Plugin.user_id]["gameSupportPosition"] or "topRight"


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
        "networkPassword": "",
        "showNotifications": True,
        "showGameSupport": True,
        "gameSupportPosition": "topRight"
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
      
      Plugin.logMessage(self, "Failed to update connection name!", 2)
      return False

  async def set_network_password(self, net_password: str) -> bool:
    """
    Sets the user's network password

    @param net_password (str): The user's network password
    """

    result = None
    should_skip = False

    if Plugin.connection_exists():
      result = subprocess.run([f"sudo nmcli connection modify \"{Plugin.network_name}\" wifi-sec.psk \"{net_password}\""], timeout=10, shell=True, capture_output=True, text=True)
    else:
      should_skip = True
    
    if should_skip or result.returncode == 0:
      Plugin.network_password = net_password
      Plugin.users_dict[Plugin.user_id]["networkPassword"] = obfuscate(net_password)
      await Plugin.set_setting(self, "usersDict", Plugin.users_dict)
      return True
    else:
      Plugin.logMessage(self, "Failed to update connection password!", 2)
      return False
    
  async def set_show_notifications(self, should_show: bool) -> bool:
    """
    Sets the whether the user wants to show notifications

    @param should_show (bool): Whether the user wants to show notifications
    """

    Plugin.users_dict[Plugin.user_id]["showNotifications"] = should_show
    await Plugin.set_setting(self, "usersDict", Plugin.users_dict)
    return True
  
  async def set_show_game_support(self, should_show: bool) -> bool:
    """
    Sets the whether the user wants to show game support

    @param should_show (bool): Whether the user wants to show game support
    """

    Plugin.users_dict[Plugin.user_id]["showGameSupport"] = should_show
    await Plugin.set_setting(self, "usersDict", Plugin.users_dict)
    return True

  async def set_game_support_position(self, position: str) -> bool:
    """
    Sets the game support icon's position

    @param position (str): The game support icon position
    """

    Plugin.users_dict[Plugin.user_id]["gameSupportPosition"] = position
    await Plugin.set_setting(self, "usersDict", Plugin.users_dict)
    return True

  async def read(self) -> None:
    """
    Reads the json from disk
    """
    Plugin.settings.read()
    Plugin.users_dict = await Plugin.get_setting(self, "usersDict", {})

    existed = await Plugin.get_setting(self, "rwfusExistedBeforeInstall", None)

    if existed is None:
      if rwfus_exists():
        Plugin.rwfus_existed_before_install = True
        await Plugin.set_setting(self, "rwfusExistedBeforeInstall", True)
      else:
        await Plugin.set_setting(self, "rwfusExistedBeforeInstall", False)


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

    PORT = 9395
    Plugin.websocket_manager = WebsocketManager(PORT)
    Plugin.settings = SettingsManager(name="settings", settings_directory=os.environ["DECKY_PLUGIN_SETTINGS_DIR"])
    await Plugin.read(self)

    log("Initialized Deck P2P.")

    if not rwfus_exists():
      Plugin.rwfus_existed_before_install = False
      await Plugin.set_setting(self, "rwfusExistedBeforeInstall", False)

      if mount_overlays():
        log("Mounted OverlayFS via rwfus.")
      else:
        error("Failed to mount OverlayFS via rwfus")

    if init_pacman_key():
      log("Initialized pacman keyring.")
    else:
      Plugin.logMessage(self, "Failed to initialize pacman keyring")

    if not dnsmasq_exists():
      if install_dnsmasq():
        log("Installed dnsmasq.")
    else:
      log("dnsmasq already installed.")


  # * Function called first during the unload process, utilize this to handle your plugin being removed
  async def _unload(self):
    log("Unloading Deck P2P.")

  # * Function called when the plugin is uninstalled
  async def _uninstall(self):
    if Plugin.delete_connection():
      log("Successfully removed nmcli connection.")
    else:
      Plugin.logMessage(self, "Failed to remove nmcli connection.", 2)

    if uninstall_dnsmasq():
      log("Successfully removed dnsmasq.")
    else:
      Plugin.logMessage(self, "Failed to remove dnsmasq.", 2)

    if not Plugin.rwfus_existed_before_install:
      if unmount_overlays():
        log("Successfully unmounted overlay.")
      else:
        Plugin.logMessage(self, "Failed to unmount overlay.", 2)
    else:
      log("rwfus already exists")
      
    log("Uninstalling Deck P2P.")

  # * Migrations that should be performed before entering `_main()`.
  async def _migration(self):
    pass

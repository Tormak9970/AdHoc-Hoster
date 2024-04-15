import asyncio
import subprocess
import os
import codecs
import decky_plugin
from shutil import rmtree
from settings import SettingsManager
from typing import TypeVar


Initialized = False
T = TypeVar("T")
BASE_OVERLAY_NAME = "adhoc-hoster-overlay"
base_dir = "~/adhoc-hoster/"
lower_dirs = [ "lib/holo/pacmandb", "lib64/holo/pacmandb", "usr", "etc", "var/cache/pacman", "var/lib/pacman" ] #, "etc/pacman.d"
base_upper_dir = base_dir + "upper"
base_work_dir = base_dir + "work"
base_merged_dir = base_dir + "merged"

# * Utility functions
def log(txt):
  decky_plugin.logger.info(txt)

def obfuscate(value: str) -> str:
  return codecs.encode(value, "rot13")

def deobfuscate(obfuscated: str) -> str:
  return codecs.decode(obfuscated, "rot13")

def init_pacman_key() -> bool:
  result = subprocess.run([f"sudo pacman-key --init"], timeout=10, shell=True, capture_output=True, text=True)
  return result.returncode == 0

# * FS overlay functions
def mount_overlays() -> bool:
  success = True

  for lower_dir in lower_dirs:
    transformed = lower_dir.replace("/", "-")
    overlay_name = BASE_OVERLAY_NAME + "-" + transformed
    upper_dir = base_upper_dir + "/" + transformed
    work_dir = base_work_dir + "/" + transformed
    merged_dir = base_merged_dir + "/" + transformed

    if not os.path.exists(upper_dir):
      os.makedirs(upper_dir)

    if not os.path.exists(work_dir):
      os.makedirs(work_dir)

    if not os.path.exists(merged_dir):
      os.makedirs(merged_dir)

    result = subprocess.run([f"sudo mount -t overlay {overlay_name} noauto,x-systemd.automount -o lowerdir=/{lower_dir}, upperdir={upper_dir}, workdir={work_dir} {merged_dir}"], timeout=10, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0:
      success = False
      break

  return success

def mounts_exist() -> bool:
  success = True

  for lower_dir in lower_dirs:
    transformed = lower_dir.replace("/", "-")
    overlay_name = BASE_OVERLAY_NAME + "-" + transformed

    result = subprocess.run([f"sudo mountpoint {overlay_name}"], timeout=10, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0:
      success = False
      break

  return success

def unmount_overlays() -> bool:
  success = True

  for lower_dir in lower_dirs:
    transformed = lower_dir.replace("/", "-")
    overlay_name = BASE_OVERLAY_NAME + "-" + transformed
    upper_dir = base_upper_dir + "/" + transformed
    work_dir = base_work_dir + "/" + transformed
    merged_dir = base_merged_dir + "/" + transformed

    if os.path.exists(upper_dir):
      rmtree(upper_dir)

    if os.path.exists(work_dir):
      rmtree(work_dir)

    if os.path.exists(merged_dir):
      rmtree(merged_dir)

    result = subprocess.run([f"sudo unmount {overlay_name}"], timeout=10, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0:
      success = False
      break

  return success


# * dnsmasq functions
def install_dnsmasq() -> bool:
  return False

def dnsmasq_exists() -> bool:
  # * dnsmasq
  result = subprocess.run([f"sudo pacman -Q dnsmasq"], timeout=10, shell=True, capture_output=True, text=True)
  return result.returncode == 0

def uninstall_dnsmasq() -> bool:
  return False


class Plugin:
  settings: SettingsManager

  user_id: str = None
  users_dict: dict[str, dict] = None

  network_updates: list[str] = [] # * Will function like a stack
  should_monitor: bool = False

  network_name: str = None
  network_password: str = None

  # * Logger
  async def logMessage(self, message, level):
    if level == 0:
      log(message)
    elif level == 1:
      decky_plugin.logger.warn(message)
    elif level == 2:
      decky_plugin.logger.error(message)

  
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
  async def monitor_network_updates(self):
    wait_time = 0.5 # TODO: find a good time balance
    monitored_process = None

    while True:
      await asyncio.sleep(wait_time)

      if Plugin.should_monitor:
        # * start monitoring if needed
        if monitored_process is None:
          monitored_process = subprocess.Popen(["sudo", "nmcli", "connection", "monitor", Plugin.network_name], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
          log(f"Started monitoring {Plugin.network_name}")
        else:
          try:
            update, err = monitored_process.communicate()
            if update != "":
              Plugin.network_updates.append(update)
              log(f"Recieved network update {update}")
          except subprocess.TimeoutExpired:
            continue
      elif monitored_process is not None:
        monitored_process = None
        Plugin.network_updates = []
        log(f"Stopped monitoring {Plugin.network_name}")
  
  async def get_next_network_update(self) -> str:
    """
    Waits until there is a network update available, then returns it

    @returns The network update
    """
    while len(Plugin.network_updates) == 0:
      await asyncio.sleep(0.1)
      
    update = list.pop(0)
    log(f"Sending update {update}")
    return update

  async def start_network(self) -> bool:
    success = False
    
    if not Plugin.connection_exists():
      Plugin.create_connection()

    down_result = subprocess.run([f"sudo nmcli device down wlan0"], timeout=10, shell=True, capture_output=True, text=True)
    
    log(down_result.stdout)
    log(down_result.stderr)

    result = subprocess.run([f"sudo nmcli connection up \"{Plugin.network_name}\" ifname wlan0"], timeout=10, shell=True, capture_output=True, text=True)
    
    log(result.stdout)
    log(result.stderr)

    if down_result.returncode == 0 and result.returncode == 0:
      success = True
      Plugin.should_monitor = True

    return success
  
  async def kill_network(self) -> bool:
    success = False
    # * This method may work
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

    if not mounts_exist():
      mount_overlays()
      log("Mounted OverlayFS.")
    else:
      log("OverlayFS already mounted.")

    if init_pacman_key():
      log("Initialized pacman keyring.")
    else:
      Plugin.logMessage(self, "Failed to initialize pacman keyring")

    if not dnsmasq_exists():
      install_dnsmasq()
      log("Installed dnsmasq.")
    else:
      log("dnsmasq already installed.")

    await Plugin.monitor_network_updates(self)


  # * Function called first during the unload process, utilize this to handle your plugin being removed
  async def _unload(self):
    if Plugin.delete_connection():
      log("Successfully removed nmcli connection.")
    else:
      Plugin.logMessage(self, "Failed to remove nmcli connection.", 2)

    if uninstall_dnsmasq():
      log("Successfully removed dnsmasq.")
    else:
      Plugin.logMessage(self, "Failed to remove dnsmasq.", 2)

    if unmount_overlays():
      log("Successfully unmounted overlay.")
    else:
      Plugin.logMessage(self, "Failed to unmount overlay.", 2)
      
    log("Unloading AdHoc Hoster.")


  # * Migrations that should be performed before entering `_main()`.
  async def _migration(self):
    pass

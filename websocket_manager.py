import time
from websocket_server import WebsocketServer
from threading import Thread
import traceback
import subprocess

import decky_plugin

def log_server(txt):
  decky_plugin.logger.info("[SERVER]: " + txt)
  
def error_server(txt):
  decky_plugin.logger.error("[SERVER]: " + txt)


def new_client(client, server, clients):
  clients[client["id"]] = client
  server.send_message_to_all("New Client joined")

def client_left(client, server, clients):
  cid = client["id"]
  try:
    del clients[cid]
  except Exception:
    pass

def message_received(client, server, message):
  if len(message) > 200:
    message = message[:200]+'..'
    
  log_server(f"Client {client['id']} sent: {message}")

def send_message(server, clients, message):
  log_server(f"clients: {len(clients)}")

  try:
    for client in clients.values():
      log_server("sending")
      server.send_message(client, message)
      log_server("sent")
  except Exception:
    log_server(traceback.format_exc)


def monitor_network(server, clients, should_monitor):
  wait_time = 1.0 # TODO: find a good time balance

  last_message = None

  while True:
    time.sleep(wait_time)

    # if should_monitor:
    #   message = ""
    #   log_server("running monitor...")
    #   out = subprocess.run(["./getConnectedDevices.sh"], cwd=decky_plugin.DECKY_PLUGIN_DIR, timeout=10, shell=True, capture_output=True, text=True)

    #   # TODO: figure out how to detect when a device connects
    #   # for line in enumerate(out, start=1):
    #   #   ip = line.split(' ')[0]
    #   #   message = message + ip
    #   log_server(out)
    # else:
    #   break
    message = ""
    log_server("running monitor...")
    out = subprocess.run(["./getConnectedDevices.sh"], cwd=decky_plugin.DECKY_PLUGIN_DIR, timeout=10, shell=True, capture_output=True, text=True)
    log_server(out)

    # if should_monitor and message != last_message:
    #   last_message = message
    #   send_message(server, clients, message)


def ws_server(server, clients):
  server.set_fn_new_client(lambda x, y: new_client(x, y, clients))
  server.set_fn_client_left(lambda x, y: client_left(x, y, clients))
  server.set_fn_message_received(message_received)
  log_server("ws online")
  server.run_forever()


# ! remove logging statements
class WebsocketManager:
  network_listener_thread = None
  websocket_thread = None
  server = None
  clients = {}
  should_monitor = False

  def __init__(self, port):
    self.server = WebsocketServer(port = port)
    self.websocket_thread = Thread(target=lambda: ws_server(self.server, self.clients))
    self.websocket_thread.daemon = True
    self.websocket_thread.start()
    log_server("Started Websocket")

  def start(self):
    try:
      self.should_monitor = True

      self.network_listener_thread = Thread(target=lambda: monitor_network(self.server, self.clients, self.should_monitor))
      self.network_listener_thread.daemon = True
      self.network_listener_thread.start()
    except Exception:
      self.should_monitor = False
      error_server("Websocket Manager failed")

  def kill(self):
    self.should_monitor = False
    self.network_listener_thread = None

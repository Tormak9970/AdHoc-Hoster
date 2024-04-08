#!/bin/bash


# ! Creating / Killing hotspot
# ? Need to test if adding " --offline" works
# * seems to not work

NAME="Steamdeck"
PASSWORD="test1234"

# Starting the network:
sudo nmcli dev wifi hotspot ifname wlan0 ssid "${NAME}" password "${PASSWORD}"


# killing the network:
sudo nmcli connection down "${NAME}"



# ! Monitoring connection status (to get list of connected devices)

sudo nmcli connection monitor "${NAME}" # ? This will terminate when the connection dissapears, which would be perfect for determining when the network is killed through non plugin means

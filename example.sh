#!/bin/bash

NAME="Steamdeck"
PASSWORD="test1234"

# Starting the network:
sudo nmcli dev wifi hotspot ifname wlan0 ssid "${NAME}" password "${PASSWORD}"


# killing the network:
sudo nmcli connection down "${NAME}"

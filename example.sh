#!/bin/bash

NAME="Steamdeck"
PASSWORD="test1234"

sudo nmcli dev wifi hotspot ifname wlan0 ssid "${NAME}" password "${PASSWORD}"

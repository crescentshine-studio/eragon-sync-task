#!/bin/bash
echo 'Install dependency...'
npm install
npm install -g pm2
echo 'set environment variable...'
export EAR3_ROOT_API="https://api-testnet.eragon.gg"
export GAME_API_KEY="WMCGXNH9BIX140R"
export GAME_ID="MONSHUB"
export CHAIN_ID="97"
echo "run producer..."
pm2 start producer.js
echo "run consumer..."
pm2 start consumer.js
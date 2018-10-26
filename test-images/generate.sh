#!/usr/bin/env bash
num=0;
while [ 1 -gt 0 ]; do
	date | qrencode -o - | convert - -resize 100x100\! - > $num.png;
	let num=($num+1);
	sleep 1;
done;

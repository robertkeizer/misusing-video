#!/usr/bin/env bash
num=1;
for i in {1..100}; do
	echo "This is some example stuff: $i" |  qrencode -o - | convert - -resize 100x100\! - > $num.png;
	let num=($num+1);
done;

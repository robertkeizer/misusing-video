#!/usr/bin/env bash

# test-images/generate.sh

# Step 1 - take qr encoded data and shove it into a nc pipe
# echo "Catting all the test images and piping them into a new nc listener"
# cat test-images/*.png | nc -l 1337


# Step 2 - Connect to nc, and create a video from the input of qr codes.
# echo "Connecting to nc and creating a video from those files"
# nc localhost 1337 | ffmpeg -f image2pipe -framerate 1 -i - -c:v libx264 -vf format=yuv420p -r 25 out.mp4

# This is where you'd send it via a streaming service.

# Step 3 - Rip out the frames of the video with ffmpeg
# ffmpeg -i out.mp4 -r 1 output-images/%d.png

# Step 3 a - note that the files are not identical
# diff test-images/1.png output-images/1.png

# Step 4 - read the images back with zbarimg or similar.
# Note that these should be identical 
# zbarimg test-images/1.png
# zbarimg output-images/1.png

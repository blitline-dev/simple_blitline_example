Simple Blitline Example
=======================
This sample app demonstrates two cool features that you would probably want to do if you were building a website that handled uploading images and possibly processing those images.

##Step 1: Direct Upload to S3
The tradition image handling pipeline has the end user upload images to your server, where you run some kind of ImageMagick processing on the images, and then upload the results to S3.

This example shows you the "Blitline" way to do it. You can remove ALL image processing from your server, and never have to support image processing on your own server. 

The first step in this process is to get the original image pushed to S3. You can do this with a simple HTML form with some precomputed signatures. (It also makes the uploading very fast).

##Step 2: Process on Blitline

Once the image is uploaded to S3, you can tell Blitline what you want to have done to the image. In this particular example, we will watermark it, and resize it to fit within 140x140 pixels. Blitline will then go get the image off S3, process it, and push it into your desired bucket/key.

## Getting Started

Requirements: Ruby 2.0+, bundler, rubygems

**Install:**

- git clone https://github.com/blitline-dev/simple_blitline_example.git
- cd simple_blitline_example
- bundle install
- ruby simple.rb

This should start sinatra on port :4567, then just navigate to it in your browser

http://0.0.0.0:4567

Viola. You have all the code to upload an image and perform any amount of image processing you want on it.






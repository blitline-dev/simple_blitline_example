// ----------------------------------
// File Input Selector Code
// ----------------------------------

$(document).ready( function() {
    var uploadStart = 0;
    $('form').fileupload({
      forceIframeTransport: true,    // VERY IMPORTANT.  you will get 405 Method Not Allowed if you don't add this.
      add: function (event, data) {
        $("#Content-Type").val(data.files[0].type);
        data.submit();
      },
      send: function(e, data) {
        // show a loading spinner because now the form will be submitted to amazon,
        // and the file will be directly uploaded there, via an iframe in the background.
        $('#loading').show();
        $('.processing').text("uploading image...");
        uploadStart = new Date();
      },
      fail: function(e, data) {
        console.log(e, data, 'fail');
        console.log(data);
      },
      done: function (event, data) {
        var completedDate = new Date();
        var delta = (completedDate.getTime() - uploadStart.getTime()) / 1000;

        $(".input-group").hide();
        $("#original").show();
        $("#blitlineProcessed").show();
        $("#originalImage").attr("src", blitlineData.srcUrl);
        $("#timeTaken").text(delta.toString() + " seconds to upload directly to S3");
        
        var blitlineJson = buildBlitlineJson();
        console.log(blitlineJson);
        runBlitlineProcessing(blitlineJson);
      }
    });
});


// ----------------------------------
// S3 Upload Code
// ----------------------------------

function runBlitlineProcessing(blitlineJson) {
  var blitlineEngine = new Blitline();
  console.log("submitting");
  // Add events for handling submitted and completed  
  blitlineEngine.submit(blitlineJson, {
    completed : function(results, error) {
      blitlineCompleted(results, error);
    },
    submitted : function(results, error) {
      if (error) {
        alerts(error.toString());
      }
    }
  });
  $('.processing').text("blitline processing image...");
}

function blitlineCompleted(results, error) {
  $('#loading').hide();
  if (error) {
    alert(error.toString());
    return;
  }

  image = results[0].images[0];
  $("#blitlineImage_1").attr("src", image.s3_url);
  $("#blitlineImages").show();
}

function buildBlitlineJson() {
  var blitlineInstance = getJsonInstance(blitlineData.newKey);

  blitlineInstance.src = blitlineData.srcUrl;
  blitlineInstance.bucket = blitlineData.bucket;
  blitlineInstance.expires = blitlineData.expires;
  blitlineInstance.key_transform = blitlineData.keyTransform;
  blitlineInstance.signature = blitlineData.signature;
  blitlineInstance.public_token = blitlineData.publicToken;

  return JSON.stringify(blitlineInstance);
}

function getJsonInstance(new_key) {
  var blitlineObject = {
    "src": "",
    "functions": [{
      "name": "watermark",
      "params": {
        "text": "Blitline!"
      },
      "functions": [{
        "name": "resize_to_fit",
        "params": {
          "width": 140,
          "height": 140
        },
        "save": {
          "image_identifier": "my_large_thumbnail",
          "s3_destination": {
            "key": new_key,
            "bucket": "bltemp"
          }
        }
      }]
    }]
  };

  return blitlineObject;
}





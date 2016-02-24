// ----------------------------------
// File Input Selector Code
// ----------------------------------
$(document).on('change', '.btn-file :file', function() {
  var input = $(this),
      numFiles = input.get(0).files ? input.get(0).files.length : 1,
      label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
      input.trigger('fileselect', [numFiles, label]);
});

$(document).ready( function() {
    $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
        
        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;
        
        if( input.length ) {
            input.val(log);
        } else {
            if( log ) alert(log);
        }
    });

    setFileUploadEvent();
});


// ----------------------------------
// S3 Upload Code
// ----------------------------------
function setFileUploadEvent() {
  $('form').fileupload({
      forceIframeTransport: true,    // VERY IMPORTANT.  you will get 405 Method Not Allowed if you don't add this.
      add: function (event, data) {
        alert("add " + data.inspect);
        $("#Content-Type").val(data.files[0].type);
        data.submit();
      },
      send: function(e, data) {
        // show a loading spinner because now the form will be submitted to amazon,
        // and the file will be directly uploaded there, via an iframe in the background.
        $('#loading').show();
        $('.processing').text("uploading image...");
      },
      fail: function(e, data) {
        console.log(e, data, 'fail');
        console.log(data);
      },
      done: function (event, data) {

        //var blitlineJson = buildBlitlineJson();
        //runBlitlineProcessing(blitlineJson);
      }
    });
}

function runBlitlineProcessing(blitlineJson) {
  var blitlineEngine = new Blitline();
  console.log("submitting");
  // Add events for handling submitted and completed  
  results = blitlineEngine.submit(blitlineJson, {
    completed : function(results, error) {
      console.log("complete");
      alert("Job completed:" + JSON.stringify(results));
      blitlineCompleted(results, error);
    },
    submitted : function(results, error) {
      if (error) {
        alerts(error.toString());
      }
    }
  });
  alert(results.toString());
  $('.processing').text("blitline processing image...");
}

function blitlineCompleted(results, error) {
  alert("done");
  alert(results.toString() + error.toString());
}

function buildBlitlineJson() {
  var blitlineInstance = getJsonInstance();

  blitlineInstance.bucket = blitlineData.bucket;
  blitlineInstance.expires = blitlineData.expires;
  blitlineInstance.keyTransform = blitlineData.keyTransform;
  blitlineInstance.signature = blitlineData.signature;
  return JSON.stringify(blitlineInstance);
}

function getJsonInstance() {
  var blitlineObject = {
    "src": "",
    "functions": [{
      "name": "watermark",
      "params": {
        "text": "Blitline!"
      },
      "save": {
        "image_identifier": "watermark"
      },
      "functions": [{
        "name": "resize_to_fill",
        "params": {
          "width": 300,
          "height": 150
        },
        "save": {
          "image_identifier": "my_large_thumbnail",
          "s3_destination": {
            "key": "",
            "bucket": ""
          }
        }
      }]
    }]
  };

  return blitlineObject;
}





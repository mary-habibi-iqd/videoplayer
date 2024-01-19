let videoElement;
// Define a variable to track whether there are ads loaded and initially set it to false
let adsLoaded = false;
let adContainer;
let adDisplayContainer;
let adsLoader;
let adsManager;

window.addEventListener("load", function (event) {
  videoElement = document.getElementById("video-element");
  initializeIMA();
  videoElement.addEventListener("play", function (event) {
    loadAds(event);
  });
  const playButton = document.getElementById("play-button");
  playButton.addEventListener("click", function (event) {
    videoElement.play();
  });
});

window.addEventListener("resize", function (event) {
  console.log("window resized");
  if (adsManager) {
    const width = videoElement.clientWidth;
    const height = videoElement.clientHeight;
    adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
  }
});

function initializeIMA() {
  console.log("initializing IMA");
  adContainer = document.getElementById("ad-container");
  adContainer.addEventListener("click", adContainerClick);

  adDisplayContainer = new google.ima.AdDisplayContainer(
    adContainer,
    videoElement
  );
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);

  adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded,
    false
  );
  adsLoader.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError,
    false
  );

  // Let the AdsLoader know when the video has ended
  videoElement.addEventListener("ended", function () {
    adsLoader.contentComplete();
  });

  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl =
    "https://pubads.g.doubleclick.net/gampad/ads?" +
    "iu=/183/ariva/videoplayer" +
    "&description_url=http%3A%2F%2Fwww.google.de" +
    "&cust_params=kw%3Dtest_mary_ulf" +
    "&tfcd=0" +
    "&npa=0" +
    "&sz=16x9%7C480x360%7C640x360%7C640x480" +
    "&gdfp_req=1" +
    "&output=vast" +
    "&env=vp" +
    "&unviewed_position_start=1" +
    "&impl=s" +
    "&correlator=";
 
  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = videoElement.clientWidth;
  adsRequest.linearAdSlotHeight = videoElement.clientHeight;
  adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
  adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

  // Pass the request to the adsLoader to request ads
  adsLoader.requestAds(adsRequest);
}

function adContainerClick(event) {
  console.log("ad container clicked");
  if (videoElement.paused) {
    videoElement.play();
  } else {
    videoElement.pause();
  }
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Instantiate the AdsManager from the adsLoader response and pass it the video element
  adsManager = adsManagerLoadedEvent.getAdsManager(videoElement);
  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(
    google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
    onContentPauseRequested
  );
  adsManager.addEventListener(
    google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
    onContentResumeRequested
  );

  adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdLoaded);
}

function onAdLoaded(adEvent) {
  var ad = adEvent.getAd();
  if (!ad.isLinear()) {
    videoElement.play();
  }
}
function onContentPauseRequested() {
  videoElement.pause();
}

function onContentResumeRequested() {
  videoElement.play();
}

function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log(adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
}

function loadAds(event) {
  // Prevent this function from running on if there are already ads loaded
  if (adsLoaded) {
    return;
  }
  adsLoaded = true;

  // Prevent triggering immediate playback when ads are loading
  event.preventDefault();

  console.log("loading ads");

  // Initialize the container. Must be done via a user action on mobile devices.
  videoElement.load();
  adDisplayContainer.initialize();

  const width = videoElement.clientWidth;
  const height = videoElement.clientHeight;
  try {
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    // Play the video without ads, if an error occurs
    console.log("AdsManager could not be started");
    videoElement.play();
  }
}

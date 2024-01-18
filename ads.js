var videoElement;
// Define a variable to track whether there are ads loaded and initially set it to false
var adsLoaded = false;
var adContainer;
var adDisplayContainer;
var adsLoader;
var adsManager;

window.addEventListener("load", function (event) {
  videoElement = document.getElementById("video-element");
  initializeIMA();
  videoElement.addEventListener("play", function (event) {
    loadAds(event);
  });
  var playButton = document.getElementById("play-button");
  playButton.addEventListener("click", function (event) {
    videoElement.play();
  });
});

window.addEventListener("resize", function (event) {
  console.log("window resized");
  if (adsManager) {
    var width = videoElement.clientWidth;
    var height = videoElement.clientHeight;
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

  var adsRequest = new google.ima.AdsRequest();
  const baseURL = "https://pubads.g.doubleclick.net/gampad/ads?";
  const commonQueries =
    "&gdfp_req=1" +
    "&output=vast" +
    "&env=instream" +
    "&unviewed_position_start=1" +
    "&impl=s" +
    "&correlator=";

  const commonGeneratedQueries =
    "&description_url=http%3A%2F%2Fgoogle.com&tfcd=0&npa=0";
  const urlMaryUlfTest =
    baseURL +
    "iu=/183/ariva/videoplayer" +
    "&sz=16x9v" +
    commonGeneratedQueries;
  "&kw=test_mary_ulf" + commonQueries;
  console.log(urlMaryUlfTest);

  const urlNew =
    baseURL + "iu=/183/ariva" + "&sz=16x9" + commonGeneratedQueries;
  "&kw=test_mary_ulf" + commonQueries;

  const urlPlamena =
    baseURL +
    "iu=/183/iqdspiegel/videoplayer" +
    "&sz=16x9%7C480x360%7C640x360%7C640x480"+
    "&cust_params=pos%3Dpre%26kw%3Diqadtile169%2C" +
    "live" +
    "%26player%3Dstandard" +
    "&impl=s" +
    "&gdfp_req=1" +
    "&env=vp" +
    "&output=vast" +
    "&unviewed_position_start=1" +
    "&vpos=preroll" +
    "&url=https%3A%2F%2Fwww.spiegel.de" +
    "&description_url=https%3A%2F%2Fwww.spiegel.de" +
    "&correlator=";

  const urlGoogleFormatted =
    baseURL +
    "iu=/21775744923/external/single_ad_samples" +
    "&sz=640x480" +
    "&cust_params=sample_ct%3Dlinear" +
    "&ciu_szs=300x250%2C728x90" +
    commonQueries;

  console.log(urlGoogleFormatted);

  const urlGoogleUnformatted =
    "https://pubads.g.doubleclick.net/gampad/ads?" +
    "iu=/21775744923/external/single_ad_samples&sz=640x480&" +
    "cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&" +
    "gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=";

  adsRequest.adTagUrl = urlPlamena;
  console.log(adsRequest.adTagUrl);

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

  var width = videoElement.clientWidth;
  var height = videoElement.clientHeight;
  try {
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    // Play the video without ads, if an error occurs
    console.log("AdsManager could not be started");
    videoElement.play();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const launchScreen = document.getElementById('launch-screen');
  const videoTheater = document.getElementById('video-theater');
  const startBtn = document.getElementById('start-btn');
  const backBtn = document.getElementById('back-btn');
  const mainVideo = document.getElementById('main-video');
  const pipBtn = document.getElementById('pip-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  // Handle clicking the big play button
  startBtn.addEventListener('click', async () => {
    // 1. Transition out launcher
    launchScreen.classList.add('fade-out');

    setTimeout(async () => {
      launchScreen.classList.add('hidden');
      videoTheater.classList.remove('hidden');
      videoTheater.setAttribute('aria-hidden', 'false');

      // Scroll to top or center smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 2. Play video automatically
      try {
        mainVideo.currentTime = 0;
        const playPromise = mainVideo.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (error) {
        console.warn('Playback error or policy blocked autoplay with sound:', error);
        // Fallback: try muted if strict policy, then let user unmute
        try {
          mainVideo.muted = true;
          await mainVideo.play();
          mainVideo.muted = false; // Attempt immediate unmuting since this was triggered by user click
        } catch (innerErr) {
          console.error('Playback fallback error:', innerErr);
        }
      }
    }, 380);
  });

  // Handle Return / Back button
  backBtn.addEventListener('click', () => {
    // Pause video when leaving
    mainVideo.pause();

    videoTheater.classList.add('hidden');
    videoTheater.setAttribute('aria-hidden', 'true');
    launchScreen.classList.remove('hidden');

    // Trigger re-fade-in
    setTimeout(() => {
      launchScreen.classList.remove('fade-out');
    }, 20);
  });

  // Picture in Picture
  if ('pictureInPictureEnabled' in document) {
    pipBtn.addEventListener('click', async () => {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await mainVideo.requestPictureInPicture();
        }
      } catch (err) {
        console.error('PiP failed:', err);
      }
    });
  } else {
    pipBtn.style.display = 'none';
  }

  // Fullscreen Toggle
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      if (mainVideo.requestFullscreen) {
        mainVideo.requestFullscreen();
      } else if (mainVideo.webkitRequestFullscreen) {
        mainVideo.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  // When video ends, show brief cue or stay paused ready for replay
  mainVideo.addEventListener('ended', () => {
    console.log('Video finished playing');
  });
});
